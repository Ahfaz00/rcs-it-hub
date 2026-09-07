/**
 * Helpers for long-form article content: heading anchors, table of contents,
 * reading time and image alt-text checks. Pure string helpers so they run
 * during SSR as well as in the admin editor.
 */

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: string): number {
  const text = stripHtml(html || "");
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}

/** Average adult reading speed ~200 wpm. Always at least 1 minute. */
export function readingMinutes(html: string): number {
  const words = wordCount(html);
  if (!words) return 0;
  return Math.max(1, Math.round(words / 200));
}

export function anchorId(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section";
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

/**
 * Adds anchor ids to H2/H3 headings, removes the editor's TOC placeholder and
 * returns the table of contents entries. Existing posts stay valid: the input
 * is plain HTML and untouched apart from heading ids.
 */
/**
 * Older posts were stored as plain text. Convert those to paragraphs so they
 * keep rendering (and editing) correctly; HTML content passes through as-is.
 */
export function normalizeArticleHtml(raw: string | null | undefined): string {
  const source = (raw ?? "").trim();
  if (!source) return "";
  if (/<\/?(p|div|h[1-6]|ul|ol|figure|table|blockquote|img|iframe|section)\b/i.test(source)) return source;
  return source
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function enhanceArticle(rawHtml: string | null | undefined): {
  html: string;
  toc: TocItem[];
} {
  const source = normalizeArticleHtml(rawHtml);
  if (!source) return { html: "", toc: [] };

  const toc: TocItem[] = [];
  const used = new Set<string>();

  const html = source
    .replace(/<div[^>]*data-toc[^>]*>\s*<\/div>/gi, "")
    .replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl: string, attrs: string, inner: string) => {
      const level = Number(lvl) as 2 | 3;
      const text = stripHtml(inner);
      if (!text) return `<h${lvl}${attrs}>${inner}</h${lvl}>`;
      const existing = /\sid=["']([^"']+)["']/i.exec(attrs);
      const id = existing ? existing[1]! : anchorId(text, used);
      if (existing) used.add(id);
      const cleaned = attrs.replace(/\sid=["'][^"']*["']/i, "");
      toc.push({ id, text, level });
      return `<h${lvl}${cleaned} id="${id}"><a class="heading-anchor" href="#${id}">${inner}</a></h${lvl}>`;
    });

  return { html, toc };
}

/** All <img> tags with their alt text, used to enforce alt text before publishing. */
export function articleImages(html: string | null | undefined): { src: string; alt: string }[] {
  const out: { src: string; alt: string }[] = [];
  const re = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html ?? ""))) {
    const tag = m[0];
    const src = /\ssrc=["']([^"']*)["']/i.exec(tag)?.[1] ?? "";
    const alt = /\salt=["']([^"']*)["']/i.exec(tag)?.[1] ?? "";
    out.push({ src, alt: alt.trim() });
  }
  return out;
}

export function missingAltCount(html: string | null | undefined): number {
  return articleImages(html).filter((i) => !i.alt).length;
}
