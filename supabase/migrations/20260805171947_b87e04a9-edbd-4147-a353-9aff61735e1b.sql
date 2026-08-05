UPDATE public.bookings
SET booking_status = 'canceled',
    payment_status = 'canceled',
    decline_reason = 'Internal verification test booking',
    updated_at = now()
WHERE id = '2fa6f0da-2c0b-46a8-affb-8985a4cb529e';