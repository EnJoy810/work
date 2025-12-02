
// 微信图标
const WechatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer id="about" className="bg-transparent pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* 品牌区域 */}
        <div className="mb-16">
          
          {/* Brand */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex flex-row items-center justify-center gap-6">
              <img src="/清净科技.svg" alt="清净科技 Logo" className="h-12 w-auto flex-shrink-0" />
              <img src="/Badge.svg" alt="X-Lab Logo" className="h-12 w-auto flex-shrink-0" />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 text-center max-w-lg">
              致力于利用人工智能技术，为教育工作者提供高效、精准的阅卷与学情分析服务。
            </p>
            <div className="flex gap-4">
              {/* 微信图标 - 悬停显示二维码 */}
              <div className="relative group">
                <span className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">
                  <WechatIcon />
                </span>
                {/* 二维码弹出层 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-white rounded-2xl shadow-2xl p-2 border border-slate-100">
                    <img src="/wechat-qrcode.jpg" alt="微信公众号二维码" className="w-24 h-24 object-contain rounded-lg" style={{ transform: 'rotate(-0deg)' }} />
                    <p className="text-sm text-slate-600 text-center mt-3 font-medium whitespace-nowrap">扫码关注公众号</p>
                  </div>
                  {/* 小三角 */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white drop-shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div>© 2025 Qingjing AI. All rights reserved.</div>
          <div className="flex gap-8">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">京ICP备2025146902号</a>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
