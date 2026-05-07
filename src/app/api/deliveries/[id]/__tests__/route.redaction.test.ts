import { describe, expect, it } from "vitest";
import { shouldExposeSecureLink } from "@/server/logic/delivery-access";

describe("delivery secure-link redaction", () => {
  it("exposes secure link for paid deliveries", () => {
    expect(
      shouldExposeSecureLink({
        status: "paid",
        payment_status: "paid",
      })
    ).toBe(true);
  });

  it("hides secure link for unpaid delivery", () => {
    expect(
      shouldExposeSecureLink({
        status: "pending",
        payment_status: "pending",
      })
    ).toBe(false);
  });

  it("hides secure link for refunded/disputed even if historically paid", () => {
    expect(
      shouldExposeSecureLink({
        status: "paid",
        payment_status: "refunded",
      })
    ).toBe(false);

    expect(
      shouldExposeSecureLink({
        status: "paid",
        payment_status: "disputed",
      })
    ).toBe(false);
  });
});
