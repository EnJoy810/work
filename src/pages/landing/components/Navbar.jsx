import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const links = [
    { label: "产品", href: "#features" },
    { label: "关于我们", href: "#about" },
    { label: "价格", href: "#pricing" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="w-full">
        <div className="relative h-16">
          <div className="h-full flex items-center px-6">
            {/* Left: Logo */}
            <div className="flex items-center cursor-pointer">
              <img src="/清净科技.svg" alt="清净科技 Logo" className="h-8 w-auto" />
            </div>
            {/* Center: Links - absolutely centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="hidden md:flex items-center gap-24">
                {links.map((link) => (
                  <a 
                    key={link.label} 
                    href={link.href}
                    className="text-lg font-medium text-slate-900 hover:text-slate-600 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: CTA Buttons */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2 text-md font-medium text-slate-900 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-lg hover:bg-white transition-all shadow-sm"
              >
                联系我们
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2 text-md font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                登录
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden ml-auto">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 left-4 right-4 bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 md:hidden"
        >
           {links.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-lg font-medium text-slate-600 py-2 border-b border-slate-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => navigate('/login')}
                className="w-full px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                登录
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full px-5 py-2 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                联系我们
              </button>
            </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
