// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params: Record<string, string | number>
) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const trackCtaClick = (buttonLabel: string) => {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: 'primary_cta',
    button_text: buttonLabel,
    value: 1,
  });
};

export const trackFormSubmission = (formLabel: string) => {
  trackEvent('form_submission', {
    event_category: 'lead',
    event_label: formLabel,
    value: 1,
  });
};

export const trackPhoneClick = () => {
  trackEvent('phone_click', {
    event_category: 'contact',
    event_label: 'phone_call',
    value: 1,
  });
};

export const trackEmailClick = () => {
  trackEvent('email_click', {
    event_category: 'contact',
    event_label: 'email_contact',
    value: 1,
  });
};

// Primary CTA button labels to track
const TRACKED_CTA_LABELS = [
  'start getting booking requests',
  'list my rental business',
  'become a founding member',
  'start getting direct bookings',
  'start getting vegas bookings',
  'list my vehicles in las vegas',
  'claim your spot in las vegas',
];

/**
 * Global click handler using event delegation.
 * Attach once at app level to track CTA clicks, phone links, and email links.
 */
export const setupGlobalClickTracking = () => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Check for phone link clicks
    const phoneLink = target.closest('a[href^="tel:"]');
    if (phoneLink) {
      trackPhoneClick();
      return;
    }

    // Check for email link clicks
    const emailLink = target.closest('a[href^="mailto:"]');
    if (emailLink) {
      trackEmailClick();
      return;
    }

    // Check for CTA button clicks
    const button = target.closest('button');
    if (button) {
      const buttonText = button.textContent?.trim().toLowerCase() || '';
      if (TRACKED_CTA_LABELS.some((label) => buttonText.includes(label))) {
        trackCtaClick(button.textContent?.trim() || '');
      }
    }
  });
};
