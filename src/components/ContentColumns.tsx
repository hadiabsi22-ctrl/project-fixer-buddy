import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getRatingLabel } from "@/lib/utils";

interface Review {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  rating: number | null;
  category: string;
  created_at: string;
}

interface Theory {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  created_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  created_at: string;
}

const MiniCard = ({ 
  title, 
  slug, 
  cover_url, 
  date, 
  type, 
  rating 
}: { 
  title: string; 
  slug: string; 
  cover_url: string | null; 
  date: string; 
  type: "review" | "theory" | "article" | "news";
  rating?: number | null;
}) => {
  const linkPath = type === "review" ? `/reviews/${slug}` : type === "theory" ? `/theories/${slug}` : type === "news" ? `/news/${slug}` : `/articles/${slug}`;
  const defaultImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link to={linkPath} className="group block">
      <article className="flex gap-3 p-3 rounded-lg bg-card border border-border hover:border-foreground/20 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
          <img
            src={cover_url || defaultImage}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/20" />
          {/* Rating Badge for Reviews */}
          {type === "review" && rating && (
            <div className="absolute top-1 right-1 flex flex-col items-center justify-center bg-[#a855f7] text-white p-0.5 rounded-lg min-w-[24px] shadow-lg">
              <span className="text-[10px] font-black leading-none">{rating}</span>
              <span className="text-[6px] font-bold mt-0.5 opacity-90">
                {getRatingLabel(rating)}
              </span>
            </div>
          )}
          {/* Theory Badge */}
          {type === "theory" && (
            <div className="absolute top-1 right-1 flex items-center justify-center bg-cyan-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg">
              <span className="text-[8px] font-bold">نظرية</span>
            </div>
          )}
          {/* Article Badge */}
          {type === "article" && (
            <div className="absolute top-1 right-1 flex items-center justify-center bg-yellow-500 text-black px-1.5 py-0.5 rounded-lg shadow-lg">
              <span className="text-[8px] font-bold">مقالة</span>
            </div>
          )}
          {/* News Badge */}
          {type === "news" && (
            <div className="absolute top-1 right-1 flex items-center justify-center bg-red-500 text-white px-1.5 py-0.5 rounded-lg shadow-lg">
              <span className="text-[8px] font-bold">خبر</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors leading-tight">
            {title}
          </h3>
          <span className="text-xs text-muted-foreground mt-1">
            {formatDate(date)}
          </span>
        </div>
      </article>
    </Link>
  );
};

const ContentColumns = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [theories, setTheories] = useState<Theory[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [reviewsResponse, theoriesResponse, articlesResponse, newsResponse] = await Promise.all([
          supabase
            .from("reviews")
            .select("id, title, slug, cover_url, rating, category, created_at")
            .eq("is_published", true)
            .order("published_at", { ascending: false })
            .limit(6),
          supabase
            .from("theories")
            .select("id, title, slug, cover_url, created_at")
            .eq("is_published", true)
            .order("published_at", { ascending: false })
            .limit(6),
          supabase
            .from("articles")
            .select("id, title, slug, cover_url, created_at")
            .eq("is_published", true)
            .order("published_at", { ascending: false })
            .limit(6),
          supabase
            .from("news")
            .select("id, title, slug, cover_url, created_at")
            .eq("is_published", true)
            .order("published_at", { ascending: false })
            .limit(6),
        ]);

        if (reviewsResponse.data) setReviews(reviewsResponse.data);
        if (theoriesResponse.data) setTheories(theoriesResponse.data);
        if (articlesResponse.data) setArticles(articlesResponse.data);
        if (newsResponse.data) setNews(newsResponse.data);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <p className="text-center text-muted-foreground animate-pulse">جاري التحميل...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Reviews Column */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">أحدث المراجعات</h2>
              <Link to="/reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">عرض الكل ←</Link>
            </div>
            <div className="space-y-3">
              {reviews.length > 0 ? reviews.map((review) => (
                <MiniCard key={review.id} title={review.title} slug={review.slug} cover_url={review.cover_url} date={review.created_at} type="review" rating={review.rating} />
              )) : (
                <p className="text-muted-foreground text-center py-8">لا توجد مراجعات متاحة</p>
              )}
            </div>
          </div>

          {/* Theories Column */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">أحدث النظريات</h2>
              <Link to="/theories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">عرض الكل ←</Link>
            </div>
            <div className="space-y-3">
              {theories.length > 0 ? theories.map((theory) => (
                <MiniCard key={theory.id} title={theory.title} slug={theory.slug} cover_url={theory.cover_url} date={theory.created_at} type="theory" />
              )) : (
                <p className="text-muted-foreground text-center py-8">لا توجد نظريات متاحة</p>
              )}
            </div>
          </div>

          {/* Articles Column */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">أحدث المقالات</h2>
              <Link to="/articles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">عرض الكل ←</Link>
            </div>
            <div className="space-y-3">
              {articles.length > 0 ? articles.map((article) => (
                <MiniCard key={article.id} title={article.title} slug={article.slug} cover_url={article.cover_url} date={article.created_at} type="article" />
              )) : (
                <p className="text-muted-foreground text-center py-8">لا توجد مقالات متاحة</p>
              )}
            </div>
          </div>
        </div>

        {/* News Section - Full Width */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">أحدث الأخبار</h2>
            <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">عرض الكل ←</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {news.length > 0 ? news.map((item) => (
              <MiniCard key={item.id} title={item.title} slug={item.slug} cover_url={item.cover_url} date={item.created_at} type="news" />
            )) : (
              <p className="text-muted-foreground text-center py-8 col-span-full">لا توجد أخبار متاحة</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentColumns;
