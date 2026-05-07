import type { Delivery } from "../../types";

export type ShouldExposeSecureLinkInput = Pick<Delivery, "status" | "payment_status">;

export function shouldExposeSecureLink(delivery: ShouldExposeSecureLinkInput) {
  return (
    (delivery.payment_status === "paid" || delivery.status === "paid") &&
    delivery.payment_status !== "refunded" &&
    delivery.payment_status !== "disputed"
  );
}

