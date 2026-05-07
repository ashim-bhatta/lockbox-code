import { describe, expect, it } from "vitest";
import { backoffMinutes } from "@/server/services/webhook-service";

describe("webhook reliability helpers", () => {
  it("uses exponential backoff with 60 minute cap", () => {
    expect(backoffMinutes(1)).toBe(2);
    expect(backoffMinutes(2)).toBe(4);
    expect(backoffMinutes(3)).toBe(8);
    expect(backoffMinutes(6)).toBe(60);
    expect(backoffMinutes(10)).toBe(60);
  });

  it("treats invalid or low attempts safely", () => {
    expect(backoffMinutes(0)).toBe(2);
    expect(backoffMinutes(-5)).toBe(2);
  });
});
