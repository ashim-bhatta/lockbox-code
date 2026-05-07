import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { DashboardLockbox, DashboardStats } from "@/components/dashboard/types";
import { centsToUsdLabel, toDashboardDateLabel } from "@/server/mappers/format";
import type { Delivery } from "@/types";
import { getDeliveryLink } from "@/lib/links";

type PaymentStatusRow = {
  delivery_id: string;
  status: string;
};

type PaymentNetRow = {
  delivery_id: string;
  net_amount_cents: number | null;
  status: string;
};

export async function getDashboardSummaryForUser(userId: string): Promise<DashboardStats> {
  const supabase = await getSupabaseServerClient();
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("id,status_reason")
    .eq("user_id", userId);

  const deliveryRows = (deliveries || []) as Array<{ id: string; status_reason: string | null }>;
  const deliveryIds = deliveryRows.map((d) => d.id);

  const { data: payments } = deliveryIds.length
    ? await supabase
        .from("payments")
        .select("delivery_id,net_amount_cents,tip_amount_cents,status")
        .in("delivery_id", deliveryIds)
    : { data: [] as Array<{ delivery_id: string; net_amount_cents: number | null; tip_amount_cents: number | null; status: string }> };

  const paymentRows = (payments || []) as Array<{
    delivery_id: string;
    net_amount_cents: number | null;
    tip_amount_cents: number | null;
    status: string;
  }>;

  const paidPayments = paymentRows.filter((p) => p.status === "paid");
  const totalRevenue = paidPayments.reduce((acc, p) => acc + (p.net_amount_cents || 0), 0);
  const totalTips = paidPayments.reduce((acc, p) => acc + (p.tip_amount_cents || 0), 0);
  const paidByDelivery = new Set(paidPayments.map((p) => p.delivery_id));

  const activeLinks = deliveryRows.filter((d) => d.status_reason !== "disabled_by_owner" && !paidByDelivery.has(d.id)).length;

  return {
    totalRevenueLabel: centsToUsdLabel(totalRevenue),
    activeLinksLabel: String(activeLinks),
    totalTipsLabel: centsToUsdLabel(totalTips),
  };
}

export async function getRecentDashboardLockboxes(userId: string): Promise<DashboardLockbox[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  const deliveries = (data || []) as Delivery[];
  const ids = deliveries.map((d) => d.id);
  const { data: payments } = ids.length
    ? await supabase.from("payments").select("delivery_id,status").in("delivery_id", ids)
    : { data: [] as PaymentStatusRow[] };

  const paymentRows = (payments || []) as PaymentStatusRow[];
  const paidByDelivery = new Set(paymentRows.filter((p) => p.status === "paid").map((p) => String(p.delivery_id)));

  return deliveries.map((item) => ({
    id: item.id,
    title: item.title,
    fileSize: item.preview_url ? "Preview attached" : "No preview",
    priceLabel: centsToUsdLabel(item.price_cents),
    priceCents: item.price_cents,
    createdLabel: toDashboardDateLabel(item.created_at),
    createdAt: item.created_at,
    status: paidByDelivery.has(item.id)
      ? "paid"
      : item.status_reason === "disabled_by_owner"
        ? "disabled"
        : "pending",
    icon: item.preview_url ? "image" : "lock",
    previewText: item.preview_text || "",
    previewUrl: item.preview_url || "",
    secureLink: item.secure_link,
    platformFeePercent: item.platform_fee_percent,
    requiresPassword: Boolean(item.requires_password),
    isListed: Boolean((item as Delivery & { is_listed?: boolean }).is_listed),
  }));
}

export async function getLockboxListRows(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  const deliveries = (data || []) as Delivery[];

  const deliveryIds = deliveries.map((d) => d.id);
  const { data: payments } = deliveryIds.length
    ? await supabase
        .from("payments")
        .select("delivery_id,net_amount_cents,status")
        .in("delivery_id", deliveryIds)
    : { data: [] as PaymentNetRow[] };

  const earnedByDelivery = new Map<string, number>();
  const paidCountByDelivery = new Map<string, number>();
  const paymentNetRows = (payments || []) as PaymentNetRow[];
  for (const row of paymentNetRows) {
    const id = String(row.delivery_id);
    if (row.status === "paid") {
      earnedByDelivery.set(id, (earnedByDelivery.get(id) || 0) + (row.net_amount_cents || 0));
      paidCountByDelivery.set(id, (paidCountByDelivery.get(id) || 0) + 1);
    }
  }

  return deliveries.map((item) => {
    const earnedCents = earnedByDelivery.get(item.id) || 0;
    const paidCount = paidCountByDelivery.get(item.id) || 0;
    const disabled = item.status_reason === "disabled_by_owner";
    const status = disabled ? ("disabled" as const) : paidCount > 0 ? ("active" as const) : ("waiting" as const);

    return {
      id: item.id,
      name: item.title,
      details: `${item.preview_url ? "Preview URL" : "No preview"} • ${toDashboardDateLabel(item.created_at)}`,
      price: centsToUsdLabel(item.price_cents),
      earned: centsToUsdLabel(earnedCents),
      status,
      icon: item.preview_url ? ("image" as const) : ("lock" as const),
      createdAt: item.created_at,
      shareUrl: getDeliveryLink(item.id),
      priceCents: item.price_cents,
      previewText: item.preview_text || "",
      previewUrl: item.preview_url || "",
      secureLink: item.secure_link,
      platformFeePercent: item.platform_fee_percent,
      requiresPassword: Boolean(item.requires_password),
      isListed: Boolean((item as Delivery & { is_listed?: boolean }).is_listed),
    };
  });
}
