import { motion } from 'framer-motion';

const StatCard = ({ number, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="group bg-white/50 backdrop-blur-md rounded-2xl p-8 border-2 border-slate-200/50 hover:border-emerald-500/50 shadow-lg shadow-slate-200/30 hover:shadow-emerald-500/10 transition-all duration-300"
    >
      <div className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-500 mb-4">
        {number}
      </div>
      <div className="text-slate-500 text-sm leading-relaxed font-medium group-hover:text-slate-700 transition-colors whitespace-pre-line">
        {description}
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  const stats = [
    { number: '3x', description: '批改效率提升\n从繁重阅卷中解放' },
    { number: '3000+', description: '累计服务学生\n未来将覆盖全国多所名校' },
    { number: '20000+', description: '智能批改试卷\n持续优化算法模型' },
    { number: '99%', description: '识别准确率\n精准还原手写字迹' },
  ];

  return (
    <section className="py-16 md:py-20 bg-transparent relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* 公司简介与产品介绍 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            清境智能 · 让教育更纯粹
          </h2>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
            我们专注于利用前沿人工智能技术，为教育工作者打造高效、精准的智能阅卷与学情分析平台。<br className="hidden md:block" />
            通过自动化批改释放教师精力，通过数据化分析助力因材施教，真正实现减负增效。
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              number={stat.number}
              description={stat.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
