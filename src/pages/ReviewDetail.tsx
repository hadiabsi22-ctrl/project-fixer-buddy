import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowRight, Calendar, Tag, Plus, Minus } from "lucide-react";
import { getRatingLabel } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import MarkdownContent from "@/components/MarkdownContent";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  content: string | null;
  excerpt: string | null;
  rating: number | null;
  category: string;
  published_at: string | null;
  created_at: string;
}

interface RelatedReview {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  rating: number | null;
  category: string;
  excerpt: string | null;
}

const ReviewDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [review, setReview] = useState<Review | null>(null);
  const [relatedReviews, setRelatedReviews] = useState<RelatedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + location.pathname : '';

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setReview(data);
          
          // Fetch related reviews
          const { data: relatedData } = await supabase
            .from("reviews")
            .select("id, title, slug, cover_url, rating, category, excerpt")
            .eq("is_published", true)
            .eq("category", data.category)
            .neq("id", data.id)
            .order("published_at", { ascending: false })
            .limit(3);
          
          setRelatedReviews(relatedData || []);
        }
      } catch (error) {
        console.error("Error fetching review:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [slug]);

  // Extract pros and cons from content
  const extractProsAndCons = (content: string) => {
    const prosMatch = content?.match(/<!--PROS:(.*?)-->/s);
    const consMatch = content?.match(/<!--CONS:(.*?)-->/s);
    return {
      pros: prosMatch ? prosMatch[1].split('\n').filter(p => p.trim()) : [],
      cons: consMatch ? consMatch[1].split('\n').filter(c => c.trim()) : [],
    };
  };
  
  const { pros, cons } = review ? extractProsAndCons(review.content || "") : { pros: [], cons: [] };

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

  if (notFound || !review) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-foreground">المراجعة غير موجودة</h1>
          <Link to="/reviews" className="text-primary hover:underline flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للمراجعات
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Generate JSON-LD structured data for review
  const generateReviewJsonLd = () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "VideoGame",
        "name": review.title,
        "genre": review.category,
        ...(review.cover_url && { "image": review.cover_url })
      },
      "reviewRating": review.rating ? {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "10",
        "worstRating": "0"
      } : undefined,
      "name": review.title,
      "author": {
        "@type": "Organization",
        "name": "ReviewQeem"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ReviewQeem",
        "url": "https://www.reviewqeem.online"
      },
      "datePublished": review.published_at || review.created_at,
      "description": review.excerpt || `مراجعة ${review.title}`,
      "url": currentUrl,
      ...(review.cover_url && { "image": review.cover_url }),
      ...(pros.length > 0 && { "positiveNotes": { "@type": "ItemList", "itemListElement": pros.map((p, i) => ({ "@type": "ListItem", "position": i + 1, "name": p })) } }),
      ...(cons.length > 0 && { "negativeNotes": { "@type": "ItemList", "itemListElement": cons.map((c, i) => ({ "@type": "ListItem", "position": i + 1, "name": c })) } })
    };
    return JSON.stringify(jsonLd);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{review.title} | مراجعة - ReviewQeem</title>
        <meta name="description" content={review.excerpt || `مراجعة ${review.title} - تقييم ${review.rating}/10`} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={`${review.title} | ReviewQeem`} />
        <meta property="og:description" content={review.excerpt || `مراجعة ${review.title}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        {review.cover_url && <meta property="og:image" content={review.cover_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${review.title} | ReviewQeem`} />
        <meta name="twitter:description" content={review.excerpt || `مراجعة ${review.title}`} />
        {review.cover_url && <meta name="twitter:image" content={review.cover_url} />}
        <script type="application/ld+json">{generateReviewJsonLd()}</script>
      </Helmet>
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للمراجعات
            </Link>

            {/* Cover Image with Title Overlay */}
            <div className="relative w-full rounded-2xl overflow-hidden mb-8 group">
              {review.cover_url && (
                <>
                  <img
                    src={review.cover_url}
                    alt={review.title}
                    loading="eager"
                    className="w-full h-auto max-h-[450px] object-cover"
                  />
                  {/* Gradient overlays for soft edges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20" />
                  
                  {/* Rating Badge */}
                  {review.rating && (
                    <div className="absolute top-4 left-4 flex flex-col items-center justify-center bg-[#a855f7] text-white p-2 rounded-2xl min-w-[56px] shadow-lg">
                      <span className="text-lg font-black leading-none">{review.rating}</span>
                      <span className="text-[9px] font-bold mt-0.5 opacity-90">
                        {getRatingLabel(review.rating)}
                      </span>
                    </div>
                  )}
                  
                  {/* Title on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg mb-3">
                      {review.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {review.category}
                      </span>
                      <span className="text-white/80 text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(review.published_at || review.created_at)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {!review.cover_url && (
                <div className="w-full h-[200px] bg-card flex items-center justify-center">
                  <h1 className="text-2xl md:text-4xl font-black text-foreground">
                    {review.title}
                  </h1>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="gaming-card p-6 md:p-8 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {review.category}
                  </span>
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(review.published_at || review.created_at)}
                  </span>
                </div>
                <ShareButtons url={currentUrl} title={review.title} />
              </div>
              
              {review.excerpt && (
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {review.excerpt}
                </p>
              )}
            </div>

            {/* Content */}
            {review.content && (
              <div className="gaming-card p-6 md:p-8">
                <MarkdownContent content={review.content} />
              </div>
            )}

            {/* Pros & Cons Section */}
            {(pros.length > 0 || cons.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6 mt-12 font-cairo">
                {/* بطاقة الإيجابيات */}
                {pros.length > 0 && (
                  <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 border-t-4 border-t-emerald-500/50">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-lg">
                        <Plus className="text-emerald-500" size={24} />
                      </div>
                      الإيجابيات
                    </h3>
                    <ul className="space-y-4 text-gray-300 leading-relaxed">
                      {pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* بطاقة السلبيات */}
                {cons.length > 0 && (
                  <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 border-t-4 border-t-rose-500/50">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="bg-rose-500/10 p-2 rounded-lg">
                        <Minus className="text-rose-500" size={24} />
                      </div>
                      السلبيات
                    </h3>
                    <ul className="space-y-4 text-gray-300 leading-relaxed">
                      {cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-rose-500 mt-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReviewDetail;
