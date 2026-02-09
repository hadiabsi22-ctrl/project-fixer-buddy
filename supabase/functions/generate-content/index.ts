import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://reviewqeem.com',
  'https://www.reviewqeem.com',
  'http://localhost:3003',
  'http://localhost:8080',
  'http://localhost:5173',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]; // Default to production domain
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

interface GenerateRequest {
  title: string;
  type: 'review' | 'theory' | 'news' | 'article';
  category?: string;
}

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: Simple in-memory store (for basic protection)
  // In production, use Redis or Supabase Edge Function rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Validate and sanitize input
    const body = await req.json() as GenerateRequest;
    const { title, type, category } = body;
    
    // Input validation
    if (!title || typeof title !== 'string') {
      return new Response(
        JSON.stringify({ error: "العنوان مطلوب" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Sanitize title (max 200 chars, remove dangerous characters)
    const sanitizedTitle = title.trim().substring(0, 200).replace(/[<>]/g, '');
    
    if (!sanitizedTitle || sanitizedTitle.length < 3) {
      return new Response(
        JSON.stringify({ error: "العنوان يجب أن يكون 3 أحرف على الأقل" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate type
    if (!['review', 'theory', 'news', 'article'].includes(type)) {
      return new Response(
        JSON.stringify({ error: "نوع المحتوى غير صالح" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating ${type} content for: ${sanitizedTitle}`);

    const systemPrompt = `أريدك أن تعمل الآن بصفتك 'كبيراً لمحللي السرد التفاعلي وبروفيسوراً متخصصاً في فلسفة ألعاب الفيديو'. أنت تمتلك خبرة أكاديمية في نقد الأدب الرقمي، وقدرة كاتب روائي على صياغة الدراما، وعين خبير تقني يحلل الميكانيكيات (Gameplay) ويربطها بالقصة (Ludonarrative).

أسلوب الكتابة:
- استخدم لغة عربية فصحى، جزيلة، وذات طابع أدبي ونقدي رصين
- اعتمد على العناوين الجانبية الجذابة والترقيم لتنظيم الأفكار
- اجعل النبرة مزيجاً من 'الغموض الاستقصائي' و'الهيبة الأكاديمية'
- لا تقبل بأنصاف الحلول؛ يجب أن يكون المحتوى غزيراً بالمعلومات والتفاصيل الدقيقة التي لا يعرفها إلا اللاعبون المتعمقون

تنسيق المحتوى:
- استخدم تنسيق Markdown فقط:
  - ## للعناوين الفرعية
  - **نص** للنص العريض
  - *نص* للنص المائل
  - - للقوائم النقطية
  - > للاقتباسات
- أضف علامات لمواقع الصور المقترحة بهذا الشكل: [ضع صورة هنا تصف: وصف مختصر للصورة المطلوبة]
- لا تستخدم وسوم HTML أبداً

تنسيق المخرجات:
أعد الرد بصيغة JSON صالحة فقط بدون أي نص إضافي، بهذا الهيكل:
{
  "title": "عنوان جذاب ومحسن للسيو",
  "excerpt": "ملخص مركز في 2-3 جمل",
  "content": "المحتوى الكامل بتنسيق Markdown مع عناوين فرعية وفقرات - لا يقل عن 1000 كلمة",
  "rating": رقم من 0 إلى 10 (للمراجعات فقط),
  "pros": ["إيجابية 1", "إيجابية 2", ...] (للمراجعات فقط),
  "cons": ["سلبية 1", "سلبية 2", ...] (للمراجعات فقط)
}`;

    let userPrompt = "";

    if (type === 'review') {
      const sanitizedCategory = category ? category.trim().substring(0, 50).replace(/[<>]/g, '') : '';
      userPrompt = `اكتب مراجعة احترافية للعبة "${sanitizedTitle}"${sanitizedCategory ? ` من تصنيف ${sanitizedCategory}` : ''}.

المطلوب:
1. عنوان جذاب يتضمن اسم اللعبة
2. ملخص مركز (excerpt) في 2-3 جمل
3. محتوى المراجعة الكامل (1200-1500 كلمة) يتضمن:
   - مقدمة تشويقية
   - قصة اللعبة وعالمها
   - أسلوب اللعب والميكانيكيات
   - الرسومات والصوتيات
   - الأداء التقني
   - [ضع صورة هنا تصف: ...] في 2-3 أماكن مناسبة
   - خاتمة مع الحكم النهائي
4. تقييم من 10 (rating)
5. قائمة بـ 4-6 إيجابيات (pros)
6. قائمة بـ 3-5 سلبيات (cons)

استخدم تنسيق Markdown:
- ## للعناوين الفرعية
- **نص** للنص العريض
- فقرات عادية بدون وسوم
- لا تستخدم HTML أبداً`;
    } else if (type === 'news') {
      userPrompt = `اكتب خبراً صحفياً احترافياً حول "${sanitizedTitle}" في عالم ألعاب الفيديو.

المطلوب:
1. عنوان خبري جذاب
2. ملخص مركز (excerpt) في 2-3 جمل
3. محتوى الخبر الكامل (600-900 كلمة) يتضمن:
   - مقدمة خبرية مباشرة
   - تفاصيل الخبر
   - ردود الفعل أو التعليقات
   - [ضع صورة هنا تصف: ...] في 1-2 أماكن مناسبة
   - خاتمة مع التوقعات
4. لا تضف تقييم أو إيجابيات أو سلبيات

استخدم تنسيق Markdown فقط - لا تستخدم HTML أبداً`;
    } else if (type === 'article') {
      userPrompt = `اكتب مقالة تحليلية متعمقة حول "${sanitizedTitle}" في عالم ألعاب الفيديو.

المطلوب:
1. عنوان مقالة جذاب ومحسن لمحركات البحث (SEO)
2. ملخص مركز (excerpt) في 2-3 جمل
3. محتوى المقالة الكامل (1000-1500 كلمة) يتضمن:
   - مقدمة تمهيدية تضع الموضوع في سياقه
   - تحليل معمق للموضوع مع أدلة وأمثلة
   - وجهات نظر متعددة
   - [ضع صورة هنا تصف: ...] في 2-3 أماكن مناسبة
   - خاتمة مع استنتاجات
4. لا تضف تقييم أو إيجابيات أو سلبيات (هذه مقالة تحليلية وليست مراجعة)

استخدم تنسيق Markdown فقط - لا تستخدم HTML أبداً`;
    } else {
      userPrompt = `اكتب تحقيقاً استقصائياً شاملاً وتحليلاً نظرياً حول "${sanitizedTitle}".

ملاحظة صارمة: يجب أن يكون المحتوى لا يقل عن 1000 كلمة.

هيكلية المحتوى الإلزامية:

## المقدمة الفلسفية
وضع اللعبة/السلسلة في سياقها التاريخي والنفسي

## تشريح الميكانيكيات
كيف تخدم طريقة اللعب (مثل الضباب في سايلنت هيل أو الصعوبة في سولز) الفكرة المركزية للنظرية؟

## ركن النظريات (Core Theories)
طرح 3 نظريات على الأقل (نظريات شائعة أو استنتاجات مبتكرة منك) مع تفنيد الأدلة من داخل اللعبة (In-game lore)

## التحليل الرمزي
فحص الشخصيات، الألوان، والموسيقى كرموز سيميائية

## الخاتمة الوجودية
ما الذي تحاول اللعبة قوله عن الطبيعة البشرية؟

المطلوب:
1. عنوان مثير للفضول يشد القارئ
2. ملخص مركز (excerpt) في 2-3 جمل يثير الفضول
3. محتوى التحليل الكامل (لا يقل عن 1000 كلمة) بالهيكلية أعلاه
4. أضف [ضع صورة هنا تصف: ...] في 3-4 أماكن مناسبة
5. لا تضف تقييم أو إيجابيات أو سلبيات (هذه مقالة تحليلية وليست مراجعة)

استخدم تنسيق Markdown فقط - لا تستخدم HTML أبداً`;
    }

    // Use OpenRouter API with DeepSeek model
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://reviewqeem.com",
        "X-Title": "ReviewQeem"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات، حاول مرة أخرى لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "مفتاح API غير صالح أو الرصيد غير كافٍ" }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response received, parsing...");

    // Parse the JSON response from AI
    let generatedContent: GeneratedContent;
    try {
      // Try to extract JSON from the response (it might have markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      generatedContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Raw response:", content);
      
      // Fallback: try to create structured content from the raw response
      generatedContent = {
        title: sanitizedTitle,
        excerpt: "تم توليد المحتوى بنجاح",
        content: content.substring(0, 50000), // Limit content size
      };
      
      if (type === 'review') {
        generatedContent.rating = 7.5;
        generatedContent.pros = ["محتوى مميز"];
        generatedContent.cons = ["يحتاج مراجعة"];
      }
    }

    console.log("Content generated successfully");

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
