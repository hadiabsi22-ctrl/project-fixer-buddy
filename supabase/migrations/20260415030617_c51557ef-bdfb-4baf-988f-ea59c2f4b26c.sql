
-- Table for 301 redirects from old Arabic slugs to new English slugs
CREATE TABLE public.slug_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug text NOT NULL,
  new_slug text NOT NULL,
  content_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_slug_redirects_lookup ON public.slug_redirects (content_type, old_slug);

ALTER TABLE public.slug_redirects ENABLE ROW LEVEL SECURITY;

-- Anyone can read redirects (needed for client-side routing)
CREATE POLICY "Anyone can view redirects"
ON public.slug_redirects FOR SELECT
TO public
USING (true);

-- Only admins can manage redirects
CREATE POLICY "Admins can manage redirects"
ON public.slug_redirects FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update generate_slug to produce English-only slugs
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  clean_slug text;
BEGIN
    -- Keep only English letters, numbers, spaces, and hyphens
    clean_slug := REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g');
    -- Replace spaces with hyphens
    clean_slug := LOWER(REGEXP_REPLACE(TRIM(clean_slug), '\s+', '-', 'g'));
    -- Remove leading/trailing hyphens
    clean_slug := TRIM(BOTH '-' FROM clean_slug);
    -- If empty (fully Arabic title), use a UUID-based slug
    IF clean_slug = '' OR clean_slug IS NULL THEN
        clean_slug := 'post';
    END IF;
    -- Append unique suffix
    RETURN clean_slug || '-' || SUBSTR(gen_random_uuid()::text, 1, 8);
END;
$function$;
