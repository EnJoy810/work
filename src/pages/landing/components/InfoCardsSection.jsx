import { motion } from 'framer-motion';
import { Send, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InfoCardsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-8">
          {/* 对于个人和机构卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative rounded-[32px] bg-white/50 backdrop-blur-sm overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50"
          >
            {/* 装饰性点阵 */}
            <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <pattern id="dots1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-emerald-500" />
                  </pattern>
                </defs>
                <rect width="200" height="200" fill="url(#dots1)" />
              </svg>
            </div>

            <div className="relative z-10 w-full flex flex-col justify-center min-h-[200px] py-10 px-10">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                对于<span className="text-emerald-600">个人</span>和<span className="text-emerald-600">机构</span>
              </h3>
              <p className="text-slate-600 text-lg mb-6">
                联系我们，探讨机会合作。
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
              >
                <Send size={18} />
                联系团队
              </button>
            </div>
          </motion.div>

          {/* 数据隐私卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative rounded-[32px] bg-white/50 backdrop-blur-sm overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50"
          >
            {/* 锁图标 */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-24 h-24 opacity-10">
              <div className="relative w-full h-full flex items-center justify-center">
                <Lock size={80} className="text-emerald-500" />
              </div>
            </div>

            <div className="relative z-10 w-full flex flex-col justify-center min-h-[200px] py-10 px-10">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                数据隐私
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                所有训练数据均隐离存储于个人或机构账户中，并保留为账户持有者的知识产权。我们不使用这些数据来训练人工智能。所有数据均经过匿名化处理，并安全存储在本地服务器上。欲了解更多信息，请访问我们的
                <a href="#" className="text-emerald-600 font-semibold hover:underline">法律页面</a>。
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default InfoCardsSection;
