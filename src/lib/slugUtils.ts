const arabicToLatinMap: Record<string, string> = {
  أ: "a", إ: "i", آ: "a", ا: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h", ة: "h",
  و: "w", ؤ: "w", ي: "y", ى: "a", ئ: "y", ء: "",
};

export const toLatinSlugBase = (title: string): string => {
  const transliterated = title
    .toLowerCase()
    .replace(/[أإآابتثجحخدذرزسشصضطظعغفقكلمنهةوؤيىئء]/g, (char) => arabicToLatinMap[char] ?? "")
    .replace(/[ًٌٍَُِّْـ]/g, "");

  const slug = transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/g, "");

  return slug || "post";
};

export const generateSlug = (title: string): string => {
  return `${toLatinSlugBase(title)}-${Math.random().toString(36).substring(2, 10)}`;
};
