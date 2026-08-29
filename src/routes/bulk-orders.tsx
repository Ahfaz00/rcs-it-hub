import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Boxes, FileCheck2, Truck, Wrench } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitEnquiry, enquirySchema } from "@/lib/leads.functions";
import { getCatalogFilters } from "@/lib/public.functions";

const filtersQueryOptions = queryOptions({
  queryKey: ["catalog-filters"],
  queryFn: () => getCatalogFilters(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/bulk-orders")({
  loader: ({ context }) => context.queryClient.ensureQueryData(filtersQueryOptions),
  head: () => ({
    meta: [
      { title: "Bulk & Corporate IT Orders | R Computer Solutions, Navi Mumbai" },
      {
        name: "description",
        content:
          "Bulk supply of refurbished laptops, desktops and workstations for offices, startups, institutes and IT resellers. Share your requirement for a quotation.",
      },
      { property: "og:title", content: "Bulk & Corporate IT Orders | R Computer Solutions" },
      {
        property: "og:description",
        content: "Volume supply of tested refurbished IT hardware with GST invoicing and pan-India delivery.",
      },
    ],
  }),
  component: BulkOrdersPage,
});

const highlights = [
  { icon: Boxes, title: "Volume availability", text: "Matched configurations sourced in quantity for offices, labs and rollouts." },
  { icon: Wrench, title: "Tested before dispatch", text: "Every unit is inspected, cleaned and function tested by our technicians." },
  { icon: FileCheck2, title: "GST invoicing", text: "Proper tax invoices for company, institute and reseller purchases." },
  { icon: Truck, title: "Pan-India delivery", text: "Packed and dispatched from Navi Mumbai to your site." },
];

function BulkOrdersPage() {
  const { data: filters } = useSuspenseQuery(filtersQueryOptions);
  const send = useServerFn(submitEnquiry);
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState("");
  const [requirement, setRequirement] = useState("Bulk purchase");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const values = {
      name: String(form.get("name") ?? ""),
      company_name: String(form.get("company_name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      city: String(form.get("city") ?? ""),
      quantity: String(form.get("quantity") ?? ""),
      budget: String(form.get("budget") ?? ""),
      message: String(form.get("message") ?? ""),
      product_category: category,
      requirement_type: requirement,
      source: "bulk-orders",
    };

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await send({ data: parsed.data });
      formEl.reset();
      toast.success("Requirement received. Our team will contact you with a quotation.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your requirement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <PageHero
        title="Bulk & corporate orders"
        subtitle="Supplying offices, startups, institutes and IT resellers with tested refurbished hardware in volume."
      />

      <div className="container-page grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div key={h.title} className="rounded-lg border border-border bg-card p-5 shadow-card">
            <h.icon className="h-5 w-5 text-accent" />
            <h2 className="mt-3 font-display text-sm font-semibold">{h.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{h.text}</p>
          </div>
        ))}
      </div>

      <div className="container-page max-w-3xl pb-16">
        <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold">Share your requirement</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The more detail you share, the faster we can confirm availability and pricing.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Your name" name="name" required error={errors['name']} />
            <Field label="Company / organisation" name="company_name" error={errors['company_name']} />
            <Field label="Phone" name="phone" type="tel" required error={errors['phone']} />
            <Field label="Email" name="email" type="email" error={errors['email']} />
            <Field label="City" name="city" error={errors['city']} />
            <Field label="Quantity required" name="quantity" error={errors['quantity']} />

            <div className="space-y-1.5">
              <Label>Requirement type</Label>
              <Select value={requirement} onValueChange={setRequirement}>
                <SelectTrigger aria-label="Requirement type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bulk purchase">Bulk purchase</SelectItem>
                  <SelectItem value="Rental">Rental</SelectItem>
                  <SelectItem value="AMC">AMC / maintenance</SelectItem>
                  <SelectItem value="Repair">Repair / upgrade</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Product category</Label>
              <Select value={category || "__none"} onValueChange={(v) => setCategory(v === "__none" ? "" : v)}>
                <SelectTrigger aria-label="Product category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Not sure yet</SelectItem>
                  {filters.categories.map((c) => (
                    <SelectItem key={c.slug} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="message">Configuration & other details</Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              maxLength={2000}
              placeholder="Processor, RAM, storage, screen size, timelines, delivery location"
            />
          </div>

          <Button type="submit" size="lg" className="mt-5" disabled={busy}>
            {busy ? "Submitting..." : "Submit requirement"}
          </Button>
        </form>
      </div>
    </SiteShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input id={name} name={name} type={type} required={required} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
