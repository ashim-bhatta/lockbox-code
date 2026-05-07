import type { PublicDelivery } from "@/types";

type ApiErrorShape = { error?: string; code?: string };

function hasError(payload: unknown): payload is ApiErrorShape {
  return typeof payload === "object" && payload !== null && "error" in payload;
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  const payload = (await res.json()) as T | ApiErrorShape;
  if (!res.ok || (hasError(payload) && payload.error)) {
    const message = (hasError(payload) && payload.error) || "Request failed.";
    const error = new Error(message) as Error & { code?: string };
    if (hasError(payload) && payload.code) {
      error.code = payload.code;
    }
    throw error;
  }
  return payload as T;
}

export async function fetchPublicDelivery(deliveryId: string, password?: string) {
  const query = password ? `?password=${encodeURIComponent(password)}` : "";
  const res = await fetch(`/api/deliveries/${deliveryId}${query}`, { cache: "no-store" });
  return parseApiResponse<PublicDelivery>(res);
}

export async function createCheckoutSession(deliveryId: string, tipAmountCents: number, password?: string, email?: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      delivery_id: deliveryId,
      tip_amount_cents: tipAmountCents,
      password,
      email,
    }),
  });

  return parseApiResponse<{ checkout_url: string }>(res);
}

export async function requestRestoreCode(deliveryId: string, email: string) {
  const res = await fetch(`/api/deliveries/${deliveryId}/restore/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseApiResponse<{ ok: true }>(res);
}

export async function verifyRestoreCode(deliveryId: string, email: string, otp: string) {
  const res = await fetch(`/api/deliveries/${deliveryId}/restore/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return parseApiResponse<{ ok: true }>(res);
}
