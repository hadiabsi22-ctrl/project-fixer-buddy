import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRatingLabel(rating: number): string {
  if (rating >= 9.0) return "ممتازة";
  if (rating >= 8.0) return "جيدة جداً";
  if (rating >= 6.5) return "جيدة";
  if (rating >= 5.0) return "مقبولة";
  return "ضعيفة";
}
