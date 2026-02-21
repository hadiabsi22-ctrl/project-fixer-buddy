import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { IMAGE_STORAGE_USAGE_QUERY_KEY } from "@/hooks/useImageStorageUsage";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}

const ImageUploader = ({
  value,
  onChange,
  label = "صورة الغلاف",
  folder = "covers",
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Compress image using canvas
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Reduced dimensions for better quality (1280x720 instead of 1920x1080)
        const targetWidth = 1280;
        const targetHeight = 720;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculate crop to fit 16:9
        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;
        
        let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;
        
        if (imgAspect > targetAspect) {
          srcWidth = img.height * targetAspect;
          srcX = (img.width - srcWidth) / 2;
        } else {
          srcHeight = img.width / targetAspect;
          srcY = (img.height - srcHeight) / 2;
        }

        // Enable high quality image smoothing
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, targetWidth, targetHeight);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("فشل في ضغط الصورة"));
            }
          },
          "image/webp",
          0.95 // Maximum quality 95%
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

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("يرجى اختيار صورة بصيغة JPG, PNG, WebP أو GIF");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً (الحد الأقصى 10MB)");
      return;
    }

    setIsUploading(true);

    try {
      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Compress image
      const compressedBlob = await compressImage(file);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${folder}/${timestamp}-${randomStr}.webp`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("content-images")
        .upload(fileName, compressedBlob, {
          contentType: "image/webp",
          cacheControl: "31536000", // 1 year cache
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      
      // Clean up local preview
      URL.revokeObjectURL(localPreview);
      
      // Update state
      setPreviewUrl(publicUrl);
      onChange(publicUrl);
      queryClient.invalidateQueries({ queryKey: IMAGE_STORAGE_USAGE_QUERY_KEY });
      
      toast.success("تم رفع الصورة بنجاح");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "حدث خطأ أثناء رفع الصورة");
      setPreviewUrl(value); // Revert to original
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract path from URL
      const url = new URL(value);
      const pathParts = url.pathname.split("/content-images/");
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from("content-images").remove([filePath]);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }

    setPreviewUrl("");
    onChange("");
    queryClient.invalidateQueries({ queryKey: IMAGE_STORAGE_USAGE_QUERY_KEY });
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/50">
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="معاينة"
              className="w-full max-h-64 object-cover rounded-lg"
              onError={() => setPreviewUrl("")}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="mr-2">تغيير</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
                <span className="mr-2">حذف</span>
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-muted transition-colors rounded-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-3" />
                <p className="text-muted-foreground">جاري رفع الصورة...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-1">اضغط لاختيار صورة</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP أو GIF (حد أقصى 10MB)
                </p>
              </>
            )}
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
      
      <p className="text-xs text-muted-foreground">
        سيتم ضغط الصورة تلقائياً وتحويلها لصيغة WebP
      </p>
    </div>
  );
};

export default ImageUploader;
