import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "ما هو ReviewQeem؟",
      answer: "ReviewQeem هي منصة عربية متخصصة في مراجعات الألعاب والنظريات المتعمقة. نقدم محتوى عربي أصيل لمساعدة اللاعبين العرب في اختيار الألعاب المناسبة لهم.",
    },
    {
      question: "كيف يتم تقييم الألعاب؟",
      answer: "نقيّم الألعاب بناءً على عدة معايير تشمل: أسلوب اللعب، القصة، الرسوميات، الصوتيات، القيمة مقابل السعر، وتجربة اللاعب بشكل عام. التقييم من 10 نقاط.",
    },
    {
      question: "هل التقييمات موضوعية؟",
      answer: "نسعى دائماً لتقديم تقييمات عادلة وموضوعية. نعترف بأن هناك جانباً شخصياً في أي مراجعة، لكننا نحرص على ذكر الإيجابيات والسلبيات بشفافية.",
    },
    {
      question: "ما هي النظريات؟",
      answer: "النظريات هي تحليلات معمقة لقصص الألعاب وشخصياتها وعوالمها. نستكشف فيها التفاصيل الخفية والمعاني العميقة التي قد لا تكون واضحة للوهلة الأولى.",
    },
    {
      question: "هل يمكنني اقتراح لعبة للمراجعة؟",
      answer: "بالتأكيد! نرحب باقتراحاتكم. تواصلوا معنا عبر وسائل التواصل الاجتماعي وأخبرونا بالألعاب التي تودون رؤية مراجعات لها.",
    },
    {
      question: "كم مرة يُحدَّث الموقع؟",
      answer: "نحرص على إضافة محتوى جديد بشكل منتظم. تابعونا على وسائل التواصل الاجتماعي لمعرفة آخر المراجعات والنظريات.",
    },
    {
      question: "هل الموقع مجاني؟",
      answer: "نعم، الموقع مجاني بالكامل. يمكنك قراءة جميع المراجعات والنظريات دون أي تكلفة أو تسجيل.",
    },
    {
      question: "هل تجمعون بيانات المستخدمين؟",
      answer: "لا، نحن لا نجمع أي بيانات شخصية. يمكنك تصفح الموقع بحرية تامة. اقرأ المزيد في صفحة سياسة الخصوصية.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>الأسئلة الشائعة | ReviewQeem</title>
        <meta name="description" content="إجابات على الأسئلة الشائعة حول ReviewQeem - منصة مراجعات الألعاب العربية." />
        <link rel="canonical" href="https://reviewqeem.com/faq" />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-8 text-center">الأسئلة الشائعة</h1>
            
            <div className="gaming-card p-8">
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-border">
                    <AccordionTrigger className="text-foreground text-right hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-right leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
