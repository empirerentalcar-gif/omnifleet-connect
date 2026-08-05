UPDATE public.bookings
SET booking_status = 'canceled',
    payment_status = 'failed',
    decline_reason = COALESCE(decline_reason, 'Stripe rejected the payment request (apple_pay/google_pay with on_behalf_of)'),
    updated_at = now()
WHERE id = '42a05f43-12d2-4dee-b4f2-4a619cf1d155'
  AND booking_status = 'pending_agency';