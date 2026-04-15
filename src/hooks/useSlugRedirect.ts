import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that checks if the current slug is an old Arabic slug
 * and redirects to the new English slug (301-style client redirect).
 */
export const useSlugRedirect = (
  slug: string | undefined,
  contentType: string
) => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const checkRedirect = async () => {
      const { data } = await supabase
        .from("slug_redirects")
        .select("new_slug")
        .eq("old_slug", slug)
        .eq("content_type", contentType)
        .maybeSingle();

      if (data?.new_slug) {
        setIsRedirecting(true);
        navigate(`/${contentType}/${data.new_slug}`, { replace: true });
      }
    };

    checkRedirect();
  }, [slug, contentType, navigate]);

  return isRedirecting;
};
