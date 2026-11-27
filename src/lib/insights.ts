import type { DemandRequest } from "./pakodo-types";

export interface ProductDemand {
  key: string;
  product: string;
  count: number;
  pending: number;
  lastAt: string;
}

export function normalizeProduct(p: string): string {
  return p.trim().toLowerCase().replace(/\s+/g, " ").replace(/s$/, "");
}

export function groupByProduct(reqs: DemandRequest[]): ProductDemand[] {
  const map = new Map<string, ProductDemand>();
  for (const r of reqs) {
    const key = normalizeProduct(r.product);
    if (!key) continue;
    const cur = map.get(key);
    if (cur) {
      cur.count += 1;
      if (r.status === "pending") cur.pending += 1;
      if (r.createdAt > cur.lastAt) cur.lastAt = r.createdAt;
    } else {
      map.set(key, {
        key,
        product: r.product.trim(),
        count: 1,
        pending: r.status === "pending" ? 1 : 0,
        lastAt: r.createdAt,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.lastAt.localeCompare(a.lastAt));
}

export function repeatedDemand(reqs: DemandRequest[]): ProductDemand[] {
  return groupByProduct(reqs).filter((p) => p.count >= 2);
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Requests per day for the last `days` days, oldest first. */
export function dailyCounts(reqs: DemandRequest[], days: number, now: Date = new Date()) {
  const out: { day: string; label: string; count: number }[] = [];
  const counts = new Map<string, number>();
  for (const r of reqs) {
    const k = dayKey(new Date(r.createdAt));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const k = dayKey(d);
    out.push({
      day: k,
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      count: counts.get(k) ?? 0,
    });
  }
  return out;
}

export function countSince(reqs: DemandRequest[], days: number, now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)).getTime();
  return reqs.filter((r) => new Date(r.createdAt).getTime() >= start).length;
}
