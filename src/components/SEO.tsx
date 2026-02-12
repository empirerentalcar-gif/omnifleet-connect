import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}

declare global {
  interface Window {
    prerenderReady: boolean;
  }
}

const SEO = ({ title, description, path = "/", noindex = false }: SEOProps) => {
  const url = `https://zuvio.us${path}`;

  useEffect(() => {
    // Signal Netlify Prerender that the page is ready
    window.prerenderReady = true;
    return () => {
      window.prerenderReady = false;
    };
  }, []);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
    </Helmet>
  );
};

export default SEO;
