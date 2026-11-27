export type RequestStatus = "pending" | "stocked";

export interface DemandRequest {
  id: string;
  product: string;
  customer?: string;
  quantity?: string;
  details?: string;
  transcript?: string;
  status: RequestStatus;
  createdAt: string; // ISO
  sample?: boolean;
}

export type LanguageCode = "en-IN" | "hi-IN" | "te-IN";

export interface Profile {
  shopkeeperName: string;
  shopName: string;
  category: string;
  area: string;
  language: LanguageCode;
}

export interface Settings {
  theme: "light" | "dark";
  reminders: boolean;
  lastReminderAt?: string;
}

export const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en-IN", label: "English", native: "English" },
  { code: "hi-IN", label: "Hindi", native: "हिन्दी" },
  { code: "te-IN", label: "Telugu", native: "తెలుగు" },
];

export const SHOP_CATEGORIES = [
  "Grocery",
  "Provision store",
  "General store",
  "Kirana",
  "Medical / Pharmacy",
  "Stationery",
  "Vegetables & fruits",
  "Other",
];
