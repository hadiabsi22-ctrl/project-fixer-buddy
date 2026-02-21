import { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
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

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, title, slug, cover_url, rating, category, excerpt, created_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section id="reviews" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">أحدث المراجعات</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            اطلع على أحدث تقييماتنا للألعاب مع تحليل شامل لكل جوانب اللعبة
          </p>
        </div>

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground animate-pulse">جاري التحميل...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              لا توجد مراجعات متاحة حالياً
            </p>
          </div>
        )}

        {/* View All Button */}
        {reviews.length > 0 && (
          <div className="text-center mt-12">
            <a href="/reviews" className="btn-gaming inline-block">
              عرض جميع المراجعات
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
