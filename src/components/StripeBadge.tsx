import { Link } from "react-router-dom";

const StripeBadge = () => {
  return (
    <a
      href="https://stripe.com"
      target="_blank"
      rel="nofollow noopener noreferrer"
      aria-label="Powered by Stripe - secure payment processing"
      className="inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
    >
      <span className="text-xs text-muted-foreground">Powered by</span>
      <svg
        viewBox="0 0 60 25"
        className="h-5 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <title>Stripe</title>
        <path
          d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 6.27 3.16 6.27 7.08 0 .6-.04 1.43-.07 1.9zm-6.38-5.6c-.78 0-1.63.56-1.74 2.06h3.48c-.09-1.31-.66-2.06-1.74-2.06zM40.95 20.3V4.92h4.1v15.38h-4.1zM38.93 4.92l-4.56 12.03L29.7 4.92h-4.4l6.56 15.38h3.77l6.57-15.38h-3.27zM13.32 11.08c0-.48.39-.66 1.07-.66 1.5 0 3.42.46 4.93 1.28V7.42a12.6 12.6 0 0 0-4.93-.97C10.92 6.45 8 8.25 8 11.56c0 5.8 8.03 4.87 8.03 7.37 0 .57-.49.76-1.2.76-1.71 0-4.24-.7-5.97-1.7v3.88c1.97.84 4.22 1.19 5.97 1.19 3.66 0 6.13-1.83 6.13-5.16 0-5.86-8.64-4.73-8.64-7.82z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
};

export default StripeBadge;
