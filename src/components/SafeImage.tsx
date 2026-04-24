import { useState, useRef, memo } from "react";
import { RefreshCw } from "lucide-react";
import zuvioLogo from "@/assets/zuvio-logo.png";

export const PhotoFallback = ({
  className = "",
  showUnavailable = false,
  onRetry,
  compact = false,
}: {
  className?: string;
  showUnavailable?: boolean;
  onRetry?: () => void;
  compact?: boolean;
}) => (
  <div
    className={`relative w-full h-full flex items-center justify-center ${className}`}
    style={{ background: "#0d1b2e", borderBottom: "3px solid #2dd4bf" }}
  >
    <img
      src={zuvioLogo}
      alt="Zuvio placeholder"
      className={`${compact ? "w-[60%] max-w-[100px]" : "w-[120px]"} h-auto object-contain opacity-80`}
    />
    {showUnavailable && (
      <div className={`absolute ${compact ? "bottom-1" : "bottom-2"} left-1/2 -translate-x-1/2 flex items-center gap-1.5`}>
        <span className="px-1.5 py-0.5 rounded-md bg-background/80 text-foreground text-[10px] sm:text-xs font-medium border border-border backdrop-blur-sm">
          Photo unavailable
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Retry loading photo"
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-medium border border-primary/40 hover:bg-primary transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        )}
      </div>
    )}
  </div>
);

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  compact?: boolean;
}

export const SafeImage = memo(({ src, alt, className, width, height, loading = "lazy", compact = false }: SafeImageProps) => {
  const [errored, setErrored] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);
  const lastSrcRef = useRef(src);

  // Reset error state only when the underlying src truly changes,
  // not on every parent re-render — prevents overlay flicker.
  if (lastSrcRef.current !== src) {
    lastSrcRef.current = src;
    if (errored) setErrored(false);
    if (cacheBust !== 0) setCacheBust(0);
  }

  const isValid = typeof src === "string" && src.trim().length > 0 && src !== "null" && src !== "undefined";
  if (!isValid) return <PhotoFallback compact={compact} />;
  if (errored) {
    return (
      <PhotoFallback
        compact={compact}
        showUnavailable
        onRetry={() => {
          setErrored(false);
          setCacheBust((n) => n + 1);
        }}
      />
    );
  }
  const finalSrc = cacheBust > 0 ? `${src}${src.includes("?") ? "&" : "?"}retry=${cacheBust}` : src;
  return (
    <img
      key={cacheBust}
      src={finalSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
      onError={() => setErrored(true)}
    />
  );
});
SafeImage.displayName = "SafeImage";