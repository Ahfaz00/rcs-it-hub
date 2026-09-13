import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PhoneCall } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitEnquiry, enquirySchema } from "@/lib/leads.functions";
import { cn } from "@/lib/utils";

export function CallbackBar({
  productName,
  productId,
  className,
}: {
  productName?: string | undefined;
  productId?: string | undefined;
  className?: string | undefined;
}) {
  const submit = useServerFn(submitEnquiry);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = {
      name: "Call back request",
      phone: phone.trim(),
      product_id: productId ?? "",
      product_name: productName ?? "",
      requirement_type: "Call Back",
      message: productName ? `Please call me back about ${productName}.` : "Please call me back.",
      source: "callback-bar",
    };
    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid mobile number");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await submit({ data: parsed.data });
      setDone(true);
      toast.success("Request received. We will call you back shortly.");
    } catch {
      toast.error("Could not send your request. Please try WhatsApp or call us.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 sm:p-6", className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PhoneCall className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[1.02rem] font-bold">Get a call back in 5 minutes</p>
          <p className="mt-0.5 text-[0.8rem] text-muted-foreground">
            No long form — just your mobile number during business hours.
          </p>
        </div>
      </div>

      {done ? (
        <p className="mt-4 rounded-xl bg-success/10 p-3 text-[0.85rem] font-medium text-success">
          Thanks — our team will call you shortly.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="numeric"
            maxLength={20}
            aria-label="Your mobile number"
            placeholder="Enter 10-digit mobile number"
            className="h-12 flex-1 rounded-full"
          />
          <Button
            type="submit"
            disabled={busy}
            className="h-12 shrink-0 rounded-full px-6 text-[0.75rem] font-bold uppercase tracking-[0.12em]"
          >
            {busy ? "Sending..." : "Request call back"}
          </Button>
        </form>
      )}
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
