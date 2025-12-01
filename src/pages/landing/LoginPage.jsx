import { Link } from "react-router-dom";
import { CheckCircle2, GraduationCap, ArrowLeft } from "lucide-react";
import { LoginForm } from "./components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* 左侧面板 - 视觉展示 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* 细微的点阵图案 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 xl:p-20 text-white w-full">
          {/* 主要内容 */}
          <div className="flex-1 flex flex-col justify-center max-w-xl">
            {/* 阅卷的几何化表示 */}
            <div className="mb-12 relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/20 rounded-full w-3/4 mb-3" />
                    <div className="h-3 bg-white/10 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* 价值主张 */}
            <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight text-balance">
              智能阅卷，
              <br />
              高效教学
            </h1>
            <p className="text-xl text-slate-300 mb-4">让阅卷更智能</p>
            <p className="text-lg text-slate-400 leading-relaxed text-pretty">
              借助AI驱动的精准阅卷系统，优化您的工作流程。节省时间，提供更好的反馈，专注于最重要的事情——教学本身。
            </p>
          </div>

        </div>
      </div>

      {/* 右侧面板 - 登录表单 */}
      <div className="flex-1 lg:w-1/2 bg-stone-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-slate-900">清境智能</span>
          </div>
          <Link
            to="/landing"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
        </div>

        {/* 表单容器 - 移动端靠上，桌面端居中 */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">欢迎回来</h2>
              <p className="text-slate-600">登录到清境智能阅卷系统</p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-sm text-slate-600">
              还没有账号？{" "}
              <Link to="#" className="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                联系管理员
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
