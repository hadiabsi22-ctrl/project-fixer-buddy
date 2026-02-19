import { useState, useRef } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Quote,
  Minus,
  Eye,
  Edit,
  Upload,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { IMAGE_STORAGE_USAGE_QUERY_KEY } from "@/hooks/useImageStorageUsage";

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const RichContentEditor = ({
  value,
  onChange,
  placeholder = "اكتب المحتوى هنا...",
  label = "المحتوى",
}: RichContentEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Compress image using canvas
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Smaller size for content images (max 280px - reduced 30%)
        const maxSize = 280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("فشل في ضغط الصورة"));
            }
          },
          "image/webp",
          0.8
        );
      };

      img.onerror = () => reject(new Error("فشل في تحميل الصورة"));
      reader.onerror = () => reject(new Error("فشل في قراءة الملف"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("يرجى اختيار صورة بصيغة JPG, PNG, WebP أو GIF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً (الحد الأقصى 10MB)");
      return;
    }

    setIsUploading(true);

    try {
      // Show local preview
      const localPreview = URL.createObjectURL(file);
      setUploadPreview(localPreview);

      // Compress
      const compressedBlob = await compressImage(file);

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `content/${timestamp}-${randomStr}.webp`;

      // Upload
      const { data, error } = await supabase.storage
        .from("content-images")
        .upload(fileName, compressedBlob, {
          contentType: "image/webp",
          cacheControl: "31536000",
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(data.path);

      URL.revokeObjectURL(localPreview);
      setUploadPreview(urlData.publicUrl);

      queryClient.invalidateQueries({ queryKey: IMAGE_STORAGE_USAGE_QUERY_KEY });

      toast.success("تم رفع الصورة بنجاح");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "حدث خطأ أثناء رفع الصورة");
      setUploadPreview("");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const insertUploadedImage = () => {
    if (uploadPreview) {
      const markdown = `\n![${imageAlt || "صورة"}](${uploadPreview})\n`;
      const textarea = textareaRef.current;
      if (textarea) {
        const pos = textarea.selectionStart;
        const newText = value.substring(0, pos) + markdown + value.substring(pos);
        onChange(newText);
      }
      setUploadPreview("");
      setImageAlt("");
      setImageDialogOpen(false);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      const markdown = `[${linkText || linkUrl}](${linkUrl})`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = value.substring(0, start) + markdown + value.substring(end);
        onChange(newText);
      }
      setLinkUrl("");
      setLinkText("");
      setLinkDialogOpen(false);
    }
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertAtCursor("**", "**"), title: "عريض" },
    { icon: Italic, action: () => insertAtCursor("*", "*"), title: "مائل" },
    { icon: Heading1, action: () => insertAtCursor("\n# ", "\n"), title: "عنوان رئيسي" },
    { icon: Heading2, action: () => insertAtCursor("\n## ", "\n"), title: "عنوان فرعي" },
    { icon: List, action: () => insertAtCursor("\n- ", "\n"), title: "قائمة نقطية" },
    { icon: ListOrdered, action: () => insertAtCursor("\n1. ", "\n"), title: "قائمة مرقمة" },
    { icon: Quote, action: () => insertAtCursor("\n> ", "\n"), title: "اقتباس" },
    { icon: Minus, action: () => insertAtCursor("\n---\n", ""), title: "خط فاصل" },
  ];

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="max-w-xs h-auto rounded-lg my-4 mx-auto" />'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(
        /^> (.+)$/gm,
        '<blockquote class="border-r-4 border-primary pr-4 my-4 text-muted-foreground italic">$1</blockquote>'
      )
      .replace(/^---$/gm, '<hr class="my-6 border-border" />')
      .replace(/^- (.+)$/gm, '<li class="mr-4">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="mr-4 list-decimal">$1</li>')
      .replace(/\n\n/g, "</p><p class='mb-4'>")
      .replace(/\n/g, "<br />");

    return `<div class="prose prose-invert max-w-none"><p class='mb-4'>${html}</p></div>`;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted rounded-t-lg border border-border border-b-0">
        {toolbarButtons.map((btn, idx) => (
          <Button
            key={idx}
            type="button"
            variant="ghost"
            size="sm"
            onClick={btn.action}
            title={btn.title}
            className="h-8 w-8 p-0"
          >
            <btn.icon className="h-4 w-4" />
          </Button>
        ))}

        {/* Link Dialog */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="رابط"
              className="h-8 w-8 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة رابط</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-text">نص الرابط</Label>
                <Input
                  id="link-text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="اضغط هنا"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">عنوان URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <Button onClick={insertLink} className="w-full">
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Upload Dialog */}
        <Dialog open={imageDialogOpen} onOpenChange={(open) => {
          setImageDialogOpen(open);
          if (!open) {
            setUploadPreview("");
            setImageAlt("");
          }
        }}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="صورة"
              className="h-8 w-8 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة صورة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isUploading ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">جاري رفع الصورة...</p>
                  </div>
                ) : uploadPreview ? (
                  <div className="space-y-2">
                    <img
                      src={uploadPreview}
                      alt="معاينة"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">اضغط لتغيير الصورة</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">اضغط لاختيار صورة</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP (حد أقصى 10MB)</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="space-y-2">
                <Label htmlFor="image-alt">النص البديل</Label>
                <Input
                  id="image-alt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="وصف الصورة"
                />
              </div>

              <Button 
                onClick={insertUploadedImage} 
                className="w-full"
                disabled={!uploadPreview || isUploading}
              >
                إضافة للمحتوى
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1" />

        <Button
          type="button"
          variant={isPreview ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="h-8 gap-2"
        >
          {isPreview ? (
            <>
              <Edit className="h-4 w-4" />
              تحرير
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              معاينة
            </>
          )}
        </Button>
      </div>

      {isPreview ? (
        <div
          className="bg-muted min-h-[300px] p-4 rounded-b-lg border border-border overflow-auto"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(renderMarkdown(value), {
              ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr'],
              ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
              ALLOW_DATA_ATTR: false,
            })
          }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-muted min-h-[300px] rounded-t-none font-mono text-sm"
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          يدعم تنسيق Markdown: **عريض** *مائل* # عنوان ![صورة](رابط) [رابط](url)
        </p>
        <p className="text-xs text-muted-foreground font-medium">
          عدد الكلمات: <span className="text-primary">{value.trim() ? value.trim().split(/\s+/).length : 0}</span>
        </p>
      </div>
    </div>
  );
};

export default RichContentEditor;
