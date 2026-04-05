
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'articles',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved comments" ON public.comments
  FOR SELECT TO public
  USING (is_approved = true);

CREATE POLICY "Anyone can insert comments" ON public.comments
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage comments" ON public.comments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
