-- جدول التعليقات
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);

-- Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- السياسات الأمنية
CREATE POLICY "Anyone can view approved comments" ON comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- لا يمكن تعديل أو حذف التعليقات إلا من خلال المشرفين
CREATE POLICY "Only admins can update comments" ON comments
  FOR UPDATE USING (false);

CREATE POLICY "Only admins can delete comments" ON comments
  FOR DELETE USING (false);
