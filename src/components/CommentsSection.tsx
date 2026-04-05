import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  created_at: string;
}

interface CommentsSectionProps {
  articleId?: string;
  newsId?: string;
  reviewId?: string;
  theoryId?: string;
}

const CommentsSection = ({ articleId, newsId, reviewId, theoryId }: CommentsSectionProps) => {
  // تحديد ID المحتوى بناءً على النوع
  const contentId = newsId || articleId || reviewId || theoryId;
  const contentType = newsId ? 'news' : articleId ? 'articles' : reviewId ? 'reviews' : 'theories';
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    content: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [charCount, setCharCount] = useState(0);

  // قائمة الكلمات المسيئة المرشحة
  const forbiddenWords = [
    // كلمات عربية مسيئة شائعة
    'كلب', 'خنز', 'حمار', 'حمار', 'قذر', 'وسخ', 'غبي', 'أحمق', 'ساقط', 'فاسق',
    'خول', 'قحبة', 'شرموط', 'عاهرة', 'مومس', 'كس', 'طيز', 'زب', 'ديوث', 'مخنث',
    'شاذ', 'لوطي', 'مخنث', 'خنيث', 'متخنث', 'شاذين', 'لوطيين',
    // كلمات إنجليزية مسيئة
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'damn', 'hell', 'crap',
    'dick', 'pussy', 'whore', 'slut', 'idiot', 'stupid', 'moron'
  ];

  // فلتر الكلمات المسيئة
  const containsForbiddenWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return forbiddenWords.some(word => lowerText.includes(word.toLowerCase()));
  };

  // جلب التعليقات المعتمدة
  const fetchComments = async () => {
    if (!contentId) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, name, email, content, created_at')
        .eq('article_id', contentId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  // التحقق من صحة الإيميل
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // إرسال تعليق جديد
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentId) {
      setSubmitMessage({ type: 'error', text: 'لا يمكن إضافة تعليق على هذا المحتوى' });
      return;
    }
    
    // التحققات
    if (!newComment.name.trim() || !newComment.email.trim() || !newComment.content.trim()) {
      setSubmitMessage({ type: 'error', text: 'يرجى ملء جميع الحقول المطلوبة' });
      return;
    }

    if (!isValidEmail(newComment.email)) {
      setSubmitMessage({ type: 'error', text: 'يرجى إدخال بريد إلكتروني صحيح' });
      return;
    }

    if (newComment.content.length > 500) {
      setSubmitMessage({ type: 'error', text: 'يجب أن يكون التعليق 500 كلمة كحد أقصى' });
      return;
    }

    if (containsForbiddenWords(newComment.content)) {
      setSubmitMessage({ type: 'error', text: 'يحتوي التعليق على كلمات غير لائقة. يرجى التعديل وإعادة المحاولة' });
      return;
    }

    if (containsForbiddenWords(newComment.name)) {
      setSubmitMessage({ type: 'error', text: 'يحتوي الاسم على كلمات غير لائقة. يرجى التعديل وإعادة المحاولة' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: contentId,
          name: newComment.name.trim(),
          email: newComment.email.trim(),
          content: newComment.content.trim(),
          is_approved: false // يحتاج إلى موافقة المشرف
        });

      if (error) throw error;

      // إعادة تعيين النموذج
      setNewComment({ name: "", email: "", content: "" });
      setCharCount(0);
      
      setSubmitMessage({ 
        type: 'success', 
        text: 'تم إرسال تعليقك بنجاح! سيتم نشره بعد موافقة المشرف.' 
      });

    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: 'حدث خطأ أثناء إرسال التعليق. يرجى المحاولة مرة أخرى.' 
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          التعليقات ({comments.length})
        </h3>

        {/* نموذج إضافة تعليق جديد */}
        <div className="bg-muted/50 rounded-xl p-6 mb-8">
          <h4 className="text-lg font-semibold text-foreground mb-4">أضف تعليقك</h4>
          
          {submitMessage && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              submitMessage.type === 'success' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {submitMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <User className="inline h-4 w-4 ml-1" />
                  الاسم *
                </label>
                <input
                  type="text"
                  value={newComment.name}
                  onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="اسمك الكامل"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Mail className="inline h-4 w-4 ml-1" />
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={newComment.email}
                  onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                التعليق *
              </label>
              <textarea
                value={newComment.content}
                onChange={(e) => {
                  setNewComment({ ...newComment, content: e.target.value });
                  setCharCount(e.target.value.length);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="اكتب تعليقك هنا..."
                rows={4}
                maxLength={500}
                required
              />
              <div className="text-sm text-muted-foreground mt-1 text-left">
                {charCount}/500 حرف
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>جاري الإرسال...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  إرسال التعليق
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-4">
            * سيتم نشر تعليقك بعد موافقة المشرف. يرجى استخدام لغة مهذبة ومناسبة.
          </p>
        </div>

        {/* عرض التعليقات */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-semibold text-foreground">{comment.name}</h5>
                    <p className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
