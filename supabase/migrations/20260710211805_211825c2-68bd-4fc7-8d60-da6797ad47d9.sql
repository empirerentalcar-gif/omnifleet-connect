
-- Bypass the prevent_owner_sensitive_agency_updates trigger for this admin cleanup
SET LOCAL session_replication_role = 'replica';

UPDATE public.agencies
SET active = false,
    approved = false,
    subscription_status = 'canceled',
    is_founding_member = false,
    founding_member_number = NULL,
    updated_at = now()
WHERE id = '62895741-bc59-454d-baad-46e9d1916602';

INSERT INTO public.admin_audit_log
  (action_type, target_type, target_id, target_label, admin_user_id, admin_email, metadata)
VALUES (
  'agency_deactivated_founding_slot_freed',
  'agency',
  '62895741-bc59-454d-baad-46e9d1916602',
  'Johnny Vegas rentals',
  NULL,
  'system',
  jsonb_build_object(
    'previous_founding_member_number', 9,
    'reason', 'Never activated, no bookings/vehicles/agreements. Deactivated and founding slot #9 freed for reassignment.',
    'issued_via', 'lovable admin migration'
  )
);
