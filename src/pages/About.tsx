import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Helmet>
        <title>من نحن | ReviewQeem - الريادة في نقد وتحليل الألعاب</title>
        <meta name="description" content="تعرف على ReviewQeem، المنصة العربية الرائدة في تقديم المراجعات النقدية العميقة والنظريات التحليلية لعالم ألعاب الفيديو." />
        {/* تم تصحيح الرابط ليتوافق مع الدومين المعتمد في قوقل */}
        <link rel="canonical" href="https://www.reviewqeem.online/about" />
      </Helmet>
      
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                Review<span className="text-purple-600">Qeem</span>
              </h1>
              <div className="h-1.5 w-24 bg-purple-600 mx-auto rounded-full"></div>
              <p className="text-gray-400 mt-6 text-lg">أكثر من مجرد تقييم.. نحن نحلل الفن الكامن خلف الأزرار.</p>
            </div>
            
            <div className="grid gap-12 text-right">
              {/* قسم الرؤية */}
              <section className="bg-[#111] p-10 rounded-2xl border border-white/5 shadow-2xl transition-all hover:border-purple-600/30">
                <h2 className="text-2xl font-bold text-purple-500 mb-6 flex items-center gap-3">
                   رسالتنا السامية
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  في عالم يتسارع فيه إصدار الألعاب، ولدت **ReviewQeem** لتكون الفلتر الحقيقي للاعب العربي. نحن لا نكتفي بوصف الرسوميات، بل نغوص في أعماق السرد القصصي والميكانيكيات المبتكرة لنقدم لك مراجعة نقدية تمنحك "القيمة" الحقيقية لوقتك ومالك.
                </p>
              </section>

              {/* قسم التميز */}
              <section className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#111] p-8 rounded-2xl border border-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">النقد الأكاديمي</h3>
                  <p className="text-gray-400">نحلل الألعاب بمنظور فني وتقني، مبتعدين عن السطحية، لنكشف لك ما وراء الكواليس في تصميم المراحل وسيكولوجية اللعب.</p>
                </div>
                <div className="bg-[#111] p-8 rounded-2xl border border-white/5">
                  <h3 className="text-xl font-bold text-white mb-4">نظريات ReviewQeem</h3>
                  <p className="text-gray-400">ننفرد بقسم خاص لتحليل النظريات الغامضة في الألعاب، من فلسفة "إلدن رينج" إلى أسرار "سايلنت هيل".</p>
                </div>
              </section>

              {/* قسم القيم */}
              <section className="bg-gradient-to-br from-[#111] to-[#1a1a1a] p-10 rounded-2xl border border-purple-600/20">
                <h2 className="text-2xl font-bold text-white mb-8">مبادئنا في التقييم</h2>
                <div className="space-y-6">
                  <div className="border-r-4 border-purple-600 pr-6">
                    <h4 className="text-purple-400 font-bold mb-1">الموضوعية المطلقة</h4>
                    <p className="text-gray-400 text-sm">لا تخضع مراجعاتنا لأي تأثيرات خارجية؛ رأينا نابع من تجربة فعلية طويلة.</p>
                  </div>
                  <div className="border-r-4 border-purple-600 pr-6">
                    <h4 className="text-purple-400 font-bold mb-1">اللغة العربية الأصيلة</h4>
                    <p className="text-gray-400 text-sm">نعتز بهويتنا، ونقدم محتوى مكتوباً بعناية لغوية بعيداً عن الترجمة الآلية الركيكة.</p>
                  </div>
                  <div className="border-r-4 border-purple-600 pr-6">
                    <h4 className="text-purple-400 font-bold mb-1">مجتمع اللاعبين أولاً</h4>
                    <p className="text-gray-400 text-sm">هدفنا النهائي هو بناء مجتمع عربي واعٍ يقدّر الفن في صناعة الألعاب.</p>
                  </div>
                </div>
              </section>

              <section className="text-center py-10">
                <h2 className="text-2xl font-bold text-white mb-4">انضم إلى رحلتنا</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  نحن لسنا مجرد موقع، نحن فريق من المحللين، المصممين، واللاعبين الذين يحلمون برفع سقف المحتوى العربي. تواصل معنا وكن جزءاً من التغيير.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
