import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { listFaqs } from "@/lib/public.functions";

const faqQueryOptions = queryOptions({
  queryKey: ["faqs"],
  queryFn: () => listFaqs(),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqQueryOptions),
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | R Computer Solutions" },
      {
        name: "description",
        content:
          "Answers about refurbished laptop testing, warranty, bulk orders, delivery across India, upgrades, repair and GST invoicing from R Computer Solutions.",
      },
      { property: "og:title", content: "FAQs | R Computer Solutions" },
      {
        property: "og:description",
        content: "Common questions about buying refurbished IT hardware from R Computer Solutions.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs } = useSuspenseQuery(faqQueryOptions);

  return (
    <SiteShell>
      <PageHero
        title="Frequently asked questions"
        subtitle="Warranty, testing, bulk supply, delivery and upgrades - answered."
      />
      <div className="container-page max-w-3xl py-12">
        <Accordion type="single" collapsible>
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger className="text-left text-sm font-medium">{f.question}</AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-sm text-muted-foreground">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SiteShell>
  );
}
