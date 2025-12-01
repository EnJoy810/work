import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

// 打字机效果标题组件
const TypewriterTitle = () => {
  const text = '选择适合您的方案';
  const [displayText, setDisplayText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true);
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex <= text.length) {
          setDisplayText(text.substring(0, currentIndex));
          currentIndex++;
          if (currentIndex <= text.length) {
            setTimeout(typeNextChar, 100);
          }
        }
      };
      
      // 延迟一点开始打字
      setTimeout(typeNextChar, 300);
    }
  }, [isInView, hasStarted]);

  return (
    <div ref={ref} className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 min-h-[48px]">
        {displayText}
        {displayText.length < text.length && (
          <span className="inline-block w-0.5 h-8 bg-emerald-500 ml-1 animate-pulse align-middle" />
        )}
      </h2>
      <p className={`text-slate-600 max-w-2xl mx-auto transition-opacity duration-500 ${displayText.length === text.length ? 'opacity-100' : 'opacity-0'}`}>
        灵活的定价方案，满足不同规模的教育需求
      </p>
    </div>
  );
};

const PricingCard = ({ plan, delay, featured = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`relative bg-white rounded-2xl p-8 border-2 ${
        featured 
          ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' 
          : 'border-slate-200 shadow-lg shadow-slate-200/30'
      } transition-all duration-300 hover:shadow-xl`}
    >
      {/* 标签 */}
      <div className="text-xs text-slate-400 mb-4">{plan.tag}</div>
      
      {/* 标题和价格 */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
        {plan.period && <span className="text-slate-500">{plan.period}</span>}
      </div>
      
      {/* 描述 */}
      <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
      
      {/* 按钮 */}
      <button
        className={`w-full py-3 px-6 rounded-full font-medium transition-all ${
          featured
            ? 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {plan.buttonText}
      </button>
      
      {/* 功能列表 */}
      {plan.features && plan.features.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

const PricingSection = () => {
  const plans = [
    {
      tag: '免费体验',
      name: '基础版',
      price: '¥19.9',
      period: '/月',
      description: '适合个人教师体验使用',
      buttonText: '立即体验',
      features: [
        '每月100份试卷批改额度',
        '支持语数英三科',
        '基础学情分析报告',
        '标准客服支持',
      ],
    },
    {
      tag: '最受欢迎',
      name: '专业版',
      price: '¥199',
      period: '/月',
      description: '适合学校和教育机构使用',
      buttonText: '联系我们',
      features: [
        '无限试卷批改额度',
        '支持全部9个科目',
        '高级学情分析与报告',
        '批量导入导出功能',
        '优先客服支持',
      ],
    },
    {
      tag: '定制方案',
      name: '企业版',
      price: '定制',
      period: '',
      description: '适合大型教育集团定制需求',
      buttonText: '联系我们',
      features: [
        '专属部署方案',
        '定制化功能开发',
        'API接口对接',
        '专属客户成功经理',
        '7×24小时技术支持',
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-transparent relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* 标题 - 打字机效果 */}
        <TypewriterTitle />

        {/* 定价卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              delay={index * 0.1}
              featured={index === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
