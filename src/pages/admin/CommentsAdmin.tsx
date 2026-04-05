import { useState, useEffect } from "react";
import { Check, X, MessageSquare, Calendar, Mail, User, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  article_id: string;
  name: string;
  email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

const CommentsAdmin = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });

  // جلب التعليقات والإحصائيات
  const fetchComments = async () => {
    setLoading(true);
    try {
      // جلب التعليقات حسب الفلتر
      let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data: commentsData, error: commentsError } = await query;
      if (commentsError) throw commentsError;

      // جلب الإحصائيات
      const { data: allComments, error: statsError } = await supabase
        .from('comments')
        .select('is_approved');

      if (statsError) throw statsError;

      const pendingCount = allComments?.filter(c => !c.is_approved).length || 0;
      const approvedCount = allComments?.filter(c => c.is_approved).length || 0;

      setComments(commentsData || []);
      setStats({
        pending: pendingCount,
        approved: approvedCount,
        total: allComments?.length || 0
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  // قبول التعليق
  const approveComment = async (commentId: string) => {
    setActionLoading(commentId);
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;

      // تحديث القائمة محلياً
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, is_approved: true } : c
      ));
      
      // تحديث الإحصائيات
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1
      }));
    } catch (error) {
      console.error('Error approving comment:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // رفض التعليق
  const rejectComment = async (commentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    
    setActionLoading(commentId);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // تحديث القائمة محلياً
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      // تحديث الإحصائيات
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        pending: filter === 'pending' ? Math.max(0, prev.pending - 1) : prev.pending
      }));
    } catch (error) {
      console.error('Error rejecting comment:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              إدارة التعليقات
            </h1>
            <p className="text-muted-foreground">مراجعة والموافقة على التعليقات المقدمة من المستخدمين</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">في انتظار الموافقة</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تعليقات معتمدة</p>
                  <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي التعليقات</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'pending'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              في الانتظار ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'approved'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              معتمدة ({stats.approved})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'all'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              الكل ({stats.total})
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد تعليقات {filter === 'pending' ? 'في انتظار الموافقة' : filter === 'approved' ? 'معتمدة' : ''}</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{comment.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{comment.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          comment.is_approved
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}>
                          {comment.is_approved ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              معتمد
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              في انتظار الموافقة
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-4">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {!comment.is_approved && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveComment(comment.id)}
                        disabled={actionLoading === comment.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === comment.id ? (
                          <>جاري الموافقة...</>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            موافقة
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => rejectComment(comment.id)}
                        disabled={actionLoading === comment.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === comment.id ? (
                          <>جاري الحذف...</>
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            رفض وحذف
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsAdmin;
