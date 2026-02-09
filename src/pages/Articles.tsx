import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  excerpt: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 9;

const Articles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { count } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true);

        setTotalCount(count || 0);

        const { data, error } = await supabase
          .from("articles")
          .select("id, title, slug, cover_url, excerpt, created_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .range(from, to);

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
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
        <title>المقالات | ReviewQeem - مقالات متخصصة في عالم الألعاب</title>
        <meta name="description" content="مقالات متعمقة ومتخصصة حول عالم ألعاب الفيديو، تحليلات شاملة وآراء نقدية من خبراء الصناعة." />
        <link rel="canonical" href="https://reviewqeem.com/articles" />
      </Helmet>
      
      <Header />
      <main className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3 sm:mb-4">
              المقالات
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-4">
              مقالات متعمقة ومتخصصة في عالم الألعاب
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-muted-foreground animate-pulse">جاري التحميل...</p>
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {articles.map((item, index) => (
                  <Link key={item.id} to={`/articles/${item.slug}`}>
                    <article
                      className="gaming-card group cursor-pointer animate-slide-up overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={item.cover_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                        
                        {/* Article Badge - Yellow */}
                        <div className="absolute top-3 right-3 flex flex-col items-center justify-center bg-yellow-500 text-black px-2 py-1 rounded-lg shadow-lg">
                          <span className="text-xs font-bold">مقالة</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.excerpt || "لا يوجد وصف"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.created_at)}
                          </span>
                          <span className="text-primary text-sm font-medium group-hover:translate-x-[-4px] transition-transform">
                            اقرأ المزيد ←
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

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
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      
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
                لا توجد مقالات متاحة حالياً
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Articles;
