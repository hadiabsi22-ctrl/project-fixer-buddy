import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Ghost, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white px-6">
      <div className="text-center max-w-md">
        {/* أيقونة اللعبة الضائعة */}
        <div className="relative mb-8 flex justify-center">
          <Ghost size={120} className="text-purple-600 animate-bounce" />
          <div className="absolute bottom-0 w-24 h-4 bg-purple-900/40 blur-xl rounded-full"></div>
        </div>

        <h1 className="text-8xl font-black text-purple-600 mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-4">انتهت اللعبة! (Game Over)</h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          يبدو أنك حاولت الوصول إلى منطقة لم يتم تصميمها في خريطة العالم بعد، أو أن الوحوش قد أكلت هذا الرابط!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
          >
            <Home size={20} />
            العودة للقائمة الرئيسية
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 border border-purple-600/50 hover:bg-purple-600/10 text-purple-400 px-6 py-3 rounded-lg font-bold transition-all"
          >
            <ArrowLeft size={20} />
            تراجع للخلف
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500 italic">
          خطأ في المسار: {location.pathname}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
