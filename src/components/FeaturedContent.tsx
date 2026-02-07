import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { getRatingLabel } from "@/lib/utils";

interface FeaturedItem {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  content: string | null;
  excerpt: string | null;
  rating?: number | null;
  category?: string;
  published_at: string | null;
  created_at: string;
  type: 'review' | 'theory';
}

const FeaturedContent = () => {
  const [item, setItem] = useState<FeaturedItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data: rev } = await supabase
          .from("reviews")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(1);

        if (rev && rev[0]) {
          setItem({ ...rev[0], type: 'review' });
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // استخراج أول 150 حرف من المحتوى كمقتطف
  const getShortExcerpt = (excerpt: string | null, content: string | null) => {
    if (excerpt) return excerpt;
    if (!content) return "";
    
    // إزالة العلامات والتنسيق
    const cleanContent = content
      .replace(/<!--.*?-->/gs, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/##?\s*/g, "")
      .replace(/\n+/g, " ")
      .trim();
    
    return cleanContent.substring(0, 200) + (cleanContent.length > 200 ? "..." : "");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="w-full h-[400px] bg-[#111] animate-pulse rounded-3xl flex items-center justify-center border border-white/5">
            <span className="text-gray-600 font-medium">جاري تأمين الاتصال...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const detailUrl = item.type === 'review' ? `/reviews/${item.slug}` : `/theories/${item.slug}`;

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* الكرت الرئيسي للمحتوى المميز */}
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#111] border border-white/5 transition-all duration-500 hover:border-purple-600/20">
          
          <Link to={detailUrl} className="block relative">
            {/* الصورة مع تأثيرات الظل الجديدة */}
            <div className="relative aspect-video md:aspect-[21/9] overflow-hidden font-sans">
              {item.cover_url && (
                <>
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* تدرج لوني أسود عميق ليناسب الهوية الجديدة */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent" />
                  
                  {/* Rating Badge - تصميم مطور */}
                  {item.rating && (
                    <div className="absolute top-6 left-6 flex flex-col items-center justify-center bg-[#a855f7] text-white p-2 rounded-2xl min-w-[56px] shadow-lg">
                      <span className="text-lg font-black leading-none">{item.rating}</span>
                      <span className="text-[9px] font-bold mt-0.5 opacity-90">
                        {getRatingLabel(item.rating)}
                      </span>
                    </div>
                  )}
                  
                  {/* معلومات العنوان فوق الصورة */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-right">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full bg-purple-600/20 border border-purple-600/30 text-purple-400 text-xs font-bold">
                        أحدث {item.type === 'review' ? 'مراجعة' : 'نظرية'}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
                      <Calendar size={16} className="text-purple-600" />
                      <span>{formatDate(item.published_at || item.created_at)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Link>

          {/* النص المختصر (Excerpt) بتنسيق هادئ */}
          <div className="p-8 md:p-10 bg-[#111] border-t border-white/5">
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#a855f7] prose-h1:text-[#a855f7] prose-h2:text-[#a855f7] prose-h3:text-[#a855f7] prose-p:text-white prose-p:leading-relaxed prose-a:text-purple-400 prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:text-gray-300 prose-blockquote:border-purple-600/50 prose-code:text-purple-400 prose-pre:bg-[#1a1a1a] prose-img:rounded-xl">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-white text-lg leading-relaxed mb-4 line-clamp-3">
                      {children}
                    </p>
                  ),
                }}
              >
                {getShortExcerpt(item.excerpt, item.content)}
              </ReactMarkdown>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Link 
                to={detailUrl} 
                className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-bold px-6 py-3 rounded-xl transition-all group/btn text-lg"
              >
                اقرأ المزيد
                <ChevronLeft size={20} className="transition-transform group-hover/btn:-translate-x-2" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturedContent;
