import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { setUserInfo } from "../../../../store/slices/userSlice";
import { login } from "../../../../api/auth";
import { encryptPassword } from "../../../../utils/tools";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 密码加密处理
      const encryptedValues = { username };
      try {
        encryptedValues.password = encryptPassword(password);
      } catch (cryptoError) {
        console.warn("密码加密失败，使用原始密码:", cryptoError);
        encryptedValues.password = password;
      }

      // 调用后端登录接口
      const response = await login(encryptedValues);

      // 保存到 localStorage，供阅卷系统读取
      localStorage.setItem('token', response.token);
      localStorage.setItem('userInfo', JSON.stringify(response));
      
      // 同时保存到 Redux store
      dispatch(
        setUserInfo({
          userInfo: response,
          token: response.token,
        })
      );

      // 跳转到阅卷系统首页（考试列表页）
      setTimeout(() => {
        navigate('/app/home');
      }, 800);
    } catch (error) {
      console.error("登录错误:", error);
      // 登录失败时不显示提示，保持界面简洁
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-slate-900 font-medium">
          用户名
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="请输入用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="h-12 bg-white border-stone-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-slate-900 font-medium">
            密码
          </Label>
          <button type="button" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            忘记密码？
          </button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-12 bg-white border-stone-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-70"
      >
        {isLoading ? "登录中..." : "登录"}
      </Button>
    </form>
  );
}
