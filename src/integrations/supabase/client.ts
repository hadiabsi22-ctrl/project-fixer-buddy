import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// تعديل لضمان قراءة المفاتيح حتى لو اختلفت المسميات بين ANON و PUBLISHABLE
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("⚠️ خطأ: بيانات Supabase مفقودة! تأكد من إعداد Environment Variables في Vercel.");
}

export const supabase = createClient<Database>(
  SUPABASE_URL || '', 
  SUPABASE_KEY || '', 
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
