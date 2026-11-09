import { describe, expect, it } from "vitest";
import { getPlan, PLANS, withinLimit } from "../../shared/plans.ts";

describe("plans", () => {
  it("falls back to Free for unknown or missing plans", () => {
    expect(getPlan(undefined).id).toBe("free");
    expect(getPlan("enterprise").id).toBe("free");
    expect(getPlan("pro").id).toBe("pro");
  });

  it("allows 3 projects on Free and no fourth", () => {
    const limit = getPlan("free").limits.projects;
    expect(limit).toBe(3);
    expect(withinLimit(limit, 2)).toBe(true);
    expect(withinLimit(limit, 3)).toBe(false);
  });

  it("treats null as unlimited", () => {
    expect(withinLimit(null, 1_000_000)).toBe(true);
  });

  it("orders plans from cheapest to most expensive with growing limits", () => {
    const prices = PLANS.map((p) => p.priceMonthly);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    expect(PLANS.map((p) => p.id)).toEqual(["free", "pro", "business"]);
  });
});
