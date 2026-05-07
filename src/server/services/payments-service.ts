import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToUsdLabel, toDashboardDateLabel } from "@/server/mappers/format";

export function mapPaymentStatusToUi(
  status: string
): "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED" | "EXPIRED" {
  if (status === "paid") return "SUCCEEDED";
  if (status === "failed") return "FAILED";
  if (status === "refunded") return "REFUNDED";
  if (status === "disputed") return "DISPUTED";
  if (status === "expired") return "EXPIRED";
  return "PENDING";
}

export type PaymentTxRow = {
  id: string;
  date: string;
  client: string;
  lockbox: string;
  gross: string;
  fees: string;
  net: string;
  status: ReturnType<typeof mapPaymentStatusToUi>;
};

export async function getPaymentsSummary(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("payments")
    .select("gross_amount_cents,net_amount_cents,status,created_at, deliveries!inner(user_id)")
    .eq("deliveries.user_id", userId);

  const rows = data || [];
  const pending = rows
    .filter((r) => r.status === "pending" || r.status === "processing")
    .reduce((acc, r) => acc + (r.net_amount_cents || 0), 0);
  const nextPayout = rows
    .filter((r) => r.status === "paid")
    .slice(0, 3)
    .reduce((acc, r) => acc + (r.net_amount_cents || 0), 0);
  return {
    pendingBalanceLabel: centsToUsdLabel(pending),
    nextPayoutLabel: centsToUsdLabel(nextPayout),
    nextPayoutDateLabel: toDashboardDateLabel(new Date().toISOString()),
  };
}

export async function getPaymentTransactions(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("payments")
    .select("*, deliveries!inner(user_id,title)")
    .eq("deliveries.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);

  return (data || []).map((row): PaymentTxRow => {
    const typed = row as {
      id: string;
      created_at: string;
      status: string;
      client_email?: string | null;
      gross_amount_cents: number;
      fee_amount_cents: number;
      net_amount_cents: number;
      deliveries?: { title?: string | null };
    };
    return {
      id: typed.id,
      date: toDashboardDateLabel(typed.created_at),
      client: typed.client_email || "Unknown client",
      lockbox: typed.deliveries?.title || "Untitled lockbox",
      gross: centsToUsdLabel(typed.gross_amount_cents || 0),
      fees: `-${centsToUsdLabel(typed.fee_amount_cents || 0)}`,
      net: centsToUsdLabel(typed.net_amount_cents || 0),
      status: mapPaymentStatusToUi(typed.status),
    };
  });
}
