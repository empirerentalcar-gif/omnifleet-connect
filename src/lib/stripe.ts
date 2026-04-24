import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Lazy-loads Stripe.js with the project's publishable key.
 * Used by the renter reservation flow to mount Stripe Elements
 * and confirm PaymentIntents / SetupIntents on the client.
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!publishableKey) {
    console.error("VITE_STRIPE_PUBLISHABLE_KEY is not configured");
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export const STRIPE_PUBLISHABLE_KEY = publishableKey ?? "";