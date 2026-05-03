DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'slug_redirects_content_type_old_slug_key'
  ) THEN
    ALTER TABLE public.slug_redirects
    ADD CONSTRAINT slug_redirects_content_type_old_slug_key UNIQUE (content_type, old_slug);
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.generate_slug(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.to_latin_slug(text) FROM PUBLIC, anon, authenticated;