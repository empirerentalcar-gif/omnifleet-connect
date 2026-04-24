
-- Create public bucket for vehicle photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Vehicle photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-photos');

-- Authenticated users can upload to their own folder (folder name = their auth uid)
CREATE POLICY "Owners can upload their vehicle photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can update their vehicle photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can delete their vehicle photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
