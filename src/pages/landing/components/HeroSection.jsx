import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        
        {/* Floating Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-full px-4 py-1.5 mb-8 shadow-sm"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">AI 阅卷引擎 V2.0 已上线</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
        >
          让阅卷回归<br className="md:hidden" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900">教学本身</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI 驱动的智能阅卷平台，为 K12 及高校教师节省 80% 批改时间。
          <br className="hidden md:block" />
          告别重复劳动，专注于学生成长。
        </motion.p>

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
