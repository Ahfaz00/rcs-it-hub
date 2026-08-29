import { queryOptions } from "@tanstack/react-query";
import { getSiteData } from "./public.functions";

export type SiteData = Awaited<ReturnType<typeof getSiteData>>;

export const siteQueryOptions = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData(),
  staleTime: 5 * 60 * 1000,
});

export function whatsappLink(number: string, message?: string | null) {
  const digits = (number || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || "Hello, I would like to enquire about your products.")}`;
}

export function enquiryMessage(template: string | null | undefined, product?: string) {
  const base =
    template ||
    "Hello R Computer Solutions, I am interested in {product}. Please share current price, availability and details.";
  return base.replace("{product}", product || "your refurbished IT hardware");
}
