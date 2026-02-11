import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import MarkdownContent from "@/components/MarkdownContent";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  content: string | null;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
}

interface RelatedNews {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  excerpt: string | null;
}

const NewsDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + location.pathname : '';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setNewsItem(data);
          
          // Fetch related news
          const { data: relatedData } = await supabase
            .from("news")
            .select("id, title, slug, cover_url, excerpt")
            .eq("is_published", true)
            .neq("id", data.id)
            .order("published_at", { ascending: false })
            .limit(3);
          
          setRelatedNews(relatedData || []);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
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

  if (notFound || !newsItem) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-foreground">الخبر غير موجود</h1>
          <Link to="/news" className="text-primary hover:underline flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للأخبار
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Generate JSON-LD structured data for news article
  const generateNewsJsonLd = () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": newsItem.title,
      "author": {
        "@type": "Organization",
        "name": "ReviewQeem",
        "url": "https://www.reviewqeem.online"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ReviewQeem",
        "url": "https://www.reviewqeem.online",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.reviewqeem.online/favicon.ico"
        }
      },
      "datePublished": newsItem.published_at || newsItem.created_at,
      "dateModified": newsItem.published_at || newsItem.created_at,
      "description": newsItem.excerpt || `خبر ${newsItem.title}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
      },
      "url": currentUrl,
      ...(newsItem.cover_url && { 
        "image": {
          "@type": "ImageObject",
          "url": newsItem.cover_url
        }
      }),
      "articleSection": "أخبار الألعاب",
      "inLanguage": "ar"
    };
    return JSON.stringify(jsonLd);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{newsItem.title} | خبر - ReviewQeem</title>
        <meta name="description" content={newsItem.excerpt || `خبر ${newsItem.title}`} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={`${newsItem.title} | ReviewQeem`} />
        <meta property="og:description" content={newsItem.excerpt || `خبر ${newsItem.title}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        {newsItem.cover_url && <meta property="og:image" content={newsItem.cover_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${newsItem.title} | ReviewQeem`} />
        <meta name="twitter:description" content={newsItem.excerpt || `خبر ${newsItem.title}`} />
        {newsItem.cover_url && <meta name="twitter:image" content={newsItem.cover_url} />}
        <script type="application/ld+json">{generateNewsJsonLd()}</script>
      </Helmet>
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للأخبار
            </Link>

            {/* Cover Image with Title Overlay */}
            <div className="relative w-full rounded-2xl overflow-hidden mb-8 group">
              {newsItem.cover_url && (
                <>
                  <img
                    src={newsItem.cover_url}
                    alt={newsItem.title}
                    loading="eager"
                    className="w-full h-auto max-h-[450px] object-cover"
                  />
                  {/* Gradient overlays for soft edges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20" />
                  
                  {/* Title on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg mb-3">
                      {newsItem.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm font-medium">
                        أخبار
                      </span>
                      <span className="text-white/80 text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(newsItem.published_at || newsItem.created_at)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {!newsItem.cover_url && (
                <div className="w-full h-[200px] bg-card flex items-center justify-center">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    {newsItem.title}
                  </h1>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="gaming-card p-6 md:p-8 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(newsItem.published_at || newsItem.created_at)}
                </span>
                <ShareButtons url={currentUrl} title={newsItem.title} />
              </div>
              
              {newsItem.excerpt && (
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {newsItem.excerpt}
                </p>
              )}
            </div>

            {/* Content */}
            {newsItem.content && (
              <div className="gaming-card p-6 md:p-8">
                <MarkdownContent content={newsItem.content} />
              </div>
            )}

            {/* Related News */}
            {relatedNews.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">أخبار مشابهة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {relatedNews.map((related) => (
                    <Link key={related.id} to={`/news/${related.slug}`}>
                      <article className="gaming-card group cursor-pointer">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={related.cover_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                            alt={related.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                          {/* News Badge */}
                          <div className="absolute top-3 right-3 flex flex-col items-center justify-center bg-red-500 text-white px-2 py-1 rounded-lg shadow-lg">
                            <span className="text-xs font-bold">أخبار</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                            {related.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {related.excerpt || ""}
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

export default NewsDetail;
