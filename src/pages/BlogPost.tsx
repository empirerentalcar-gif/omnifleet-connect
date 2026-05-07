import { useParams, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Facebook, Link2, Check } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { getPostBySlug } from "@/lib/blog-data";
import { Button } from "@/components/ui/button";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const [copied, setCopied] = useState(false);

  if (!post) return <Navigate to="/blog" replace />;

  const postUrl = `https://zuvio.us/blog/${post.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    url: `https://zuvio.us/blog/${post.slug}`,
    author: { "@type": "Organization", name: "Zuvio" },
    publisher: { "@type": "Organization", name: "Zuvio", url: "https://zuvio.us" },
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Zuvio Blog</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={`https://zuvio.us/blog/${post.slug}`} />
        <meta property="og:title" content={`${post.title} | Zuvio Blog`} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={`https://zuvio.us/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
<main className="min-h-screen pt-8 md:pt-32 pb-20 md:pb-28">
        <article className="container mx-auto px-4 max-w-3xl">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {post.title}
          </h1>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {/* Content */}
          <div
            className="blog-content prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-primary hover:prose-a:text-primary/80
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share this article */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
              Share this article
            </h2>
            <div className="flex gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share this article on Facebook"
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy link to this article"
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 glass-card rounded-2xl p-8 md:p-10 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Ready to grow your rental business?
            </h2>
            <p className="text-muted-foreground mb-4">
              Join Zuvio as a Founding Member today.
            </p>
            <p className="text-sm font-semibold text-primary mb-6">
              Use code <span className="font-bold">FOUNDING50</span> at signup — only 50 spots available.
            </p>
            <Button
              variant="hero"
              size="xl"
              className="group text-base"
              onClick={() => (window.location.href = "/signup")}
            >
              <span>Become a Founding Member</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </article>
      </main>

    </>
  );
};

export default BlogPost;
