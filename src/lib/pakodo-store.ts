import { useSyncExternalStore } from "react";
import type { DemandRequest, Profile, Settings } from "./pakodo-types";

const KEYS = {
  requests: "pakodo.requests.v1",
  profile: "pakodo.profile.v1",
  settings: "pakodo.settings.v1",
} as const;

const DEFAULT_PROFILE: Profile = {
  shopkeeperName: "",
  shopName: "",
  category: "",
  area: "",
  language: "en-IN",
};
const DEFAULT_SETTINGS: Settings = { theme: "light", reminders: false };
const EMPTY: DemandRequest[] = [];

type Key = keyof typeof KEYS;
const cache: Partial<Record<Key, { raw: string | null; value: unknown }>> = {};
const listeners = new Set<() => void>();

function read<T>(key: Key, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEYS[key]);
  } catch {
    return fallback;
  }
  const hit = cache[key];
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as T;
      value = Array.isArray(fallback) ? parsed : ({ ...fallback, ...parsed } as T);
    } catch {
      value = fallback;
    }
  }
  cache[key] = { raw, value };
  return value;
}

/** Throws if storage is unavailable or full, so callers can show an error and retry. */
function write(key: Key, value: unknown) {
  window.localStorage.setItem(KEYS[key], JSON.stringify(value));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useRequests(): DemandRequest[] {
  return useSyncExternalStore(subscribe, () => read("requests", EMPTY), () => EMPTY);
}
export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, () => read("profile", DEFAULT_PROFILE), () => DEFAULT_PROFILE);
}
export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => read("settings", DEFAULT_SETTINGS), () => DEFAULT_SETTINGS);
}

export const getRequests = () => read("requests", EMPTY);
export const getSettings = () => read("settings", DEFAULT_SETTINGS);

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addRequest(r: Omit<DemandRequest, "id" | "createdAt" | "status">): DemandRequest {
  const product = r.product.trim();
  if (!product) throw new Error("Product name is required");
  const item: DemandRequest = { ...r, product, id: newId(), createdAt: new Date().toISOString(), status: "pending" };
  write("requests", [item, ...getRequests()]);
  return item;
}

export function updateRequest(id: string, patch: Partial<Omit<DemandRequest, "id">>) {
  if (patch.product !== undefined && !patch.product.trim()) throw new Error("Product name is required");
  write("requests", getRequests().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function deleteRequest(id: string) {
  write("requests", getRequests().filter((r) => r.id !== id));
}

export function clearRequests() {
  write("requests", []);
}

export function clearSampleRequests() {
  write("requests", getRequests().filter((r) => !r.sample));
}

export function saveProfile(p: Profile) {
  write("profile", p);
}

export function saveSettings(patch: Partial<Settings>) {
  write("settings", { ...getSettings(), ...patch });
}

export function loadSampleData() {
  const samples: [string, string | undefined, string | undefined, number][] = [
    ["Millet Flour", "Lakshmi", "1 kg", 0],
    ["Millet Flour", undefined, "2 kg", 1],
    ["Millet Flour", "Ravi", undefined, 3],
    ["Cold Pressed Groundnut Oil", undefined, "1 l", 0],
    ["Cold Pressed Groundnut Oil", "Suresh", undefined, 2],
    ["Ragi Malt", undefined, "2 packets", 1],
    ["Oat Biscuits", undefined, undefined, 4],
    ["Ragi Malt", "Anitha", undefined, 5],
    ["Jaggery Powder", undefined, "500 g", 6],
    ["Millet Flour", undefined, undefined, 6],
  ];
  const now = Date.now();
  const items: DemandRequest[] = samples.map(([product, customer, quantity, daysAgo], i) => ({
    id: `sample-${i}-${newId()}`,
    product,
    ...(customer ? { customer } : {}),
    ...(quantity ? { quantity } : {}),
    details: "Sample data",
    status: i === 6 ? "stocked" : "pending",
    createdAt: new Date(now - daysAgo * 86400000 - i * 3600000).toISOString(),
    sample: true,
  }));
  write("requests", [...getRequests().filter((r) => !r.sample), ...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}
