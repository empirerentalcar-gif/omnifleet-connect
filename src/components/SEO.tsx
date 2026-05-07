import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  image?: string;
  /**
   * Set to false while dynamic content (Supabase queries, blog posts, vehicle
   * listings, etc.) is still loading. Once all critical data has resolved,
   * pass true so Netlify Prerender captures the fully rendered page.
   * Defaults to true for static pages with no async data.
   */
  ready?: boolean;
}

declare global {
  interface Window {
    prerenderReady: boolean;
  }
}

const DEFAULT_OG_IMAGE = "https://zuvio.us/og-image.png";

const SEO = ({ title, description, path = "/", noindex = false, image, ready = true }: SEOProps) => {
  const url = `https://zuvio.us${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // Only signal Netlify Prerender once all dynamic content has loaded.
    // Pages that fetch data from Supabase should pass `ready={!isLoading}`
    // so crawlers receive the fully hydrated HTML.
    if (ready) {
      window.prerenderReady = true;
    } else {
      window.prerenderReady = false;
    }
    return () => {
      window.prerenderReady = false;
    };
  }, [ready]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />
      {/* <meta property="fb:app_id" content="YOUR_FB_APP_ID" /> */}
    </Helmet>
  );
};

export default SEO;
