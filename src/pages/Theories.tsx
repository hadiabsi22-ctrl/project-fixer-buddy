import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "@/components/LazyImage";

interface Theory {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  alt_text: string | null;
  excerpt: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 9;

const Theories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [theories, setTheories] = useState<Theory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTheories = async () => {
      try {
        setIsLoading(true);
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // Get total count
        const { count } = await supabase
          .from("theories")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true);

        setTotalCount(count || 0);

        // Get paginated data
        const { data, error } = await supabase
          .from("theories")
          .select("id, title, slug, cover_url, alt_text, excerpt, created_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .range(from, to);

        if (error) throw error;
        setTheories(data || []);
      } catch (error) {
        console.error("Error fetching theories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheories();
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
        <title>النظريات | ReviewQeem - تحليلات ونظريات الألعاب</title>
        <meta name="description" content="تحليلات ونظريات معمقة حول ألعابنا المفضلة. اكتشف أسرار قصص الألعاب وشخصياتها." />
        <link rel="canonical" href="https://www.reviewqeem.online/theories" />
      </Helmet>
      
      <Header />
      <main className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3 sm:mb-4">
              النظريات
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-4">
              تحليلات ونظريات معمقة حول ألعابنا المفضلة
            </p>
          </div>

          {/* Theories List */}
          {isLoading ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-muted-foreground animate-pulse">جاري التحميل...</p>
            </div>
          ) : theories.length > 0 ? (
            <>
              <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                {theories.map((theory, index) => (
                  <Link
                    key={theory.id}
                    to={`/theories/${theory.slug}`}
                  >
                    <article
                      className="gaming-card flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 animate-slide-up cursor-pointer group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Image */}
                      <div className="relative sm:w-40 md:w-48 sm:h-28 md:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                        <LazyImage
                          src={theory.cover_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                          alt={theory.alt_text || theory.title}
                          className="w-full h-40 sm:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Theory Badge */}
                        <div className="absolute top-2 right-2 flex items-center justify-center bg-cyan-500 text-white px-2 py-1 rounded-lg shadow-lg">
                          <span className="text-xs font-bold">نظرية</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {theory.title}
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                          {theory.excerpt || "لا يوجد وصف"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(theory.created_at)}
                          </span>
                          <span className="text-primary text-sm font-medium group-hover:translate-x-[-4px] transition-transform">
                            قراءة المزيد ←
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
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
                لا توجد نظريات متاحة حالياً
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Theories;
