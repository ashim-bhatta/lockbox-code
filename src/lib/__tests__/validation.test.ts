import { describe, expect, it } from "vitest";
import { asInteger, asNonEmptyString, asOptionalInteger, asOptionalString } from "@/lib/validation";

describe("validation helpers", () => {
  it("validates required strings", () => {
    expect(asNonEmptyString(" hello ", "title")).toBe("hello");
    expect(() => asNonEmptyString("", "title")).toThrow();
  });

  it("validates optional strings", () => {
    expect(asOptionalString(undefined, "preview")).toBeUndefined();
    expect(asOptionalString("ok", "preview")).toBe("ok");
    expect(() => asOptionalString(42, "preview")).toThrow();
  });

  it("validates integer ranges", () => {
    expect(asInteger(5, "tip", 0, 10)).toBe(5);
    expect(() => asInteger(11, "tip", 0, 10)).toThrow();
    expect(asOptionalInteger(undefined, "fee", 5, 20, 5)).toBe(5);
  });
});
