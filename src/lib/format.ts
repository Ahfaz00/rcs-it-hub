export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatPrice(price?: number | null, showPrice?: boolean | null) {
  if (!showPrice || price == null) return "Contact for Price";
  return formatINR(Number(price));
}

/** Percentage saved vs MRP, or null when it cannot be computed. */
export function discountPercent(
  price?: number | null,
  mrp?: number | null,
  discount?: number | null,
) {
  if (discount != null && Number(discount) > 0) return Math.round(Number(discount));
  if (price == null || mrp == null) return null;
  const p = Number(price);
  const m = Number(mrp);
  if (!(m > p) || p <= 0) return null;
  return Math.round(((m - p) / m) * 100);
}

export type ConfigSpecs = {
  processor_model?: string | null;
  ram?: string | null;
  storage_capacity?: string | null;
  operating_system?: string | null;
  display_size?: string | null;
};

/** Short configuration chips (CPU / RAM / storage / OS / display). */
export function configChips(p: ConfigSpecs, limit = 5) {
  return [p.processor_model, p.ram, p.storage_capacity, p.display_size, p.operating_system]
    .map((v) => (v ?? "").trim())
    .filter((v) => v !== "")
    .slice(0, limit);
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Returns a same-origin relative path from a CMS setting, or the fallback. */
export function safePath(value: string | null | undefined, fallback: string) {
  const v = (value ?? "").trim();
  if (!v.startsWith("/") || v.startsWith("//")) return fallback;
  return v;
}
