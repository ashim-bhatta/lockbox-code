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

export type LockboxAnalyticsPayload = {
  meta: {
    id: string;
    title: string;
    created_at: string;
    usage_limit: number | null;
    purchase_count: number;
    view_count: number;
    status_reason: string | null;
  };
  metrics: {
    views: number;
    checkouts_started: number;
    purchases_paid: number;
    unique_buyers: number;
    conversion_rate_label: string;
    net_revenue_label: string;
    tips_total_label: string;
    refunds_count: number;
    disputes_count: number;
    usage_progress_label: string;
  };
  series: Array<{ date: string; net_cents: number; purchases_count: number }>;
  transactions: Array<{
    created_at: string;
    client_email: string | null;
    net_amount_cents: number;
    tip_amount_cents: number;
    status: string;
    stripe_checkout_session_id: string | null;
  }>;
};

export async function getLockboxAnalyticsData(userId: string, deliveryId: string, range?: Range): Promise<LockboxAnalyticsPayload> {
  const supabase = await getSupabaseServerClient();
  const { fromDate, toDate } = parseRange(range);

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id,title,created_at,usage_limit,purchase_count,view_count,status_reason")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!delivery?.id) {
    throw new Error("Lockbox not found.");
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("created_at,status,net_amount_cents,tip_amount_cents,client_email,stripe_checkout_session_id")
    .eq("delivery_id", deliveryId)
    .order("created_at", { ascending: false })
    .limit(2000);

  const paymentRows = (payments || []) as Array<{
    created_at: string;
    status: string;
    net_amount_cents: number | null;
    tip_amount_cents: number | null;
    client_email: string | null;
    stripe_checkout_session_id: string | null;
  }>;

  const ranged = paymentRows.filter((p) => {
    const when = new Date(p.created_at);
    return when >= fromDate && when <= toDate;
  });

  const views = typeof delivery.view_count === "number" ? delivery.view_count : 0;
  const checkoutsStarted = ranged.filter((p) => p.status === "processing").length;
  const paid = ranged.filter((p) => p.status === "paid");
  const refunds = ranged.filter((p) => p.status === "refunded").length;
  const disputes = ranged.filter((p) => p.status === "disputed").length;

  const purchasesPaid = paid.length;
  const uniqueBuyers = new Set(paid.map((p) => p.client_email).filter(Boolean) as string[]).size;
  const conversion = views > 0 ? (purchasesPaid / views) * 100 : 0;

  const netRevenue = paid.reduce((acc, p) => acc + (p.net_amount_cents || 0), 0);
  const tipsTotal = paid.reduce((acc, p) => acc + (p.tip_amount_cents || 0), 0);

  const daily = new Map<string, { net: number; purchases: number }>();
  for (const p of paid) {
    const day = isoDay(p.created_at);
    const current = daily.get(day) || { net: 0, purchases: 0 };
    current.net += p.net_amount_cents || 0;
    current.purchases += 1;
    daily.set(day, current);
  }

  const series = Array.from(daily.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, value]) => ({ date, net_cents: value.net, purchases_count: value.purchases }));

  const usageLimit = typeof delivery.usage_limit === "number" ? delivery.usage_limit : null;
  const purchaseCount = typeof delivery.purchase_count === "number" ? delivery.purchase_count : 0;
  const usageProgressLabel = usageLimit ? `${purchaseCount}/${usageLimit}` : `${purchaseCount}/∞`;

  return {
    meta: {
      id: String(delivery.id),
      title: String(delivery.title || "Untitled lockbox"),
      created_at: String(delivery.created_at),
      usage_limit: usageLimit,
      purchase_count: purchaseCount,
      view_count: views,
      status_reason: (delivery.status_reason as string | null) || null,
    },
    metrics: {
      views,
      checkouts_started: checkoutsStarted,
      purchases_paid: purchasesPaid,
      unique_buyers: uniqueBuyers,
      conversion_rate_label: `${conversion.toFixed(1)}%`,
      net_revenue_label: centsToUsdLabel(netRevenue),
      tips_total_label: centsToUsdLabel(tipsTotal),
      refunds_count: refunds,
      disputes_count: disputes,
      usage_progress_label: usageProgressLabel,
    },
    series,
    transactions: ranged
      .slice(0, 40)
      .map((p) => ({
        created_at: p.created_at,
        client_email: p.client_email,
        net_amount_cents: p.net_amount_cents || 0,
        tip_amount_cents: p.tip_amount_cents || 0,
        status: p.status,
        stripe_checkout_session_id: p.stripe_checkout_session_id,
      })),
  };
}
