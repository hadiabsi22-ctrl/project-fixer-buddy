import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ArticleItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

const ArticlesList = () => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, is_published, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("حدث خطأ أثناء تحميل المقالات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ is_published: !currentStatus, published_at: !currentStatus ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
      toast.success(currentStatus ? "تم إلغاء النشر" : "تم النشر بنجاح");
      fetchArticles();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("حدث خطأ");
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم حذف المقالة");
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">المقالات</h2>
            <p className="text-muted-foreground">إدارة مقالات الألعاب</p>
          </div>
          <Button asChild className="btn-gaming">
            <Link to="/admin/articles/new">
              <Plus className="h-4 w-4 ml-2" />
              مقالة جديدة
            </Link>
          </Button>
        </div>

        <div className="gaming-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد مقالات حتى الآن</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_published ? "default" : "secondary"} className={item.is_published ? "bg-green-500/20 text-green-500" : ""}>
                        {item.is_published ? "منشور" : "مسودة"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(item.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => togglePublish(item.id, item.is_published)} title={item.is_published ? "إلغاء النشر" : "نشر"}>
                          {item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/articles/${item.id}`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف المقالة</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد من حذف هذه المقالة؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteArticle(item.id)} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ArticlesList;
