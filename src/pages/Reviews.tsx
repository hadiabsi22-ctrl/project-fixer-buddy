import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  rating: number | null;
  category: string;
  excerpt: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 9;

const Reviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // Get total count
        const { count } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true);

        setTotalCount(count || 0);

        // Get paginated data
        const { data, error } = await supabase
          .from("reviews")
          .select("id, title, slug, cover_url, rating, category, excerpt, created_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .range(from, to);

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>المراجعات | ReviewQeem - مراجعات الألعاب العربية</title>
        <meta name="description" content="تصفح جميع مراجعات الألعاب على ReviewQeem. تقييمات شاملة وموضوعية للألعاب الحديثة والكلاسيكية." />
        <link rel="canonical" href="https://www.reviewqeem.online/reviews" />
      </Helmet>
      
      <Header />
      <main className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3 sm:mb-4">
              جميع المراجعات
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-4">
              تصفح جميع مراجعاتنا للألعاب واكتشف تقييماتنا المفصلة
            </p>
          </div>

          {/* Reviews Grid */}
          {isLoading ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-muted-foreground animate-pulse">جاري التحميل...</p>
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ReviewCard
                      review={{
                        id: review.id,
                        title: review.title,
                        slug: review.slug,
                        cover: review.cover_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                        rating: review.rating || 0,
                        category: review.category,
                        excerpt: review.excerpt || "",
                        date: formatDate(review.created_at),
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/10 hover:border-purple-600/30 transition-all"
                    aria-label="الصفحة السابقة"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            currentPage === pageNum
                              ? "bg-purple-600 text-white"
                              : "bg-card border border-border text-foreground hover:bg-purple-600/10 hover:border-purple-600/30"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/10 hover:border-purple-600/30 transition-all"
                    aria-label="الصفحة التالية"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <p className="text-muted-foreground text-base sm:text-lg">
                لا توجد مراجعات متاحة حالياً
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reviews;
