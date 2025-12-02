import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from './Button';

const subjects = ['主观题', '客观题', '作文', '数学公式'];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % subjects.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
        >
          学习，从模糊<br className="md:hidden" />
          <span className="text-slate-900">变得明朗</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-slate-600 max-w-2xl mx-auto mb-10"
        >
          师生的专属AI助手，让
          <span className="inline-block w-24 text-center text-emerald-600 font-semibold">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {subjects[currentIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          的每一步都更清晰
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Button variant="primary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/login')}>
            立即开始
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/login')}>
            预约演示
          </Button>
        </motion.div>

        {/* Floating Visual Representation */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto perspective-1000"
        >
          {/* Main Card */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
             {/* Abstract UI Elements */}
             <div className="flex items-start gap-8">
                {/* Simulated Paper */}
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                  <div className="h-32 bg-slate-50 rounded-3xl border border-slate-100 mt-6 p-6 relative">
                    <p className="font-serif text-slate-400 text-lg leading-relaxed blur-[1px]">
                      论述题：请结合实际案例，分析人工智能技术在教育领域的应用前景...
                    </p>
                    {/* Floating Grade */}
                    <div className="absolute -right-4 -top-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-emerald-100">
                      <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">98</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">分数</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Sidebar Mockup */}
                <div className="hidden md:block w-64 bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                   <div className="h-3 bg-slate-200 rounded-full w-1/2"></div>
                   <div className="space-y-2 pt-4">
                     <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                     <div className="h-2 bg-slate-200 rounded-full w-4/5"></div>
                     <div className="h-2 bg-emerald-200 rounded-full w-3/5"></div>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Decorative Glow underneath */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-20 blur-3xl -z-10 rounded-[50px]"></div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
