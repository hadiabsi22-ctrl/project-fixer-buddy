import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search as SearchIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: "review" | "theory";
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  excerpt: string | null;
  rating?: number | null;
  category?: string;
  created_at: string;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchInput(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    // Sanitize search query
    const sanitizedQuery = searchQuery
      .trim()
      .substring(0, 100) // Max 100 characters
      .replace(/[%_\\]/g, '') // Remove special LIKE characters
      .replace(/[<>]/g, ''); // Remove HTML tags

    if (sanitizedQuery.length < 2) {
      setResults([]);
      setHasSearched(true);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Search in reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("id, title, slug, cover_url, excerpt, rating, category, created_at")
        .eq("is_published", true)
        .ilike("title", `%${sanitizedQuery}%`)
        .order("published_at", { ascending: false })
        .limit(20);

      // Search in theories
      const { data: theoriesData } = await supabase
        .from("theories")
        .select("id, title, slug, cover_url, excerpt, created_at")
        .eq("is_published", true)
        .ilike("title", `%${sanitizedQuery}%`)
        .order("published_at", { ascending: false })
        .limit(20);

      const searchResults: SearchResult[] = [
        ...(reviewsData || []).map((review) => ({
          type: "review" as const,
          ...review,
        })),
        ...(theoriesData || []).map((theory) => ({
          type: "theory" as const,
          ...theory,
        })),
      ];

      setResults(searchResults);
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
      performSearch(searchInput.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>بحث {query ? `- ${query}` : ""} | ReviewQeem</title>
        <meta name="description" content="ابحث عن المراجعات والنظريات في ReviewQeem" />
      </Helmet>
      
      <Header />
      <main className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Search Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
              البحث
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحث عن مراجعة أو نظرية..."
                  className="w-full px-6 py-4 pr-14 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-transparent text-lg"
                  dir="rtl"
                />
                <button
                  type="submit"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-purple-600 transition-colors"
                  aria-label="بحث"
                >
                  <SearchIcon size={24} />
                </button>
              </div>
            </form>
          </div>

          {/* Search Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground animate-pulse">جاري البحث...</p>
            </div>
          ) : hasSearched ? (
            results.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    تم العثور على <span className="text-foreground font-bold">{results.length}</span> نتيجة
                    {query && ` لـ "${query}"`}
                  </p>
                </div>
                
                <div className="space-y-6">
                  {results.map((result) => (
                    <div key={`${result.type}-${result.id}`}>
                      {result.type === "review" ? (
                        <ReviewCard
                          review={{
                            id: result.id,
                            title: result.title,
                            slug: result.slug,
                            cover: result.cover_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                            rating: result.rating || 0,
                            category: result.category || "",
                            excerpt: result.excerpt || "",
                            date: formatDate(result.created_at),
                          }}
                        />
                      ) : (
                        <Link to={`/theories/${result.slug}`}>
                          <article className="gaming-card flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 cursor-pointer group">
                            <div className="sm:w-40 md:w-48 sm:h-28 md:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                              <img
                                src={result.cover_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                                alt={result.title}
                                loading="lazy"
                                className="w-full h-40 sm:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {result.title}
                              </h3>
                              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                                {result.excerpt || "لا يوجد وصف"}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(result.created_at)}
                              </span>
                            </div>
                          </article>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  لم يتم العثور على نتائج
                </p>
                <p className="text-muted-foreground text-sm">
                  جرب البحث بكلمات مختلفة
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <SearchIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">
                ابحث عن المراجعات والنظريات
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
