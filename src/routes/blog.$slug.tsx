import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { getBlogPost, lookupRedirect } from "@/lib/discovery.functions";
import { ArticleBody } from "@/components/site/ArticleBody";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { mediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/format";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: () => getBlogPost({ data: { slug } }),
    staleTime: 60 * 1000,
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!data) {
      const target = await lookupRedirect({ data: { from: `/blog/${params.slug}` } });
      if (target) throw redirect({ href: target, statusCode: 301 });
      throw notFound();
    }
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.post as unknown as Record<string, string | null | undefined>;
    const title = p["seo_title"] || `${p["title"]} | R Computer Solution`;
    const description = p["seo_description"] || p["excerpt"] || "Refurbished IT hardware guide from R Computer Solution.";
    const meta: { title?: string; name?: string; property?: string; content?: string }[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
    ];
    const cover = p["cover_image_url"];
    if (cover && cover.startsWith("https://")) {
      meta.push({ property: "og:image", content: cover }, { name: "twitter:image", content: cover });
    }
    return { meta };
  },
  component: BlogPost,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero title="Article not found" subtitle="This article is unavailable." />
      <div className="container-page py-12">
        <Link to="/blog" className="text-sm font-semibold text-primary">
          Back to blog
        </Link>
      </div>
    </SiteShell>
  ),
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  if (!data) return null;
  const post = data.post as unknown as Record<string, any>;
  const cover = mediaUrl(post["cover_image_url"]);

  return (
    <SiteShell>
      <PageHero
        title={post["title"]}
        {...(post["excerpt"] ? { subtitle: post["excerpt"] as string } : {})}
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>{" "}
            /{" "}
            <Link to="/blog" className="hover:text-primary">
              Blog
            </Link>
          </span>
        }
      />
      <article className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs text-muted-foreground">
            {post["author_name"] ? `${post["author_name"]} · ` : ""}
            {formatDate(post["published_at"])}
            {post["reading_minutes"] ? ` · ${post["reading_minutes"]} min read` : ""}
          </p>
          {cover ? (
            <img
              src={cover}
              alt={post["cover_image_alt"] || post["title"]}
              className="mt-6 w-full rounded-2xl border border-border object-cover"
            />
          ) : null}
          <ArticleBody className="mt-8" html={post["content"] || post["body"] || ""} />
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <EnquiryForm
            source="blog-article"
            title="Need a quote for bulk IT hardware?"
            description="Leave your name and mobile number — our team will call you back with pricing and stock details."
          />
        </div>

        {data.related.length ? (
          <div className="mx-auto mt-14 max-w-3xl border-t border-border pt-8">
            <h2 className="font-display text-lg font-bold">Read next</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {data.related.map((r) => (
                <Link
                  key={r.id}
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  className="rounded-xl border border-border bg-card p-4 text-sm font-semibold hover:border-primary/40 hover:text-primary"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </SiteShell>
  );
}
