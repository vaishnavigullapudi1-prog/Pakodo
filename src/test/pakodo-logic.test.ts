import { describe, expect, it } from "vitest";
import { extractRequest } from "@/lib/extract";
import { groupByProduct, repeatedDemand } from "@/lib/insights";
import type { DemandRequest } from "@/lib/pakodo-types";

describe("extractRequest", () => {
  it("pulls the product from the example sentence", () => {
    expect(extractRequest("A customer asked for millet flour, but it is not available.").product).toBe("Millet Flour");
  });
  it("pulls quantity and customer", () => {
    const r = extractRequest("Ravi asked for 2 kg ragi flour");
    expect(r).toEqual({ product: "Ragi Flour", customer: "Ravi", quantity: "2 kg" });
  });
  it("falls back to the whole text", () => {
    expect(extractRequest("jaggery powder").product).toBe("Jaggery Powder");
  });
});

const req = (product: string, status: "pending" | "stocked" = "pending"): DemandRequest => ({
  id: product + Math.random(), product, status, createdAt: new Date().toISOString(),
});

describe("insights", () => {
  it("groups case-insensitively and counts repeats", () => {
    const g = groupByProduct([req("Millet Flour"), req("millet flour"), req("Oats")]);
    expect(g[0]?.count).toBe(2);
    expect(repeatedDemand([req("Millet Flour"), req("millet flour"), req("Oats")]).map((p) => p.key)).toEqual(["millet flour"]);
  });
});
