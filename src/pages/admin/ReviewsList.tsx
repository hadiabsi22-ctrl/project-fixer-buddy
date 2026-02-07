import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  title: string;
  category: string;
  rating: number;
  is_published: boolean;
  created_at: string;
}

const ReviewsList = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, title, category, rating, is_published, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("حدث خطأ أثناء تحميل المراجعات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(currentStatus ? "تم إلغاء النشر" : "تم النشر بنجاح");
      fetchReviews();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("حدث خطأ");
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("تم حذف المراجعة");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">المراجعات</h2>
            <p className="text-muted-foreground">إدارة مراجعات الألعاب</p>
          </div>
          <Button asChild className="btn-gaming">
            <Link to="/admin/reviews/new">
              <Plus className="h-4 w-4 ml-2" />
              مراجعة جديدة
            </Link>
          </Button>
        </div>

        <div className="gaming-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              لا توجد مراجعات حتى الآن
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.title}</TableCell>
                    <TableCell>{review.category}</TableCell>
                    <TableCell>
                      <span className="rating-badge text-xs">
                        {review.rating}/10
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={review.is_published ? "default" : "secondary"}
                        className={review.is_published ? "bg-green-500/20 text-green-500" : ""}
                      >
                        {review.is_published ? "منشور" : "مسودة"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(review.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(review.id, review.is_published)}
                          title={review.is_published ? "إلغاء النشر" : "نشر"}
                        >
                          {review.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/reviews/${review.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف المراجعة</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذه المراجعة؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReview(review.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                حذف
                              </AlertDialogAction>
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

export default ReviewsList;
