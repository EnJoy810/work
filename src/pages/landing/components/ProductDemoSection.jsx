import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const ProductDemoSection = () => {
  return (
    <section className="py-24 md:py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-600 font-semibold tracking-wider uppercase text-sm"
          >
            产品演示
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mt-4 mb-6"
          >
            智能阅卷，一键完成
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            上传试卷，AI 自动识别并批改，生成详细的分析报告。让教师从繁重的批改工作中解放出来。
          </motion.p>
        </div>

        {/* 大视频播放区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-[40px] overflow-hidden bg-slate-100 border border-slate-200 shadow-2xl shadow-slate-200/50 aspect-video">
            {/* 视频占位符 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
              <div className="bg-white rounded-full p-8 mb-6 shadow-xl hover:scale-105 transition-transform cursor-pointer">
                <Play size={64} className="text-slate-600" />
              </div>
              <p className="text-slate-600 font-semibold text-2xl">产品演示视频</p>
              <p className="text-slate-400 text-base mt-3">观看完整的智能阅卷流程</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProductDemoSection;
