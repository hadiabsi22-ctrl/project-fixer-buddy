import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
}

interface UseAIContentOptions {
  type: 'review' | 'theory' | 'news';
  onSuccess: (content: GeneratedContent) => void;
}

export const useAIContent = ({ type, onSuccess }: UseAIContentOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async (title: string, category?: string) => {
    if (!title.trim()) {
      toast.error("يرجى إدخال العنوان أولاً");
      return;
    }

    setIsGenerating(true);
    toast.info("جاري توليد المحتوى بالذكاء الاصطناعي...", {
      duration: 10000,
      id: "generating-content",
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { title, type, category },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "فشل في توليد المحتوى");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.dismiss("generating-content");
      toast.success("تم توليد المحتوى بنجاح!");
      onSuccess(data as GeneratedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.dismiss("generating-content");
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء توليد المحتوى");
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateContent, isGenerating };
};
