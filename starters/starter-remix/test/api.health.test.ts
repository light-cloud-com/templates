import { describe, expect, it } from "vitest";
import { loader } from "~/routes/api.health";

describe("GET /api/health", () => {
  it("answers ok", async () => {
    const response = loader();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
