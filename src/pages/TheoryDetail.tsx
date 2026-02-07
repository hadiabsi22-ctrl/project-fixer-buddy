import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import MarkdownContent from "@/components/MarkdownContent";
import { supabase } from "@/integrations/supabase/client";

interface Theory {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  content: string | null;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
}

interface RelatedTheory {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  excerpt: string | null;
}

const TheoryDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [theory, setTheory] = useState<Theory | null>(null);
  const [relatedTheories, setRelatedTheories] = useState<RelatedTheory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + location.pathname : '';

  useEffect(() => {
    const fetchTheory = async () => {
      try {
        const { data, error } = await supabase
          .from("theories")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setTheory(data);
          
          // Fetch related theories
          const { data: relatedData } = await supabase
            .from("theories")
            .select("id, title, slug, cover_url, excerpt")
            .eq("is_published", true)
            .neq("id", data.id)
            .order("published_at", { ascending: false })
            .limit(3);
          
          setRelatedTheories(relatedData || []);
        }
      } catch (error) {
        console.error("Error fetching theory:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheory();
  }, [slug]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !theory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-foreground">النظرية غير موجودة</h1>
          <Link to="/theories" className="text-primary hover:underline flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للنظريات
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Generate JSON-LD structured data for theory article
  const generateTheoryJsonLd = () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": theory.title,
      "author": {
        "@type": "Organization",
        "name": "ReviewQeem",
        "url": "https://reviewqeem.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ReviewQeem",
        "url": "https://reviewqeem.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://reviewqeem.com/favicon.ico"
        }
      },
      "datePublished": theory.published_at || theory.created_at,
      "dateModified": theory.published_at || theory.created_at,
      "description": theory.excerpt || `نظرية ${theory.title}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
      },
      "url": currentUrl,
      ...(theory.cover_url && { 
        "image": {
          "@type": "ImageObject",
          "url": theory.cover_url
        }
      }),
      "articleSection": "نظريات الألعاب",
      "inLanguage": "ar"
    };
    return JSON.stringify(jsonLd);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{theory.title} | نظرية - ReviewQeem</title>
        <meta name="description" content={theory.excerpt || `نظرية ${theory.title}`} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={`${theory.title} | ReviewQeem`} />
        <meta property="og:description" content={theory.excerpt || `نظرية ${theory.title}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        {theory.cover_url && <meta property="og:image" content={theory.cover_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${theory.title} | ReviewQeem`} />
        <meta name="twitter:description" content={theory.excerpt || `نظرية ${theory.title}`} />
        {theory.cover_url && <meta name="twitter:image" content={theory.cover_url} />}
        <script type="application/ld+json">{generateTheoryJsonLd()}</script>
      </Helmet>
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
              to="/theories"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للنظريات
            </Link>

            {/* Cover Image with Title Overlay */}
            <div className="relative w-full rounded-2xl overflow-hidden mb-8 group">
              {theory.cover_url && (
                <>
                  <img
                    src={theory.cover_url}
                    alt={theory.title}
                    loading="eager"
                    className="w-full h-auto max-h-[450px] object-cover"
                  />
                  {/* Gradient overlays for soft edges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20" />
                  
                  {/* Title on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg mb-3">
                      {theory.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                        نظرية
                      </span>
                      <span className="text-white/80 text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(theory.published_at || theory.created_at)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {!theory.cover_url && (
                <div className="w-full h-[200px] bg-card flex items-center justify-center">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    {theory.title}
                  </h1>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="gaming-card p-6 md:p-8 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(theory.published_at || theory.created_at)}
                </span>
                <ShareButtons url={currentUrl} title={theory.title} />
              </div>
              
              {theory.excerpt && (
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {theory.excerpt}
                </p>
              )}
            </div>

            {/* Content */}
            {theory.content && (
              <div className="gaming-card p-6 md:p-8">
                <MarkdownContent content={theory.content} />
              </div>
            )}

            {/* Related Theories */}
            {relatedTheories.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">نظريات مشابهة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {relatedTheories.map((relatedTheory) => (
                    <Link key={relatedTheory.id} to={`/theories/${relatedTheory.slug}`}>
                      <article className="gaming-card group cursor-pointer">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={relatedTheory.cover_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                            alt={relatedTheory.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                            {relatedTheory.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {relatedTheory.excerpt || ""}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TheoryDetail;
