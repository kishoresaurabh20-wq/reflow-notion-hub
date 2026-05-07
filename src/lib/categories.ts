export const CATEGORIES = [
  { value: "plastics", label: "Plastics", emoji: "♻️" },
  { value: "metals", label: "Metals", emoji: "⚙️" },
  { value: "textiles", label: "Textiles", emoji: "🧵" },
  { value: "wood", label: "Wood", emoji: "🪵" },
  { value: "paper", label: "Paper & Cardboard", emoji: "📦" },
  { value: "glass", label: "Glass", emoji: "🫙" },
  { value: "chemicals", label: "Chemicals", emoji: "⚗️" },
  { value: "organic", label: "Organic / Biomass", emoji: "🌱" },
  { value: "construction", label: "Construction", emoji: "🧱" },
  { value: "electronics", label: "Electronics", emoji: "🔌" },
  { value: "rubber", label: "Rubber", emoji: "🛞" },
  { value: "other", label: "Other", emoji: "📋" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const UNITS = [
  { value: "kg", label: "kg" },
  { value: "tonnes", label: "tonnes" },
  { value: "liters", label: "liters" },
  { value: "cubic_meters", label: "m³" },
  { value: "units", label: "units" },
  { value: "pallets", label: "pallets" },
] as const;

export const categoryLabel = (v: string) =>
  CATEGORIES.find((c) => c.value === v)?.label ?? v;
export const categoryEmoji = (v: string) =>
  CATEGORIES.find((c) => c.value === v)?.emoji ?? "📋";
export const unitLabel = (v: string) =>
  UNITS.find((u) => u.value === v)?.label ?? v;
