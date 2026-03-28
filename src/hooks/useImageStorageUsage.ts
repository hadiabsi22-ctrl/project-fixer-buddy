import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const IMAGE_BUCKET = "content-images";
const QUERY_KEY = ["image-storage-usage"];

async function fetchFolderSize(folder: string | undefined) {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .list(folder, {
      limit: 1000,
    });

  if (error) {
    throw error;
  }

  if (!data) return 0;

  // Supabase يوفّر الحجم داخل metadata.size (بوحدة البايت)
  return data.reduce((total, file: any) => {
    const size = file?.metadata?.size ?? 0;
    return total + (typeof size === "number" ? size : 0);
  }, 0);
}

async function fetchImageStorageUsage() {
  // جميع الصور تُرفع حاليًا في مجلدَي covers و content داخل نفس الحاوية
  const [coversSize, contentSize] = await Promise.all([
    fetchFolderSize("covers"),
    fetchFolderSize("content"),
  ]);

  const totalBytes = coversSize + contentSize;
  return {
    totalBytes,
    totalMB: totalBytes / (1024 * 1024),
  };
}

export function useImageStorageUsage() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchImageStorageUsage,
    refetchOnWindowFocus: true,
  });

  return {
    ...query,
    totalBytes: query.data?.totalBytes ?? 0,
    totalMB: query.data?.totalMB ?? 0,
  };
}

export { QUERY_KEY as IMAGE_STORAGE_USAGE_QUERY_KEY };

