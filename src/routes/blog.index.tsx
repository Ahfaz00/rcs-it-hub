import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { listBlogPosts } from "@/lib/discovery.functions";
import { mediaUrl } from "@/lib/media";

const blogQuery = queryOptions({
  queryKey: ["blog", "all"],
  queryFn: () => listBlogPosts({ data: {} }),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Buying Guides & IT Hardware Blog | R Computer Solution" },
      {
        name: "description",
        content:
          "Practical guides on buying refurbished laptops, desktops and workstations for business, students and professionals in India.",
      },
      { property: "og:title", content: "Buying Guides & IT Hardware Blog | R Computer Solution" },
      {
        property: "og:description",
        content: "Guides on choosing refurbished IT hardware for business and personal use.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(blogQuery),
  component: BlogIndex,
});

function BlogIndex() {
  const { data } = useSuspenseQuery(blogQuery);

  return (
    <SiteShell>
      <PageHero
        title="Guides & insights"
        subtitle="Straight answers about refurbished hardware, configurations and business IT buying."
      />
      <section className="container-page py-10 md:py-14">
        {data.posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Articles will appear here once published from the admin panel.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => {
              const img = mediaUrl(post.cover_image_url);
              return (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lift"
                >
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="block aspect-[16/9] overflow-hidden bg-muted">
                    {img ? (
                      <img
                        src={img}
                        alt={post.cover_image_alt || post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    {post.blog_categories?.name ? (
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                        {post.blog_categories.name}
                      </p>
                    ) : null}
                    <h2 className="mt-1.5 font-display text-lg font-bold leading-snug tracking-tight">
                      <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-primary">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                    ) : null}
                    <p className="mt-auto pt-4 text-xs text-muted-foreground">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN") : null}
                      {post.reading_minutes ? ` · ${post.reading_minutes} min read` : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
