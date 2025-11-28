import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const stats = [
  { value: "20000+", label: "批改试卷 (份)" },
  { value: "3000+", label: "服务学生 (人)" },
  { value: "99%", label: "准确率" },
  { value: "20+", label: "合作院校" },
];

const testimonials = [
  {
    quote: "使用清境智能后，我每天能早回家一个小时。最重要的是，数据分析功能让我能有的放矢地讲解错题。",
    author: "李老师",
    role: "高三数学教研组长",
    school: "上海某重点高中"
  },
  {
    quote: "OCR 识别非常精准，连学生潦草的字迹都能识别。AI 的辅助评分建议也很中肯，大大减轻了我的工作量。",
    author: "王教授",
    role: "计算机系副教授",
    school: "浙江大学"
  },
  {
    quote: "以前统计分数要花一整晚，现在扫一下就全出来了。这就是我一直想要的教学工具。",
    author: "张老师",
    role: "初二英语教师",
    school: "深圳实验学校"
  }
];

const SocialProofSection = () => {
  return (
    <section className="py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            来自一线教师的声音
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {testimonials.map((t, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.2 }}
               className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col relative"
             >
               <Quote className="text-emerald-100 absolute top-8 left-8" size={40} />
               <p className="text-slate-600 text-lg leading-relaxed relative z-10 mb-8 pt-6">
                 "{t.quote}"
               </p>
               <div className="mt-auto flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300"></div>
                 <div>
                   <div className="font-bold text-slate-900">{t.author}</div>
                   <div className="text-xs text-slate-500">{t.role} · {t.school}</div>
                 </div>
               </div>
             </motion.div>
           ))}
        </div>

      </div>
    </section>
  );
};

export default SocialProofSection;
