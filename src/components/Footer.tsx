import { Link } from "react-router-dom";
import { Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] py-12 text-right" dir="rtl">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* هوية الموقع */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                RQ
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Review<span className="text-purple-600">Qeem</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              منصة عربية تقدم مراجعات ونظريات لألعاب الفيديو من منظور اللاعبين أنفسهم.
            </p>
          </div>

          {/* روابط الموقع */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 hover:text-purple-500 transition-colors text-sm">الرئيسية</Link></li>
              <li><Link to="/reviews" className="text-gray-500 hover:text-purple-500 transition-colors text-sm">المراجعات</Link></li>
              <li><Link to="/theories" className="text-gray-500 hover:text-purple-500 transition-colors text-sm">النظريات</Link></li>
            </ul>
          </div>

          {/* روابط قانونية */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">معلومات</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-500 hover:text-purple-500 transition-colors text-sm">من نحن</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-purple-500 transition-colors text-sm">سياسة الخصوصية</Link></li>
              <li><Link to="/faq" className="text-gray-500 hover:text-purple-500 transition-colors text-sm">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* التواصل الاجتماعي */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold text-white mb-4 text-sm">تواصل معنا</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-[#161616] flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="mailto:contact@reviewqeem.online"
                className="w-9 h-9 rounded-md bg-[#161616] flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="border-t border-white/5 mt-10 pt-6 text-center">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} ReviewQeem. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
