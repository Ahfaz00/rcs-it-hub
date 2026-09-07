import { enhanceArticle } from "@/lib/article";

/**
 * Renders article HTML with heading anchors and an auto-generated table of
 * contents built from the H2/H3 headings. Used by the public blog page and the
 * admin preview so both look identical.
 */
export function ArticleBody({ html, className }: { html: string; className?: string }) {
  const { html: enhanced, toc } = enhanceArticle(html);

  return (
    <div className={className}>
      {toc.length >= 2 ? (
        <nav aria-label="Table of contents" className="article-toc">
          <p className="article-toc-title">On this page</p>
          <ol>
            {toc.map((item) => (
              <li key={item.id} data-level={item.level}>
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: enhanced }} />
    </div>
  );
}
