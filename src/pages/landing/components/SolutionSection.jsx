import { motion } from 'framer-motion';
import { ScanLine, BarChart2, Zap, Brain } from 'lucide-react';

const SolutionSection = () => {
  return (
    <section className="py-32 bg-transparent text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-600 font-semibold tracking-wider uppercase text-sm"
          >
            Powerful Features
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mt-4 mb-6"
          >
            全流程智能化阅卷体验
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            不仅仅是简单的打分，清境智能为您提供从试卷录入到学情分析的端到端解决方案
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6">
          
          {/* Feature 1: Large Card - Upload & OCR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 row-span-1 bg-white backdrop-blur-xl border border-slate-200 rounded-[40px] p-10 relative overflow-hidden group hover:border-slate-300 transition-colors shadow-sm"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <ScanLine size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">高精度 OCR 识别引擎</h3>
              <p className="text-slate-600 leading-relaxed max-w-md">
                无需专业扫描仪。支持手机拍照上传，独有的去噪算法自动修正倾斜、光照不均。手写体识别准确率高达 99.2%。
              </p>
            </div>
            {/* Visual: Simulated Scanning Effect */}
            <div className="absolute top-10 right-[-40px] w-64 h-80 bg-slate-50 rounded-xl border border-slate-200 p-4 rotate-[-12deg] shadow-2xl group-hover:rotate-[-10deg] transition-transform duration-500">
               <div className="space-y-3 opacity-50">
                 <div className="h-2 bg-slate-300 rounded w-full"></div>
                 <div className="h-2 bg-slate-300 rounded w-5/6"></div>
                 <div className="h-2 bg-slate-300 rounded w-4/5"></div>
               </div>
               {/* Scanning Line */}
               <motion.div 
                 animate={{ top: ['0%', '100%', '0%'] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20"
               ></motion.div>
            </div>
          </motion.div>

          {/* Feature 2: Tall Card - Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 md:row-span-2 bg-white backdrop-blur-xl border border-slate-200 rounded-[40px] p-10 relative overflow-hidden group hover:border-slate-300 transition-colors shadow-sm"
          >
             <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">多维度学情分析</h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                从班级平均分到每个知识点的掌握情况，自动生成可视化学情报告。
              </p>
              
              {/* Visual: Animated Bars */}
              <div className="flex items-end justify-between gap-2 h-48 w-full mt-auto">
                {[40, 70, 50, 90, 65, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1), duration: 1, type: "spring" }}
                    className="w-full bg-slate-200 rounded-t-lg relative overflow-hidden group-hover:bg-purple-100 transition-colors"
                  >
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 opacity-70 h-full"></div>
                  </motion.div>
                ))}
              </div>
          </motion.div>

          {/* Feature 3: Small Card - Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 bg-white backdrop-blur-xl border border-slate-200 rounded-[40px] p-10 group hover:border-slate-300 transition-colors shadow-sm"
          >
             <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">秒级批改</h3>
              <p className="text-slate-600 text-sm">
                单张试卷处理时间 &lt; 0.5秒。喝杯咖啡的时间，全班作业批改完成。
              </p>
          </motion.div>

          {/* Feature 4: Small Card - AI Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 bg-white backdrop-blur-xl border border-slate-200 rounded-[40px] p-10 group hover:border-slate-300 transition-colors relative overflow-hidden shadow-sm"
          >
             <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">AI 辅助评语</h3>
              <p className="text-slate-600 text-sm">
                针对主观题，AI 自动生成鼓励性评语与修改建议。
              </p>
              
              {/* Abstract decorative bubbles */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-xl group-hover:bg-blue-200 transition-colors"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
