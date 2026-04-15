/**
 * Generate an English-only slug from a title.
 * Strips all non-ASCII characters (Arabic, etc.), keeps only English letters, numbers, and hyphens.
 */
export const generateSlug = (title: string): string => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Keep only English lowercase, numbers, spaces, hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens

  // If empty (fully Arabic title), use "post"
  if (!slug) slug = "post";

  // Append unique suffix
  return `${slug}-${Math.random().toString(36).substring(2, 10)}`;
};
