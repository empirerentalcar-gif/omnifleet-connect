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
      <span className="text-sm font-semibold text-foreground">Stripe</span>
    </a>
  );
};

export default StripeBadge;
