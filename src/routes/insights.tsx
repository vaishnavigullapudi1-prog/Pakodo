import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/pakodo/PageHeader";
import { Button } from "@/components/ui/button";
import { countSince, dailyCounts, groupByProduct, repeatedDemand } from "@/lib/insights";
import { clearSampleRequests, loadSampleData, useRequests } from "@/lib/pakodo-store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Demand insights — PAKODO" },
      { name: "description", content: "See which unavailable products customers ask for most." },
      { property: "og:title", content: "Demand insights — PAKODO" },
      { property: "og:description", content: "See which unavailable products customers ask for most." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const requests = useRequests();
  const [range, setRange] = useState<7 | 28>(7);
  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const top = useMemo(() => groupByProduct(pending).slice(0, 8), [pending]);
  const repeated = useMemo(() => repeatedDemand(requests), [requests]);
  const days = useMemo(() => dailyCounts(requests, range), [requests, range]);
  const weeks = useMemo(() => {
    if (range === 7) return null;
    return [0, 1, 2, 3].map((w) => days.slice(w * 7, w * 7 + 7).reduce((s, d) => s + d.count, 0));
  }, [days, range]);
  const max = Math.max(1, ...days.map((d) => d.count));
  const hasSample = requests.some((r) => r.sample);

  return (
    <div className="space-y-5">
      <PageHeader title="Insights" subtitle="Based only on requests saved on this device" />

      {hasSample && (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4">
          <Info className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="font-semibold">Includes sample data</p>
            <p className="text-sm text-muted-foreground">Sample requests are for trying the app and are marked in History.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={clearSampleRequests}>Remove sample data</Button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center">
          <p className="text-lg">No requests yet, so there's nothing to show.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild size="lg" className="h-12"><Link to="/record">Record a request</Link></Button>
            <Button variant="outline" size="lg" className="h-12" onClick={loadSampleData}>Try with sample data</Button>
          </div>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-3">
            <Card label="Total requests" value={requests.length} />
            <Card label="Today" value={countSince(requests, 1)} />
            <Card label="This week" value={countSince(requests, 7)} />
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-xl font-bold">Most requested (still pending)</h2>
            <p className="mb-3 text-sm text-muted-foreground">Products customers asked for that you haven't marked as stocked.</p>
            {top.length === 0 ? (
              <p className="text-muted-foreground">Everything requested is marked as stocked. 🎉</p>
            ) : (
              <ul className="space-y-3">
                {top.map((p) => (
                  <li key={p.key}>
                    <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <span className="truncate text-lg font-semibold">{p.product}</span>
                      <span className="font-bold text-primary">{p.count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted">
                      <div className="h-3 rounded-full bg-gradient-primary" style={{ width: `${(p.count / (top[0]?.count ?? 1)) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-xl font-bold">Repeated demand</h2>
            <p className="mb-3 text-sm text-muted-foreground">Products asked for 2 or more times.</p>
            {repeated.length === 0 ? (
              <p className="text-muted-foreground">No product has been asked for more than once yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {repeated.map((p) => (
                  <li key={p.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.product}</p>
                      <p className="text-sm text-muted-foreground">
                        Last asked {new Date(p.lastAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {p.pending} pending
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-bold text-accent">{p.count}×</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <h2 className="text-xl font-bold">{range === 7 ? "Daily requests" : "Last 4 weeks"}</h2>
              <div className="flex rounded-lg bg-muted p-1">
                {([7, 28] as const).map((r) => (
                  <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1 text-sm font-semibold ${range === r ? "bg-card shadow-xs" : "text-muted-foreground"}`}>
                    {r === 7 ? "7 days" : "4 weeks"}
                  </button>
                ))}
              </div>
            </div>
            {weeks ? (
              <ul className="grid grid-cols-4 gap-2 text-center">
                {weeks.map((w, i) => (
                  <li key={i} className="rounded-xl bg-muted p-3">
                    <p className="font-display text-2xl font-bold">{w}</p>
                    <p className="text-xs text-muted-foreground">{i === 3 ? "This week" : `${3 - i} wk ago`}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-40 items-end gap-2">
                {days.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-bold">{d.count || ""}</span>
                    <div className="w-full rounded-t-md bg-gradient-primary" style={{ height: `${(d.count / max) * 100}px`, minHeight: 2 }} />
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="text-center text-sm text-muted-foreground">
            These numbers only count what you recorded. They help you notice demand — they don't predict sales or guarantee profit.
          </p>
        </>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
