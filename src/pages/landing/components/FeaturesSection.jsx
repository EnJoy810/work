import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const FeatureBlock = ({ feature, index }) => {
  const [selectedOption, setSelectedOption] = useState(0);
  const isReverse = index % 2 === 1;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isReverse ? 'lg:grid-flow-dense' : ''}`}>
      
      {/* 选项列表 */}
      <motion.div
        initial={{ opacity: 0, x: isReverse ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`space-y-3 ${isReverse ? 'lg:col-start-2' : ''}`}
      >
        {/* 标题 */}
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-slate-900 mb-2">{feature.title}</h3>
          <p className="text-slate-600">{feature.description}</p>
        </div>

        {/* 选项卡片 */}
        {feature.options.map((option, optIndex) => (
          <button
            key={optIndex}
            onClick={() => setSelectedOption(optIndex)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedOption === optIndex
                ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-semibold mb-1 ${
                  selectedOption === optIndex ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {option.title}
                </h4>
                <p className="text-slate-500 text-sm">{option.description}</p>
              </div>
              <ChevronRight 
                className={`transition-all flex-shrink-0 ${
                  selectedOption === optIndex 
                    ? 'text-emerald-600 transform translate-x-1' 
                    : 'text-slate-400'
                }`} 
                size={18} 
              />
            </div>
          </button>
        ))}
      </motion.div>

      {/* 图片演示 */}
      <motion.div
        key={selectedOption}
        initial={{ opacity: 0, x: isReverse ? -30 : 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative ${isReverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}
      >
        <div className="relative rounded-[32px] overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-slate-200/50">
          {feature.options[selectedOption].image ? (
            <img 
              src={feature.options[selectedOption].image} 
              alt={feature.options[selectedOption].title}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-slate-100">
              <p className="text-slate-400">图片加载中...</p>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      title: '简单易用，批改飞快',
      description: '上手即用，批改速度提升 3 倍',
      options: [
        { title: '零门槛使用', description: '快速创建考试任务', image: '/零门槛使用.png' },
        { title: '一键上传', description: '支持图片批量上传', image: '/一键上传.png' },
        { title: '秒级批改', description: '客观题秒判，主观题辅助', image: '/秒级批改.png' },
      ],
    },
    {
      title: '分析细致，准确度高',
      description: '多维度数据分析，准确率达 99%',
      options: [
        { title: '成绩统计', description: '班级成绩分布分析', image: '/成绩统计.png' },
        { title: '答题分析', description: '题目得分率统计', image: '/答题分析.png' },
        { title: '数据导出', description: '支持多种格式导出', image: '/数据导出.png' },
      ],
    },
    {
      title: '全程留痕，个性化教育',
      description: '完整记录批改过程，支持个性化教学',
      options: [
        { title: '批改留痕', description: '完整保留批改痕迹', image: '/批改留痕.png' },
        { title: '历史追溯', description: '查看历次考试记录', image: '/历史追溯.png' },
        { title: '多维对比', description: '横向纵向数据对比', image: '/多维对比.png' },
      ],
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-600 font-semibold tracking-wider uppercase text-sm"
          >
            核心功能
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mt-4"
          >
            让 AI 为教育赋能
          </motion.h2>
        </div>

        {/* Feature Blocks */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureBlock key={index} feature={feature} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
