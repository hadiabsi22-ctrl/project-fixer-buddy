import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Save } from "lucide-react";
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


interface ArticleFormData {
  title: string;
  slug: string;
  cover_url: string;
  alt_text: string;
  content: string;
  excerpt: string;
  is_published: boolean;
}

const ArticleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "", slug: "", cover_url: "", alt_text: "", content: "", excerpt: "", is_published: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);


  useEffect(() => {
    if (isEditing) fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
      if (error) throw error;
      setFormData({
        title: data.title || "", slug: data.slug || "", cover_url: data.cover_url || "",
        alt_text: (data as any).alt_text || "", content: data.content || "", excerpt: data.excerpt || "", is_published: data.is_published || false,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("حدث خطأ أثناء تحميل المقالة");
      navigate("/admin/articles");
    } finally {
      setIsFetching(false);
    }
  };

  const generateSlugLocal = (title: string) => {
    return generateSlug(title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title, slug: !isEditing ? generateSlug(title) : prev.slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error("يرجى إدخال العنوان"); return; }
    setIsLoading(true);
    try {
      const articleData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        cover_url: formData.cover_url || null,
        alt_text: formData.alt_text || null,
        content: formData.content || null,
        excerpt: formData.excerpt || null,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase.from("articles").update(articleData).eq("id", id);
        if (error) throw error;
        toast.success("تم تحديث المقالة بنجاح");
      } else {
        const { error } = await supabase.from("articles").insert(articleData);
        if (error) throw error;
        toast.success("تم إنشاء المقالة بنجاح");
      }
      navigate("/admin/articles");
    } catch (error: any) {
      if (error.code === "23505") toast.error("هذا الـ slug مستخدم بالفعل");
      else if (error.message) toast.error(error.message);
      else toast.error("حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً");
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/articles")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{isEditing ? "تعديل المقالة" : "مقالة جديدة"}</h2>
            <p className="text-muted-foreground">{isEditing ? "تعديل بيانات المقالة" : "إضافة مقالة جديدة للموقع"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="gaming-card">
            <CardHeader><CardTitle>المعلومات الأساسية</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input id="title" value={formData.title} onChange={handleTitleChange} placeholder="عنوان المقالة" className="bg-muted" />
              </div>

              <ImageUploader value={formData.cover_url} onChange={(url) => setFormData((prev) => ({ ...prev, cover_url: url }))} label="صورة الغلاف" folder="articles" />

              <div className="space-y-2">
                <Label htmlFor="alt_text">النص البديل للصورة (Alt Text)</Label>
                <Input id="alt_text" value={formData.alt_text} onChange={(e) => setFormData((prev) => ({ ...prev, alt_text: e.target.value }))} placeholder="وصف الصورة لمحركات البحث، مثال: ميا وينترز من لعبة ريزيدنت إيفل" className="bg-muted" />
                <p className="text-xs text-muted-foreground">إذا ترك فارغاً سيتم استخدام العنوان تلقائياً</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">الوصف المختصر</Label>
                <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))} placeholder="وصف قصير للمقالة..." className="bg-muted min-h-[100px]" />
              </div>

              <RichContentEditor value={formData.content} onChange={(content) => setFormData((prev) => ({ ...prev, content }))} label="المحتوى" placeholder="اكتب محتوى المقالة الكامل هنا..." />
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader><CardTitle>النشر</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_published">نشر المقالة</Label>
                  <p className="text-sm text-muted-foreground">اجعل المقالة مرئية للجميع</p>
                </div>
                <Switch id="is_published" checked={formData.is_published} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/articles")}>إلغاء</Button>
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

export default ArticleForm;
