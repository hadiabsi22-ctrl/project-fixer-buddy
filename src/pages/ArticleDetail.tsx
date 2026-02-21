import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import MarkdownContent from "@/components/MarkdownContent";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  alt_text: string | null;
  content: string | null;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  excerpt: string | null;
}

const ArticleDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + location.pathname : '';

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setArticle(data);
          
          const { data: relatedData } = await supabase
            .from("articles")
            .select("id, title, slug, cover_url, excerpt")
            .eq("is_published", true)
            .neq("id", data.id)
            .order("published_at", { ascending: false })
            .limit(3);
          
          setRelatedArticles(relatedData || []);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
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

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-foreground">المقالة غير موجودة</h1>
          <Link to="/articles" className="text-primary hover:underline flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للمقالات
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const generateArticleJsonLd = () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "author": {
        "@type": "Organization",
        "name": "ReviewQeem",
        "url": "https://www.reviewqeem.online"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ReviewQeem",
        "url": "https://www.reviewqeem.online",
        "logo": { "@type": "ImageObject", "url": "https://www.reviewqeem.online/favicon.ico" }
      },
      "datePublished": article.published_at || article.created_at,
      "dateModified": article.published_at || article.created_at,
      "description": article.excerpt || `مقالة ${article.title}`,
      "mainEntityOfPage": { "@type": "WebPage", "@id": currentUrl },
      "url": currentUrl,
      ...(article.cover_url && { "image": { "@type": "ImageObject", "url": article.cover_url } }),
      "articleSection": "مقالات الألعاب",
      "inLanguage": "ar"
    };
    return JSON.stringify(jsonLd);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.title} | مقالة - ReviewQeem</title>
        <meta name="description" content={article.excerpt || `مقالة ${article.title}`} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={`${article.title} | ReviewQeem`} />
        <meta property="og:description" content={article.excerpt || `مقالة ${article.title}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        {article.cover_url && <meta property="og:image" content={article.cover_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${article.title} | ReviewQeem`} />
        <meta name="twitter:description" content={article.excerpt || `مقالة ${article.title}`} />
        {article.cover_url && <meta name="twitter:image" content={article.cover_url} />}
        <script type="application/ld+json">{generateArticleJsonLd()}</script>
      </Helmet>
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للمقالات
            </Link>

            {/* Title Above Image - visible to search engines */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm font-bold">
                مقالة
              </span>
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(article.published_at || article.created_at)}
              </span>
            </div>

            {/* Cover Image */}
            {article.cover_url && (
              <div className="relative w-full rounded-2xl overflow-hidden mb-8">
                <img
                  src={article.cover_url}
                  alt={article.alt_text || article.title}
                  loading="eager"
                  className="w-full h-auto max-h-[450px] object-cover"
                />
              </div>
            )}

            <div className="gaming-card p-6 md:p-8 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.published_at || article.created_at)}
                </span>
                <ShareButtons url={currentUrl} title={article.title} />
              </div>
              
              {article.excerpt && (
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </div>

            {article.content && (
              <div className="gaming-card p-6 md:p-8">
                <MarkdownContent content={article.content} />
              </div>
            )}

            {relatedArticles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">مقالات مشابهة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {relatedArticles.map((related) => (
                    <Link key={related.id} to={`/articles/${related.slug}`}>
                      <article className="gaming-card group cursor-pointer">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={related.cover_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                            alt={related.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                          <div className="absolute top-3 right-3 flex flex-col items-center justify-center bg-yellow-500 text-black px-2 py-1 rounded-lg shadow-lg">
                            <span className="text-xs font-bold">مقالة</span>
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

export default ArticleDetail;
