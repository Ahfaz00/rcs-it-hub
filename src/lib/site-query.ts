import { queryOptions } from "@tanstack/react-query";
import { getSiteData } from "./public.functions";

export type SiteData = Awaited<ReturnType<typeof getSiteData>>;

export const siteQueryOptions = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData(),
  staleTime: 5 * 60 * 1000,
});

export function whatsappLink(number: string, message: string) {
  const digits = (number || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function enquiryMessage(template: string, product?: string) {
  const base =
    template ||
    "Hello R Computer Solutions, I am interested in {product}. Please share current price, availability and details.";
  return base.replace("{product}", product || "your refurbished IT hardware");
}
