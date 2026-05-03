CREATE OR REPLACE FUNCTION public.to_latin_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  result text := lower(coalesce(input_text, ''));
BEGIN
  result := replace(result, 'أ', 'a');
  result := replace(result, 'إ', 'i');
  result := replace(result, 'آ', 'a');
  result := replace(result, 'ا', 'a');
  result := replace(result, 'ب', 'b');
  result := replace(result, 'ت', 't');
  result := replace(result, 'ث', 'th');
  result := replace(result, 'ج', 'j');
  result := replace(result, 'ح', 'h');
  result := replace(result, 'خ', 'kh');
  result := replace(result, 'د', 'd');
  result := replace(result, 'ذ', 'dh');
  result := replace(result, 'ر', 'r');
  result := replace(result, 'ز', 'z');
  result := replace(result, 'س', 's');
  result := replace(result, 'ش', 'sh');
  result := replace(result, 'ص', 's');
  result := replace(result, 'ض', 'd');
  result := replace(result, 'ط', 't');
  result := replace(result, 'ظ', 'z');
  result := replace(result, 'ع', 'a');
  result := replace(result, 'غ', 'gh');
  result := replace(result, 'ف', 'f');
  result := replace(result, 'ق', 'q');
  result := replace(result, 'ك', 'k');
  result := replace(result, 'ل', 'l');
  result := replace(result, 'م', 'm');
  result := replace(result, 'ن', 'n');
  result := replace(result, 'ه', 'h');
  result := replace(result, 'ة', 'h');
  result := replace(result, 'و', 'w');
  result := replace(result, 'ؤ', 'w');
  result := replace(result, 'ي', 'y');
  result := replace(result, 'ى', 'a');
  result := replace(result, 'ئ', 'y');
  result := replace(result, 'ء', '');
  result := replace(result, 'ـ', '');
  result := regexp_replace(result, '[ًٌٍَُِّْ]', '', 'g');
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  IF result = '' OR result IS NULL THEN
    result := 'post';
  END IF;
  RETURN left(result, 80);
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  clean_slug text;
BEGIN
  clean_slug := public.to_latin_slug(title);
  RETURN clean_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
END;
$function$;

DO $$
DECLARE
  rec record;
  base_slug text;
  candidate_slug text;
  suffix int;
BEGIN
  FOR rec IN
    SELECT 'articles'::text AS table_name, 'articles'::text AS content_type, id, title, slug FROM public.articles
    WHERE slug ~ '^(post|[0-9]+)-' OR length(regexp_replace(slug, '-?[a-f0-9]{8}$', '')) < 4
    UNION ALL
    SELECT 'news', 'news', id, title, slug FROM public.news
    WHERE slug ~ '^(post|[0-9]+)-' OR length(regexp_replace(slug, '-?[a-f0-9]{8}$', '')) < 4
    UNION ALL
    SELECT 'reviews', 'reviews', id, title, slug FROM public.reviews
    WHERE slug ~ '^(post|[0-9]+)-' OR length(regexp_replace(slug, '-?[a-f0-9]{8}$', '')) < 4
    UNION ALL
    SELECT 'theories', 'theories', id, title, slug FROM public.theories
    WHERE slug ~ '^(post|[0-9]+)-' OR length(regexp_replace(slug, '-?[a-f0-9]{8}$', '')) < 4
  LOOP
    base_slug := public.to_latin_slug(rec.title);
    IF base_slug = 'post' THEN
      base_slug := rec.content_type || '-post';
    END IF;
    candidate_slug := base_slug;
    suffix := 1;

    LOOP
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.articles WHERE slug = candidate_slug AND id <> rec.id)
        AND NOT EXISTS (SELECT 1 FROM public.news WHERE slug = candidate_slug AND id <> rec.id)
        AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE slug = candidate_slug AND id <> rec.id)
        AND NOT EXISTS (SELECT 1 FROM public.theories WHERE slug = candidate_slug AND id <> rec.id);
      suffix := suffix + 1;
      candidate_slug := left(base_slug, 72) || '-' || suffix::text;
    END LOOP;

    IF candidate_slug <> rec.slug THEN
      INSERT INTO public.slug_redirects (old_slug, new_slug, content_type)
      VALUES (rec.slug, candidate_slug, rec.content_type)
      ON CONFLICT DO NOTHING;

      IF rec.table_name = 'articles' THEN
        UPDATE public.articles SET slug = candidate_slug, updated_at = now() WHERE id = rec.id;
      ELSIF rec.table_name = 'news' THEN
        UPDATE public.news SET slug = candidate_slug, updated_at = now() WHERE id = rec.id;
      ELSIF rec.table_name = 'reviews' THEN
        UPDATE public.reviews SET slug = candidate_slug, updated_at = now() WHERE id = rec.id;
      ELSIF rec.table_name = 'theories' THEN
        UPDATE public.theories SET slug = candidate_slug, updated_at = now() WHERE id = rec.id;
      END IF;
    END IF;
  END LOOP;
END $$;