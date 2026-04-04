import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { blogPosts } from "@/lib/blog-data";
import { Button } from "@/components/ui/button";

const Blog = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Independent Lane by Zuvio",
    description:
      "Tips and insights for independent car rental agency owners. Grow your business, get more bookings, and stay ahead.",
    url: "https://zuvio.us/blog",
    publisher: {
      "@type": "Organization",
      name: "Zuvio",
      url: "https://zuvio.us",
    },
    blogPost: blogPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.metaDescription,
      datePublished: p.date,
      url: `https://zuvio.us/blog/${p.slug}`,
      author: { "@type": "Organization", name: "Zuvio" },
    })),
  };

  return (
    <>
      <Helmet>
        <title>The Independent Lane | Car Rental Industry Blog by Zuvio</title>
        <meta
          name="description"
          content="Tips and insights for independent car rental agency owners. Grow your business, get more bookings, and stay ahead — brought to you by Zuvio."
        />
        <link rel="canonical" href="https://zuvio.us/blog" />
        <meta property="og:title" content="The Independent Lane | Car Rental Industry Blog by Zuvio" />
        <meta
          property="og:description"
          content="Tips and insights for independent car rental agency owners. Grow your business, get more bookings, and stay ahead — brought to you by Zuvio."
        />
        <meta property="og:url" content="https://zuvio.us/blog" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
<main className="min-h-screen pt-8 md:pt-32">
        {/* Hero */}
        <section className="pb-16 md:pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              The Independent Lane{" "}
              <span className="text-gradient">by Zuvio</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Rent Cars. Make Money. Skip the Middleman.
            </p>
          </div>
        </section>

        {/* Post Grid */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid gap-8">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="glass-card rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-colors group block"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                    Read More <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

    </>
  );
};

export default Blog;
