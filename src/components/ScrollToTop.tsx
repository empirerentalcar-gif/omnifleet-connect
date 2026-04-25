import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't override in-page anchor scrolling
    if (hash) return;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    // Run immediately and again after lazy-loaded route resolves
    scrollToTop();
    const raf = requestAnimationFrame(scrollToTop);
    const timeout = window.setTimeout(scrollToTop, 100);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
