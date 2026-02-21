import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Helmet>
        <title>سياسة الخصوصية | ReviewQeem - التزامنا تجاهك</title>
        <meta name="description" content="تعرف على كيفية حماية ReviewQeem لخصوصيتك. نحن نلتزم بالشفافية التامة ولا نقوم بجمع بياناتك الشخصية." />
        {/* تصحيح الرابط للدومين الجديد المعتمد في Google Search Console */}
        <link rel="canonical" href="https://www.reviewqeem.online/privacy" />
      </Helmet>
      
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-2 text-center">سياسة الخصوصية</h1>
            <p className="text-purple-500 text-center mb-12 font-medium">شفافية تامة لتجربة لعب آمنة</p>
            
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl space-y-10 text-right">
              
              <section className="border-b border-white/5 pb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. فلسفتنا في الخصوصية</h2>
                <p className="text-gray-400 leading-relaxed text-lg">
                  في <span className="text-purple-500 font-bold">ReviewQeem</span>، نحن لاعبون قبل كل شيء، ونعلم قيمة الخصوصية الرقمية. لقد صممنا هذا الموقع ليكون منصة استهلاك محتوى فقط، مما يعني أننا لا نسعى خلف بياناتك، بل خلف شغفك بالألعاب.
                </p>
              </section>

              <section className="border-b border-white/5 pb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. جمع المعلومات واستخدامها</h2>
                <div className="space-y-4">
                  <p className="text-gray-400 leading-relaxed">
                    نحن نؤكد التزامنا بالآتي:
                  </p>
                  <ul className="list-disc list-inside text-gray-400 space-y-2 pr-4">
                    <li><span className="text-white">عدم جمع البيانات الشخصية:</span> لا نطلب الاسم، البريد الإلكتروني، أو أرقام الهواتف.</li>
                    <li><span className="text-white">تصفح مجهول:</span> يمكنك الوصول لكافة المراجعات والنظريات دون الحاجة لإنشاء حساب.</li>
                  </ul>
                </div>
              </section>

              <section className="border-b border-white/5 pb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. ملفات تعريف الارتباط (Cookies)</h2>
                <p className="text-gray-400 leading-relaxed">
                  نستخدم ملفات تعريف ارتباط "تقنية" فقط تهدف لتحسين سرعة تحميل الموقع وتذكر تفضيلاتك البسيطة (مثل الوضع الليلي). هذه الملفات لا تقوم بتتبع نشاطك خارج نطاق الموقع ولا تُستخدم لأغراض إعلانية.
                </p>
              </section>

              <section className="border-b border-white/5 pb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. التحليلات الطرف الثالث</h2>
                <p className="text-gray-400 leading-relaxed">
                  قد نستخدم أدوات مثل (Google Analytics) لفهم عدد الزوار والصفحات الأكثر قراءة. هذه البيانات تصلنا "مجمعة" ولا يمكننا من خلالها تحديد هوية أي زائر بشكل فردي.
                </p>
              </section>

              <section className="border-b border-white/5 pb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. روابط المنصات الخارجية</h2>
                <p className="text-gray-400 leading-relaxed">
                  مراجعاتنا قد تحتوي على روابط لمتاجر (مثل Steam أو PlayStation Store). بمجرد مغادرتك لموقعنا، فإنك تخضع لسياسة الخصوصية الخاصة بتلك المواقع، لذا وجب التنويه.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. الموافقة والتحديثات</h2>
                <p className="text-gray-400 leading-relaxed">
                  باستخدامك لموقعنا، فإنك توافق على سياسة الخصوصية هذه. نحن نحتفظ بالحق في تحديثها بما يتماشى مع التطورات التقنية والقانونية.
                </p>
                
                <div className="mt-10 p-4 bg-purple-600/10 border-r-4 border-purple-600 rounded-l-lg">
                  <p className="text-sm text-purple-400">
                    آخر تحديث للوثيقة: {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
