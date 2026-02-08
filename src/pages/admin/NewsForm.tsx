import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Save, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import RichContentEditor from "@/components/admin/RichContentEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAIContent } from "@/hooks/useAIContent";

interface NewsFormData {
  title: string;
  slug: string;
  cover_url: string;
  content: string;
  excerpt: string;
  is_published: boolean;
}

const NewsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    slug: "",
    cover_url: "",
    content: "",
    excerpt: "",
    is_published: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);

  // AI Content Generation Hook
  const { generateContent, isGenerating } = useAIContent({
    type: 'news',
    onSuccess: (content) => {
      setFormData((prev) => ({
        ...prev,
        title: content.title || prev.title,
        excerpt: content.excerpt || prev.excerpt,
        content: content.content || prev.content,
      }));
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchNews();
    }
  }, [id]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        cover_url: data.cover_url || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        is_published: data.is_published || false,
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("حدث خطأ أثناء تحميل الخبر");
      navigate("/admin/news");
    } finally {
      setIsFetching(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A\s-]/g, "")
      .replace(/\s+/g, "-")
      .concat("-", Math.random().toString(36).substring(2, 10));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("يرجى إدخال العنوان");
      return;
    }

    setIsLoading(true);

    try {
      const newsData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        cover_url: formData.cover_url || null,
        content: formData.content || null,
        excerpt: formData.excerpt || null,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", id);
        if (error) throw error;
        toast.success("تم تحديث الخبر بنجاح");
      } else {
        const { error } = await supabase.from("news").insert(newsData);
        if (error) throw error;
        toast.success("تم إنشاء الخبر بنجاح");
      }

      navigate("/admin/news");
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error saving news:", error);
      }
      
      if (error.code === "23505") {
        toast.error("هذا الـ slug مستخدم بالفعل");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-muted-foreground animate-pulse">جاري التحميل...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/news")}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isEditing ? "تعديل الخبر" : "خبر جديد"}
            </h2>
            <p className="text-muted-foreground">
              {isEditing ? "تعديل بيانات الخبر" : "إضافة خبر جديد للموقع"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">العنوان *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateContent(formData.title)}
                    disabled={isGenerating || !formData.title.trim()}
                    className="gap-2 text-xs"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    {isGenerating ? "جاري التوليد..." : "توليد بالذكاء"}
                  </Button>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="عنوان الخبر"
                  className="bg-muted"
                />
              </div>

              <ImageUploader
                value={formData.cover_url}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, cover_url: url }))
                }
                label="صورة الغلاف"
                folder="news"
              />

              <div className="space-y-2">
                <Label htmlFor="excerpt">الوصف المختصر</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="وصف قصير للخبر..."
                  className="bg-muted min-h-[100px]"
                />
              </div>

              <RichContentEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                label="المحتوى"
                placeholder="اكتب محتوى الخبر الكامل هنا..."
              />
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>النشر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_published">نشر الخبر</Label>
                  <p className="text-sm text-muted-foreground">
                    اجعل الخبر مرئياً للجميع
                  </p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_published: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/news")}
            >
              إلغاء
            </Button>
            <Button type="submit" className="btn-gaming" disabled={isLoading}>
              <Save className="h-4 w-4 ml-2" />
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewsForm;
