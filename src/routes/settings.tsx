import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Database, Languages, Moon, Shield, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/pakodo/PageHeader";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { clearRequests, loadSampleData, saveProfile, saveSettings, useProfile, useRequests, useSettings } from "@/lib/pakodo-store";
import { LANGUAGES, type LanguageCode } from "@/lib/pakodo-types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PAKODO" },
      { name: "description", content: "Theme, language, reminders, data and privacy." },
      { property: "og:title", content: "Settings — PAKODO" },
      { property: "og:description", content: "Theme, language, reminders, data and privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettings();
  const profile = useProfile();
  const requests = useRequests();
  const [speechOk, setSpeechOk] = useState<boolean | null>(null);
  const [notif, setNotif] = useState<"unsupported" | NotificationPermission | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSpeechOk(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
    setNotif("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  async function toggleReminders(on: boolean) {
    if (!on) return saveSettings({ reminders: false });
    if (!("Notification" in window)) return toast.error("This browser doesn't support notifications.");
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    setNotif(perm);
    if (perm !== "granted") return toast.error("Notifications were not allowed, so reminders stay off.");
    saveSettings({ reminders: true });
    toast.success("Reminders on");
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" />

      <Section icon={Sun} title="Appearance">
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={settings.theme === t}
              onClick={() => saveSettings({ theme: t })}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-4 text-base font-semibold aria-checked:border-primary aria-checked:bg-primary/10 aria-checked:text-primary"
            >
              {t === "light" ? <Sun className="size-5" /> : <Moon className="size-5" />}
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={Languages} title="Language">
        <label htmlFor="s-lang" className="text-sm text-muted-foreground">Preferred language for voice input</label>
        <select
          id="s-lang"
          value={profile.language}
          onChange={(e) => saveProfile({ ...profile, language: e.target.value as LanguageCode })}
          className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3 text-lg"
        >
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label} · {l.native}</option>)}
        </select>
        <p className="mt-2 text-sm">
          {speechOk === false
            ? "⚠️ This browser does not support voice recognition in any language. You can still type requests."
            : profile.language === "en-IN"
              ? "✓ English voice input is supported in this browser."
              : `Voice input in ${LANGUAGES.find((l) => l.code === profile.language)?.label} works in Chrome and Edge; some other browsers can't recognise it. If it fails, you'll see a message and can type instead. The app's menus stay in English for now.`}
        </p>
      </Section>

      <Section icon={Bell} title="Notifications">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="font-semibold">Daily reminder</p>
            <p className="text-sm text-muted-foreground">When you open PAKODO, at most once a day, reminds you of pending requests.</p>
          </div>
          <Switch
            checked={settings.reminders}
            onCheckedChange={(v) => void toggleReminders(v)}
            disabled={notif === "unsupported"}
            aria-label="Daily reminder"
          />
        </div>
        {notif === "unsupported" && <p className="mt-2 text-sm text-destructive">This browser doesn't support notifications.</p>}
        {notif === "denied" && <p className="mt-2 text-sm text-destructive">Notifications are blocked. Allow them in your browser settings to use reminders.</p>}
        <p className="mt-2 text-xs text-muted-foreground">Prototype limit: reminders only appear while the app is open — there's no background reminder service.</p>
      </Section>

      <Section icon={Database} title="Data">
        <p className="text-base">{requests.length} request{requests.length === 1 ? "" : "s"} saved on this device.</p>
        <p className="text-sm text-muted-foreground">
          Edit or delete single requests in <Link to="/history" className="font-semibold text-primary">History</Link>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" className="h-12" onClick={() => { loadSampleData(); toast.success("Sample data added", { description: "Marked as sample data in History." }); }}>
            Add sample data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-12" disabled={requests.length === 0}>Clear all requests</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all {requests.length} requests?</AlertDialogTitle>
                <AlertDialogDescription>Every saved request will be deleted from this device. This cannot be undone. Your profile stays.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { clearRequests(); toast.success("All requests cleared"); }}>
                  Yes, clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Section>

      <Section icon={Shield} title="Privacy">
        <ul className="list-disc space-y-1.5 pl-5 text-base">
          <li>Customer names are always optional.</li>
          <li>The microphone is on only while you're recording — never in the background.</li>
          <li>Your requests and profile are stored only in this browser on this device. Nothing is uploaded to a PAKODO server.</li>
          <li>Voice recognition is done by your browser; some browsers (like Chrome) send the audio to their own speech service to turn it into text.</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Sun; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Icon className="size-5 text-primary" />{title}</h2>
      {children}
    </section>
  );
}
