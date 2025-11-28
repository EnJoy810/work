import { motion } from 'framer-motion';
import { AlertCircle, XCircle } from 'lucide-react';

const ProblemCard = ({ title, subtitle, stat, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[32px] p-8 shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col h-full relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <XCircle size={80} className="text-red-500" />
      </div>

      <div className="mb-6">
        <div className="text-red-500 font-semibold mb-2 flex items-center gap-2">
          <AlertCircle size={16} />
          {subtitle}
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
      </div>

      <div className="mb-6 flex-grow">
        <p className="text-slate-500 leading-relaxed text-sm md:text-base">{description}</p>
      </div>

      <div className="pt-6">
        <div className="text-3xl font-extrabold text-slate-900">{stat}</div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mt-1">Impact</div>
      </div>
    </motion.div>
  );
};

const ProblemSection = () => {
  return (
    <section className="py-24 md:py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-slate-500 font-semibold tracking-wider uppercase text-sm"
            >
              The Old Way
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mt-4"
            >
              传统阅卷模式 <br/>
              <span className="text-slate-400">正在消耗您的教学热情</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-500 max-w-sm text-sm md:text-base leading-relaxed"
          >
            AI 时代，机械性的重复劳动不应再成为教师的负担。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProblemCard 
            subtitle="效率低下"
            title="时间黑洞" 
            stat="15小时/周"
            description="平均每位教师每周花费在批改作业上的时间。这些宝贵的时间本应用于备课或休息。"
            delay={0}
          />
          <ProblemCard 
            subtitle="机械重复"
            title="疲劳评分" 
            stat="20% 偏差"
            description="长时间阅卷导致注意力下降，对相同答案的评分可能出现前后不一致，影响公平性。"
            delay={0.1}
          />
          <ProblemCard 
            subtitle="数据孤岛"
            title="反馈缺失" 
            stat="0 数据沉淀"
            description="试卷批改后难以进行系统性的错题统计，无法精准掌握学生的知识盲区，教学缺乏针对性。"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
