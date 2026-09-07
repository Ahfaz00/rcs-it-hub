import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

/**
 * Image rendered as a semantic <figure> so articles can carry a caption,
 * alignment and width. Plain <img> from older posts still parses.
 */
export const ArticleImage = Image.extend({
  name: "image",
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null as string | null },
      align: { default: "center" as string },
      caption: { default: null as string | null },
    };
  },
  parseHTML() {
    return [
      {
        tag: "figure[data-article-image]",
        getAttrs: (el) => {
          const node = el as HTMLElement;
          const img = node.querySelector("img");
          if (!img) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.getAttribute("width"),
            align: node.getAttribute("data-align") || "center",
            caption: node.querySelector("figcaption")?.textContent || null,
          };
        },
      },
      { tag: "img[src]" },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const { caption, align, width, ...rest } = HTMLAttributes as Record<string, unknown>;
    const img: [string, Record<string, unknown>] = [
      "img",
      mergeAttributes(rest, width ? { width: String(width) } : {}, { loading: "lazy" }),
    ];
    const children: unknown[] = [img];
    if (caption) children.push(["figcaption", {}, String(caption)]);
    return [
      "figure",
      {
        "data-article-image": "true",
        "data-align": String(align ?? "center"),
        class: `article-figure align-${String(align ?? "center")}`,
      },
      ...children,
    ] as never;
  },
});

/** Question/answer block that renders as semantic, crawlable markup. */
export const FaqBlock = Node.create({
  name: "faqBlock",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      question: { default: "" },
      answer: { default: "" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "div[data-faq]",
        getAttrs: (el) => {
          const node = el as HTMLElement;
          return {
            question: node.querySelector("[data-faq-q]")?.textContent ?? "",
            answer: node.querySelector("[data-faq-a]")?.textContent ?? "",
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const q = String((HTMLAttributes as Record<string, unknown>)["question"] ?? "");
    const a = String((HTMLAttributes as Record<string, unknown>)["answer"] ?? "");
    return [
      "div",
      { "data-faq": "true", class: "article-faq" },
      ["p", { "data-faq-q": "true", class: "article-faq-q" }, q],
      ["p", { "data-faq-a": "true", class: "article-faq-a" }, a],
    ] as never;
  },
});

/** Marker replaced by the generated table of contents when the article renders. */
export const TocPlaceholder = Node.create({
  name: "tocPlaceholder",
  group: "block",
  atom: true,
  selectable: true,
  parseHTML() {
    return [{ tag: "div[data-toc]" }];
  },
  renderHTML() {
    return ["div", { "data-toc": "true", class: "article-toc-placeholder" }] as never;
  },
});
