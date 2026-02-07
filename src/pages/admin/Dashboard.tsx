import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Lightbulb, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalReviews: number;
  publishedReviews: number;
  totalTheories: number;
  publishedTheories: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    publishedReviews: 0,
    totalTheories: 0,
    publishedTheories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reviewsRes, theoriesRes] = await Promise.all([
          supabase.from("reviews").select("id, is_published"),
          supabase.from("theories").select("id, is_published"),
        ]);

        const reviews = reviewsRes.data || [];
        const theories = theoriesRes.data || [];

        setStats({
          totalReviews: reviews.length,
          publishedReviews: reviews.filter((r) => r.is_published).length,
          totalTheories: theories.length,
          publishedTheories: theories.filter((t) => t.is_published).length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "إجمالي المراجعات",
      value: stats.totalReviews,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "المراجعات المنشورة",
      value: stats.publishedReviews,
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "إجمالي النظريات",
      value: stats.totalTheories,
      icon: Lightbulb,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "النظريات المنشورة",
      value: stats.publishedTheories,
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">مرحباً بك في لوحة التحكم</h2>
            <p className="text-muted-foreground">إدارة المراجعات والنظريات</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="btn-gaming">
              <Link to="/admin/reviews/new">
                <Plus className="h-4 w-4 ml-2" />
                مراجعة جديدة
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/theories/new">
                <Plus className="h-4 w-4 ml-2" />
                نظرية جديدة
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                المراجعات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                إدارة مراجعات الألعاب وإضافة محتوى جديد
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/reviews">عرض الكل</Link>
                </Button>
                <Button asChild size="sm" className="btn-gaming">
                  <Link to="/admin/reviews/new">إضافة مراجعة</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-secondary" />
                النظريات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                إدارة النظريات والتحليلات العميقة
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/theories">عرض الكل</Link>
                </Button>
                <Button asChild size="sm" className="btn-gaming">
                  <Link to="/admin/theories/new">إضافة نظرية</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
