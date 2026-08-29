import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact, contactSchema } from "@/lib/leads.functions";
import { siteQueryOptions, whatsappLink } from "@/lib/site-query";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact R Computer Solutions - The IT Hub, Navi Mumbai" },
      {
        name: "description",
        content:
          "Call, WhatsApp or email R Computer Solutions - The IT Hub for refurbished laptops, desktops, workstations, repair, AMC and bulk IT supply in Navi Mumbai.",
      },
      { property: "og:title", content: "Contact R Computer Solutions" },
      {
        property: "og:description",
        content: "Get in touch for refurbished IT hardware, repair, AMC, rental and bulk supply.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const send = useServerFn(submitContact);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const values = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    const parsed = contactSchema.safeParse(values);
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
      toast.success("Message sent. We will get back to you shortly.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your message.");
    } finally {
      setBusy(false);
    }
  }

  const address = site.settings["address"];
  const phone = site.settings["phone"];
  const email = site.settings["email"];
  const wa = site.settings["whatsapp"];
  const hours = site.settings["business_hours"];
  const mapQuery = site.settings["map_query"] || address;

  return (
    <SiteShell>
      <PageHero
        title="Contact us"
        subtitle="Send your requirement and our team will respond with availability, specifications and pricing."
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold">Send us a message</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Your name" name="name" required error={errors['name']} />
            <Field label="Phone" name="phone" type="tel" required error={errors['phone']} />
            <Field label="Email" name="email" type="email" error={errors['email']} />
            <Field label="Subject" name="subject" error={errors['subject']} />
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea id="message" name="message" rows={5} maxLength={2000} required />
            {errors['message'] ? <p className="text-xs text-destructive">{errors['message']}</p> : null}
          </div>
          <Button type="submit" size="lg" className="mt-5" disabled={busy}>
            {busy ? "Sending..." : "Send message"}
          </Button>
        </form>

        <aside className="space-y-4">
          <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-card">
            {address ? (
              <ContactRow icon={<MapPin className="h-4 w-4" />} label="Address" value={address} />
            ) : null}
            {phone ? (
              <ContactRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={phone}
                href={`tel:${phone.replace(/\s/g, "")}`}
              />
            ) : null}
            {email ? (
              <ContactRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={email}
                href={`mailto:${email}`}
              />
            ) : null}
            {hours ? <ContactRow icon={<Clock className="h-4 w-4" />} label="Hours" value={hours} /> : null}
            {wa ? (
              <Button asChild className="w-full bg-success text-success-foreground hover:bg-success/90">
                <a href={whatsappLink(wa)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
                </a>
              </Button>
            ) : null}
          </div>

          {mapQuery ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                title="R Computer Solutions location map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}
        </aside>
      </div>
    </SiteShell>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-accent">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-medium hover:text-accent">
            {value}
          </a>
        ) : (
          <p className="whitespace-pre-line text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
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
