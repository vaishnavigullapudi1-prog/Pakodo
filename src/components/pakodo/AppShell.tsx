import { Link } from "@tanstack/react-router";
import { BarChart3, History, Home, Settings, Store } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { getRequests, getSettings, saveSettings, useSettings } from "@/lib/pakodo-store";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: History },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: Store },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function useThemeAndReminder() {
  const settings = useSettings();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  // Reminder: shown at most once a day, only while the app is open (no background service).
  useEffect(() => {
    const s = getSettings();
    if (!s.reminders || !("Notification" in window) || Notification.permission !== "granted") return;
    const last = s.lastReminderAt ? new Date(s.lastReminderAt).getTime() : 0;
    if (Date.now() - last < 86400000) return;
    const pending = getRequests().filter((r) => r.status === "pending").length;
    if (pending === 0) return;
    try {
      new Notification("PAKODO reminder", {
        body: `You have ${pending} pending customer request${pending === 1 ? "" : "s"}. Review them before your next stock purchase.`,
      });
      saveSettings({ lastReminderAt: new Date().toISOString() });
    } catch {
      /* some browsers only allow notifications from a service worker */
    }
  }, []);
}

export function AppShell({ children }: { children: ReactNode }) {
  useThemeAndReminder();
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <Logo className="size-9" />
          <span className="font-display text-2xl font-bold tracking-tight">PAKODO</span>
        </Link>
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </aside>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">{children}</main>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-muted-foreground data-[status=active]:text-primary"
          >
            <Icon className="size-6" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
