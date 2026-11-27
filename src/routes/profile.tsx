import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/pakodo/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProfile, useProfile } from "@/lib/pakodo-store";
import { LANGUAGES, SHOP_CATEGORIES, type LanguageCode, type Profile } from "@/lib/pakodo-types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Shop profile — PAKODO" },
      { name: "description", content: "Your shop details for PAKODO." },
      { property: "og:title", content: "Shop profile — PAKODO" },
      { property: "og:description", content: "Your shop details for PAKODO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const stored = useProfile();
  const [p, setP] = useState<Profile>(stored);
  useEffect(() => setP(stored), [stored]);
  const set = (k: keyof Profile) => (e: { target: { value: string } }) => setP({ ...p, [k]: e.target.value });

  function save() {
    try {
      saveProfile({ ...p, shopkeeperName: p.shopkeeperName.trim(), shopName: p.shopName.trim(), area: p.area.trim() });
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile", { action: { label: "Retry", onClick: save } });
    }
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="No login needed. Saved only on this device." />
      <form
        className="grid gap-5 rounded-3xl border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field id="p-name" label="Shopkeeper name"><Input id="p-name" value={p.shopkeeperName} onChange={set("shopkeeperName")} className="h-12 text-lg" /></Field>
        <Field id="p-shop" label="Shop name"><Input id="p-shop" value={p.shopName} onChange={set("shopName")} className="h-12 text-lg" /></Field>
        <Field id="p-cat" label="Shop category">
          <select id="p-cat" value={p.category} onChange={set("category")} className="h-12 rounded-md border border-input bg-card px-3 text-lg">
            <option value="">Choose…</option>
            {SHOP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="p-area" label="City or area (optional)"><Input id="p-area" value={p.area} onChange={set("area")} className="h-12 text-lg" /></Field>
        <Field id="p-lang" label="Preferred language">
          <select id="p-lang" value={p.language} onChange={(e) => setP({ ...p, language: e.target.value as LanguageCode })} className="h-12 rounded-md border border-input bg-card px-3 text-lg">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label} · {l.native}</option>)}
          </select>
        </Field>
        <Button type="submit" size="lg" className="h-14 text-lg">Save profile</Button>
      </form>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-base">{label}</Label>
      {children}
    </div>
  );
}
