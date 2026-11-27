import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Mic, Repeat, TrendingUp, ClipboardList } from "lucide-react";
import { useMemo } from "react";
import { Logo } from "@/components/pakodo/Logo";
import { countSince, groupByProduct, repeatedDemand } from "@/lib/insights";
import { useProfile, useRequests } from "@/lib/pakodo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PAKODO — Catch the demand. Grow the business." },
      { name: "description", content: "Record customer requests by voice and see which products your shop should stock." },
      { property: "og:title", content: "PAKODO — Catch the demand. Grow the business." },
      { property: "og:description", content: "Record customer requests by voice and see which products your shop should stock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const requests = useRequests();
  const profile = useProfile();
  const top = useMemo(() => groupByProduct(requests).slice(0, 3), [requests]);
  const repeated = useMemo(() => repeatedDemand(requests).length, [requests]);
  const week = countSince(requests, 7);
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 md:hidden">
        <Logo className="size-11" />
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold leading-none">PAKODO</p>
          <p className="truncate text-sm text-muted-foreground">Catch the demand. Grow the business.</p>
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-base text-muted-foreground">
          {greeting()}
          {profile.shopkeeperName ? `, ${profile.shopkeeperName}` : ""} 🙏
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{profile.shopName || "Your shop"}</h1>
        <p className="hidden text-sm text-muted-foreground md:block">Catch the demand. Grow the business.</p>
        <Link
          to="/record"
          aria-label="Record a customer request"
          className="relative mx-auto mt-6 flex size-40 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-mic transition-transform active:scale-95 hover:scale-[1.03] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-ring/50"
        >
          <Mic className="size-16" strokeWidth={2.2} />
        </Link>
        <p className="mt-5 font-display text-xl font-semibold">Tap to record a request</p>
        <p className="text-sm text-muted-foreground">“A customer asked for millet flour, but it is not available.”</p>
        {!profile.shopName && (
          <Link to="/profile" className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Add your shop details →
          </Link>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={ClipboardList} label="Total requests" value={requests.length} />
        <Stat icon={TrendingUp} label="Last 7 days" value={week} />
        <Stat icon={Repeat} label="Repeated products" value={repeated} />
        <Stat icon={Mic} label="Pending" value={pending} />
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Most asked for</h2>
          <Link to="/insights" className="flex items-center text-sm font-semibold text-primary">
            Insights <ChevronRight className="size-4" />
          </Link>
        </div>
        {top.length === 0 ? (
          <p className="py-4 text-muted-foreground">No requests yet. Tap the microphone when a customer asks for something you don't have.</p>
        ) : (
          <ul className="divide-y divide-border">
            {top.map((p, i) => (
              <li key={p.key} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-secondary font-display font-bold">{i + 1}</span>
                <span className="truncate text-lg font-semibold">{p.product}</span>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-bold text-primary">
                  {p.count}× asked
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Mic; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-2 font-display text-3xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
