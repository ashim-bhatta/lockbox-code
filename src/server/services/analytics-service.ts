import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToUsdLabel } from "@/server/mappers/format";

type Range = { from?: string; to?: string };

function parseRange(range?: Range) {
  const defaultTo = new Date();
  const defaultFrom = new Date(defaultTo.getTime() - 29 * 24 * 60 * 60 * 1000);
  const fromDate = range?.from ? new Date(`${range.from}T00:00:00.000Z`) : defaultFrom;
  const toDate = range?.to ? new Date(`${range.to}T23:59:59.999Z`) : defaultTo;
  return { fromDate, toDate };
}

function isoDay(iso: string) {
  return String(iso).slice(0, 10);
}

type PaymentRow = {
  created_at: string;
  delivery_id: string;
  status: string;
  net_amount_cents: number | null;
  tip_amount_cents: number | null;
  gross_amount_cents: number | null;
};

export async function getAnalyticsData(userId: string, range?: Range) {
  const supabase = await getSupabaseServerClient();
  const { fromDate, toDate } = parseRange(range);

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("id,title,view_count")
    .eq("user_id", userId);

  const deliveryRows = (deliveries || []) as Array<{
    id: string;
    title: string | null;
    view_count: number | null;
  }>;
  const deliveryIds = deliveryRows.map((d) => d.id);

  const { data: payments } = deliveryIds.length
    ? await supabase
        .from("payments")
        .select("created_at,delivery_id,status,net_amount_cents,tip_amount_cents,gross_amount_cents")
        .in("delivery_id", deliveryIds)
    : { data: [] as PaymentRow[] };

  const paymentRows = (payments || []) as PaymentRow[];

  const rangedPayments = paymentRows.filter((p) => {
    const when = new Date(p.created_at);
    return when >= fromDate && when <= toDate;
  });

  const viewsTotal = deliveryRows.reduce((acc, d) => acc + (d.view_count || 0), 0);
  const paid = rangedPayments.filter((p) => p.status === "paid");
  const purchasesPaid = paid.length;
  const conversion = viewsTotal > 0 ? (purchasesPaid / viewsTotal) * 100 : 0;

  const revenueTotal = paid.reduce((acc, p) => acc + (p.net_amount_cents || 0), 0);
  const totalTip = paid.reduce((acc, p) => acc + (p.tip_amount_cents || 0), 0);
  const totalGross = paid.reduce((acc, p) => acc + (p.gross_amount_cents || 0), 0);
  const avgTipPct = totalGross > 0 ? (totalTip / totalGross) * 100 : 0;

  const netByDelivery = new Map<string, number>();
  const purchasesByDelivery = new Map<string, number>();
  for (const row of paid) {
    netByDelivery.set(row.delivery_id, (netByDelivery.get(row.delivery_id) || 0) + (row.net_amount_cents || 0));
    purchasesByDelivery.set(row.delivery_id, (purchasesByDelivery.get(row.delivery_id) || 0) + 1);
  }

  let topDeliveryId: string | null = null;
  let topNet = 0;
  for (const [deliveryId, net] of netByDelivery.entries()) {
    if (net > topNet) {
      topNet = net;
      topDeliveryId = deliveryId;
    }
  }
  const topDelivery = topDeliveryId ? deliveryRows.find((d) => d.id === topDeliveryId) : null;

  const dailyNet = new Map<string, number>();
  for (const row of paid) {
    const day = isoDay(row.created_at);
    dailyNet.set(day, (dailyNet.get(day) || 0) + (row.net_amount_cents || 0));
  }
  const revenueSeries = Array.from(dailyNet.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([x, y]) => ({ x, y }));

  const lockboxPerformance = Array.from(purchasesByDelivery.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([, count]) => count);

  return {
    metrics: {
      averageTipPercentLabel: `${avgTipPct.toFixed(1)}%`,
      conversionRateLabel: `${conversion.toFixed(1)}%`,
      topPerformingLabel: topDelivery?.title ? `Top: ${topDelivery.title}` : "Top lockbox",
      topPerformingValueLabel: centsToUsdLabel(topNet),
    },
    charts: {
      revenueTotalLabel: centsToUsdLabel(revenueTotal),
      revenueSeries,
      lockboxPerformance,
    },
  };
}
