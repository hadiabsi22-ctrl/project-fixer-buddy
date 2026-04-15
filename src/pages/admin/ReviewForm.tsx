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
import { generateSlug } from "@/lib/slugUtils";


interface ReviewFormData {
  title: string;
  slug: string;
  cover_url: string;
  alt_text: string;
  content: string;
  excerpt: string;
  rating: string;
  category: string;
  is_published: boolean;
  pros: string;
  cons: string;
}

const ReviewForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ReviewFormData>({
    title: "",
    slug: "",
    cover_url: "",
    alt_text: "",
    content: "",
    excerpt: "",
    rating: "",
    category: "",
    is_published: false,
    pros: "",
    cons: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);


  useEffect(() => {
    if (isEditing) {
      fetchReview();
    }
  }, [id]);

  const fetchReview = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Parse pros/cons from content if stored as JSON metadata
      let pros = "";
      let cons = "";
      if (data.content) {
        const prosMatch = data.content.match(/<!--PROS:(.*?)-->/s);
        const consMatch = data.content.match(/<!--CONS:(.*?)-->/s);
        if (prosMatch) pros = prosMatch[1];
        if (consMatch) cons = consMatch[1];
      }
      
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        cover_url: data.cover_url || "",
        alt_text: (data as any).alt_text || "",
        content: data.content?.replace(/<!--PROS:.*?-->/s, "").replace(/<!--CONS:.*?-->/s, "") || "",
        excerpt: data.excerpt || "",
        rating: data.rating?.toString() || "",
        category: data.category || "",
        is_published: data.is_published || false,
        pros,
        cons,
      });
    } catch (error) {
      console.error("Error fetching review:", error);
      toast.error("حدث خطأ أثناء تحميل المراجعة");
      navigate("/admin/reviews");
    } finally {
      setIsFetching(false);
    }
  };

  const generateSlugLocal = (title: string) => generateSlug(title);

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

    if (!formData.title || !formData.category) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    const rating = parseFloat(formData.rating);
    if (formData.rating && (isNaN(rating) || rating < 0 || rating > 10)) {
      toast.error("التقييم يجب أن يكون بين 0 و 10");
      return;
    }

    setIsLoading(true);

    try {
      // Embed pros/cons as hidden metadata in content
      let contentWithMeta = formData.content || "";
      if (formData.pros) contentWithMeta += `<!--PROS:${formData.pros}-->`;
      if (formData.cons) contentWithMeta += `<!--CONS:${formData.cons}-->`;
      
      const reviewData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        cover_url: formData.cover_url || null,
        alt_text: formData.alt_text || null,
        content: contentWithMeta || null,
        excerpt: formData.excerpt || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        category: formData.category,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("reviews")
          .update(reviewData)
          .eq("id", id);
        if (error) throw error;
        toast.success("تم تحديث المراجعة بنجاح");
      } else {
        const { error } = await supabase.from("reviews").insert(reviewData);
        if (error) throw error;
        toast.success("تم إنشاء المراجعة بنجاح");
      }

      navigate("/admin/reviews");
    } catch (error: any) {
      // Log error details only in development
      if (import.meta.env.DEV) {
        console.error("Error saving review:", error);
      }
      
      // User-friendly error messages
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
            onClick={() => navigate("/admin/reviews")}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isEditing ? "تعديل المراجعة" : "مراجعة جديدة"}
            </h2>
            <p className="text-muted-foreground">
              {isEditing ? "تعديل بيانات المراجعة" : "إضافة مراجعة جديدة للموقع"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="عنوان المراجعة"
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">التصنيف *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="مثال: أكشن، RPG"
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">التقييم (0-10)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rating: e.target.value }))
                  }
                  placeholder="8.5"
                  className="bg-muted"
                  dir="ltr"
                />
              </div>

              <ImageUploader
                value={formData.cover_url}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, cover_url: url }))
                }
                label="صورة الغلاف"
                folder="reviews"
              />

              <div className="space-y-2">
                <Label htmlFor="alt_text">النص البديل للصورة (Alt Text)</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="وصف الصورة لمحركات البحث"
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">إذا ترك فارغاً سيتم استخدام العنوان تلقائياً</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">الوصف المختصر</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="وصف قصير للمراجعة..."
                  className="bg-muted min-h-[100px]"
                />
              </div>

              <RichContentEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                label="المحتوى"
                placeholder="اكتب محتوى المراجعة الكامل هنا..."
              />
            </CardContent>
          </Card>

          {/* Pros & Cons Section */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>الإيجابيات والسلبيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pros" className="text-green-500 flex items-center gap-2">
                  <span className="text-lg">✓</span> الإيجابيات
                </Label>
                <Textarea
                  id="pros"
                  value={formData.pros}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pros: e.target.value }))
                  }
                  placeholder="اكتب كل إيجابية في سطر منفصل..."
                  className="bg-muted min-h-[120px] border-green-500/30 focus:border-green-500"
                />
                <p className="text-xs text-muted-foreground">اكتب كل نقطة في سطر جديد</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cons" className="text-red-500 flex items-center gap-2">
                  <span className="text-lg">✗</span> السلبيات
                </Label>
                <Textarea
                  id="cons"
                  value={formData.cons}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cons: e.target.value }))
                  }
                  placeholder="اكتب كل سلبية في سطر منفصل..."
                  className="bg-muted min-h-[120px] border-red-500/30 focus:border-red-500"
                />
                <p className="text-xs text-muted-foreground">اكتب كل نقطة في سطر جديد</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>النشر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_published">نشر المراجعة</Label>
                  <p className="text-sm text-muted-foreground">
                    اجعل المراجعة مرئية للجميع
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
              onClick={() => navigate("/admin/reviews")}
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

export default ReviewForm;
