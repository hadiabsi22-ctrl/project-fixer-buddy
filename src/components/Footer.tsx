import { Link } from "react-router-dom";
import { Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#050509] py-12 text-right font-sans" dir="rtl">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          
          {/* هوية الموقع */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-semibold text-white text-base shadow-lg shadow-purple-500/20">
                RQ
              </div>
              <span className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
                Review<span className="text-purple-600">Qeem</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mt-1">
              منصة عربية تقدم مراجعات ونظريات لألعاب الفيديو من منظور اللاعبين أنفسهم.
            </p>
          </div>

          {/* روابط الموقع */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm md:text-base tracking-wide">
              روابط سريعة
            </h4>
            <ul className="space-y-3 text-sm md:text-[0.95rem]">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  المراجعات
                </Link>
              </li>
              <li>
                <Link
                  to="/theories"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  النظريات
                </Link>
              </li>
            </ul>
          </div>

          {/* روابط قانونية */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm md:text-base tracking-wide">
              معلومات
            </h4>
            <ul className="space-y-3 text-sm md:text-[0.95rem]">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* التواصل الاجتماعي */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-white mb-4 text-sm md:text-base tracking-wide">
              تواصل معنا
            </h4>
            <div className="flex gap-3 text-sm">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[#15151c] flex items-center justify-center text-gray-300 hover:bg-purple-600 hover:text-white transition-all shadow-md shadow-black/30"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="mailto:contact@reviewqeem.online"
                className="w-10 h-10 rounded-lg bg-[#15151c] flex items-center justify-center text-gray-300 hover:bg-purple-600 hover:text-white transition-all shadow-md shadow-black/30"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="border-t border-white/5 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-[0.8rem] md:text-sm tracking-wide">
            © {new Date().getFullYear()} ReviewQeem. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
