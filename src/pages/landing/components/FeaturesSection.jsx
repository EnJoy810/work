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
      title: '全程提效，省时省心',
      description: '答题卡设计、评分细则、批改出分，全流程一步到位',
      options: [
        { title: '一键创建，即刻批改', description: '可视化答题卡设计，即刻完成模板搭建', image: '/零门槛使用.png' },
        { title: '灵活调整，随心所欲', description: '随时修改评分细则，适配各类题型', image: '/评分细则.png' },
        { title: '批改结果，瞬时到达', description: '分秒级批改能力，海量试卷轻松应对', image: '/秒级批改.png' },
      ],
    },
    {
      title: '批改留痕，有迹可循',
      description: '每一笔批注都有记录，教学复盘更轻松',
      options: [
        { title: '痕迹保留，随时回看', description: '红笔批注完整保存，批改过程可追溯', image: '/批改留痕.png' },
        { title: '历史对比，进步可见', description: '多次考试成绩对比，学生成长看得见', image: '/历史追溯.png' },
        { title: '个性追踪，因材施教', description: '每个学生独立档案，针对性辅导更精准', image: '/多维对比.png' },
      ],
    },
    {
      title: '学情报告，一目了然',
      description: '数据可视化呈现，薄弱点一眼看穿',
      options: [
        { title: '成绩总览，清晰直观', description: '班级排名、分数分布，一眼掌握全局', image: '/成绩统计.png' },
        { title: '错题聚焦，重点突破', description: '高频错题自动汇总，精准定位薄弱点', image: '/答题分析.png' },
        { title: '一键导出，分享无忧', description: '多格式报告下载，家校沟通更便捷', image: '/数据导出.png' },
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
