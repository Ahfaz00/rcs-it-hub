import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClipboardList, Minus, Plus, Trash2, MessageCircle } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { basketMessage, useEnquiryBasket } from "@/lib/basket";
import { siteQueryOptions, whatsappLink } from "@/lib/site-query";

export function EnquiryBasketBar() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const basket = useEnquiryBasket();
  const [open, setOpen] = useState(false);
  const wa = site.settings["whatsapp"];

  if (!basket.ready || basket.items.length === 0) return null;

  const totalUnits = basket.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl shadow-lift">
        <div className="container-page flex items-center gap-3 py-3 pr-16 sm:pr-20">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.85rem] font-bold">
              {basket.items.length} {basket.items.length === 1 ? "item" : "items"} in your enquiry list
            </p>
            <p className="truncate text-[0.72rem] text-muted-foreground">{totalUnits} units total</p>
          </div>
          <SheetTrigger asChild>
            <Button className="h-11 shrink-0 rounded-full bg-navy px-4 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-navy-foreground hover:bg-primary sm:px-6">
              Get combined quote
            </Button>
          </SheetTrigger>
        </div>
      </div>

      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>Your enquiry list</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-3">
            {basket.items.map((item) => (
              <li key={item.id} className="rounded-lg border border-border p-3">
                <p className="text-[0.85rem] font-semibold leading-snug">{item.name}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease quantity for ${item.name}`}
                    onClick={() => basket.setQty(item.id, item.qty - 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    aria-label={`Quantity for ${item.name}`}
                    onChange={(e) => basket.setQty(item.id, Number(e.target.value))}
                    className="h-9 w-16 rounded-md border border-border bg-background text-center text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Increase quantity for ${item.name}`}
                    onClick={() => basket.setQty(item.id, item.qty + 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => basket.remove(item.id)}
                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          {wa ? (
            <Button
              asChild
              className="h-12 w-full rounded-full bg-success text-[0.78rem] font-bold uppercase tracking-[0.12em] text-success-foreground hover:bg-success/90"
            >
              <a
                href={whatsappLink(wa, basketMessage(basket.items))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Send list on WhatsApp
              </a>
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="h-11 w-full rounded-full text-[0.75rem] font-bold uppercase tracking-[0.12em]"
            onClick={() => {
              basket.clear();
              setOpen(false);
            }}
          >
            Clear list
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
