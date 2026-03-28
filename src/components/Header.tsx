import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { path: "/", label: "الرئيسية" },
    { path: "/reviews", label: "المراجعات" },
    { path: "/theories", label: "النظريات" },
    { path: "/news", label: "الأخبار" },
    { path: "/articles", label: "المقالات" },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo - الهوية البصرية */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-base sm:text-lg transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              RQ
            </div>
            <span className="text-xl sm:text-2xl font-black text-white tracking-tighter hidden xs:block">
              Review<span className="text-purple-600">Qeem</span>
            </span>
          </Link>

          {/* Desktop Navigation - روابط التصفح */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full font-bold transition-all duration-300 text-sm tracking-wide ${
                  location.pathname === link.path
                    ? "bg-purple-600/10 text-purple-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Search Button */}
            <button
              onClick={() => navigate("/search")}
              className="px-4 py-2 rounded-full font-bold transition-all duration-300 text-sm tracking-wide text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
              aria-label="بحث"
            >
              <Search size={18} />
              <span className="hidden lg:inline">بحث</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation - القائمة للجوال */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/5 bg-[#0a0a0a] animate-in fade-in slide-in-from-top-4">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                    location.pathname === link.path
                      ? "bg-purple-600/10 text-purple-500"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/search"
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-4 rounded-2xl font-bold text-lg transition-all text-gray-400 hover:bg-white/5 flex items-center gap-3"
              >
                <Search size={20} />
                بحث
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
