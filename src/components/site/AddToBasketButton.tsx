import { Check, Plus } from "lucide-react";
import { toast } from "sonner";

import { useEnquiryBasket } from "@/lib/basket";
import { cn } from "@/lib/utils";

export function AddToBasketButton({
  product,
  className,
  label = "Add to enquiry",
  compact = false,
}: {
  product: { id: string; name: string; slug: string };
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  const basket = useEnquiryBasket();
  const inBasket = basket.has(product.id);

  return (
    <button
      type="button"
      aria-pressed={inBasket}
      aria-label={inBasket ? `${product.name} is in your enquiry list` : `Add ${product.name} to enquiry list`}
      onClick={() => {
        if (inBasket) {
          basket.remove(product.id);
          toast.success("Removed from enquiry list");
          return;
        }
        const r = basket.add({ id: product.id, name: product.name, slug: product.slug });
        if (r.limitReached) toast.error(`You can add up to ${basket.limit} items to one enquiry.`);
        else toast.success("Added to enquiry list");
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border font-bold transition-colors active:scale-[0.98]",
        compact ? "h-10 px-3 text-[0.72rem]" : "h-12 px-5 text-[0.78rem] uppercase tracking-[0.12em]",
        inBasket
          ? "border-success/40 bg-success/10 text-success"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:text-primary",
        className,
      )}
    >
      {inBasket ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      <span>{inBasket ? "In enquiry list" : label}</span>
    </button>
  );
}
