import { describe, expect, it } from "vitest";
import { mapPaymentStatusToUi } from "@/server/services/payments-service";

describe("payment status mapping", () => {
  it("maps known statuses to explicit UI labels", () => {
    expect(mapPaymentStatusToUi("paid")).toBe("SUCCEEDED");
    expect(mapPaymentStatusToUi("failed")).toBe("FAILED");
    expect(mapPaymentStatusToUi("refunded")).toBe("REFUNDED");
    expect(mapPaymentStatusToUi("disputed")).toBe("DISPUTED");
    expect(mapPaymentStatusToUi("expired")).toBe("EXPIRED");
    expect(mapPaymentStatusToUi("processing")).toBe("PENDING");
  });

  it("falls back unknown statuses to pending", () => {
    expect(mapPaymentStatusToUi("anything_else")).toBe("PENDING");
  });
});
