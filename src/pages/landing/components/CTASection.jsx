import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-6 bg-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto relative rounded-[60px] overflow-hidden bg-slate-900 text-white text-center py-24 px-6 md:px-20"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            准备好让阅卷<br />变得轻松了吗？
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12">
            加入数千名教师的行列，体验 AI 带来的教学变革。
          </p>
          
          <Button 
            variant="white" 
            size="lg" 
            className="px-12 py-5 text-xl font-bold group"
            onClick={() => navigate('/login')}
          >
            立即登录
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </motion.div>
    </section>
  );
};

export default CTASection;
