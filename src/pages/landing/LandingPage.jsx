import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductDemoSection from './components/ProductDemoSection';
import FeaturesSection from './components/FeaturesSection';
import StatsSection from './components/StatsSection';
import PricingSection from './components/PricingSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

function LandingPage() {
  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen selection:bg-emerald-500/30 relative">
      {/* 全局极光背景 - 移动端缩小尺寸提升性能 */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[15%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[10%] right-[15%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[25%] w-[275px] h-[275px] md:w-[550px] md:h-[550px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-[70%] right-[20%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-6000"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <div id="demo">
            <ProductDemoSection />
          </div>
          <StatsSection />
          <div id="features">
            <FeaturesSection />
          </div>
          <div id="pricing">
            <PricingSection />
          </div>
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;
