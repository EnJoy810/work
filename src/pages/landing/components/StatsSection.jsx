import { motion } from 'framer-motion';

const StatCard = ({ number, label, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="bg-white/50 backdrop-blur-md rounded-[28px] p-8 border border-slate-200/50 shadow-lg shadow-slate-200/40 text-center"
    >
      <div className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 mb-3">
        {number}
      </div>
      <div className="text-slate-600 font-medium text-sm md:text-base">
        {label}
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  const stats = [
    { number: '3x', label: '批改效率增加' },
    { number: '3,000+', label: '服务学生数量' },
    { number: '20,000+', label: '批改试卷' },
    { number: '99%', label: '批改正确率' },
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-6">
        

      </div>
    </section>
  );
};

export default StatsSection;
