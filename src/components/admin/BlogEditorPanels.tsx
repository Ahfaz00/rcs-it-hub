import { useState } from "react";
import { ExternalLink, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArticleBody } from "@/components/site/ArticleBody";
import { missingAltCount, readingMinutes, wordCount } from "@/lib/article";
import { cn } from "@/lib/utils";

type Values = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

const LIMITS = {
  seo_title: { ideal: 60, max: 65 },
  seo_description: { ideal: 155, max: 165 },
  excerpt: { ideal: 200, max: 260 },
} as const;

export function BlogEditorPanels({ values }: { values: Values }) {
  const [preview, setPreview] = useState(false);
  const body = str(values["body"]);
  const title = str(values["title"]);
  const slug = str(values["slug"]);
  const seoTitle = str(values["seo_title"]) || (title ? `${title} | R Computer Solution` : "");
  const seoDescription = str(values["seo_description"]) || str(values["excerpt"]);
  const noAlt = missingAltCount(body);
  const published = Boolean(values["is_published"]);

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Article checks
          </h2>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPreview(true)}>
              <Eye className="mr-1.5 h-4 w-4" /> Preview article
            </Button>
            {published && slug ? (
              <Button asChild type="button" variant="ghost" size="sm">
                <a href={`/blog/${slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> Open live page
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Words" value={String(wordCount(body))} />
          <Stat label="Reading time" value={`${readingMinutes(body)} min`} />
          <Stat
            label="Images without alt text"
            value={String(noAlt)}
            tone={noAlt > 0 ? "warn" : "ok"}
          />
        </dl>

        <div className="mt-4 space-y-2">
          <Counter label="SEO title" value={seoTitle} {...LIMITS.seo_title} />
          <Counter label="SEO description" value={seoDescription} {...LIMITS.seo_description} />
          <Counter label="Excerpt" value={str(values["excerpt"])} {...LIMITS.excerpt} />
        </div>

        {noAlt > 0 ? (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            {noAlt} article image{noAlt > 1 ? "s are" : " is"} missing alt text. Alt text is required
            before this post can be published.
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Google preview
        </h2>
        <div className="mt-4 max-w-xl rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-muted-foreground">
            rcs-it-hub.lovable.app › blog › {slug || "your-article"}
          </p>
          <p className="mt-1 text-lg leading-snug text-primary">
            {truncate(seoTitle || "Your article title", 65)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {truncate(seoDescription || "Add an SEO description or excerpt to control this text.", 165)}
          </p>
        </div>
      </section>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title || "Untitled article"}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {str(values["author_name"]) ? `${str(values["author_name"])} · ` : ""}
            {readingMinutes(body)} min read
          </p>
          <ArticleBody html={body} className="mt-4" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("text-sm font-semibold", tone === "warn" ? "text-destructive" : "text-foreground")}>
        {value}
      </dd>
    </div>
  );
}

function Counter({
  label,
  value,
  ideal,
  max,
}: {
  label: string;
  value: string;
  ideal: number;
  max: number;
}) {
  const len = value.length;
  const tone = len === 0 ? "muted" : len > max ? "bad" : len > ideal ? "warn" : "ok";
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold",
          tone === "bad" && "text-destructive",
          tone === "warn" && "text-amber-600",
          tone === "ok" && "text-primary",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {len} / {ideal} characters
      </span>
    </div>
  );
}

function truncate(text: string, n: number) {
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}
