import { describe, expect, it } from "vitest";
import { getPlan, PlanLimitError, plans, withinLimit } from "@/lib/plans";

describe("plans", () => {
  it("has Free, Pro and Business in price order", () => {
    expect(plans.map((p) => p.id)).toEqual(["free", "pro", "business"]);
    expect(plans.map((p) => p.priceMonthly)).toEqual([...plans.map((p) => p.priceMonthly)].sort((a, b) => a - b));
  });

  it("allows 3 projects on Free and stops the 4th", () => {
    expect(withinLimit("free", "projects", 2)).toBe(true);
    expect(withinLimit("free", "projects", 3)).toBe(false);
  });

  it("treats null as unlimited", () => {
    expect(getPlan("business").limits.projects).toBeNull();
    expect(withinLimit("business", "projects", 1_000_000)).toBe(true);
  });

  it("falls back to Free for unknown or missing plans", () => {
    expect(getPlan(undefined).id).toBe("free");
    expect(getPlan("enterprise").id).toBe("free");
  });

  it("explains the limit in the error", () => {
    expect(new PlanLimitError("projects", "free").message).toMatch(/Free plan allows 3 projects/);
  });
});
