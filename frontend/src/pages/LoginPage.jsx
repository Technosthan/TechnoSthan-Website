import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  XCircle,
  Mail,
  Shield,
  UserPlus,
  User,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const LoginPage = () => {
  const { login, register, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();

  const [isLogin, setIsLogin] = useState(true); // true for login, false for register

  const [form, setForm] = useState({
    name: "",
    contact: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      const userData = JSON.parse(user);
      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [searchParams, navigate]);

  // ✅ Validation
  const validate = () => {
    let errors = {};

    if (!isLogin && !form.name.trim()) {
      errors.name = "Name is required";
    }
    if (!form.contact.trim()) {
      errors.contact = "Email or Phone is required";
    }
    if (form.password.length < 6) errors.password = "Min 6 characters required";

    setFieldError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const result = isLogin ? await login(form) : await register(form);
      const { user } = result;

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${theme.bgGradient} ${theme.text} transition-colors duration-500 px-4`}
    >
      {/* 🌱 Branding */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src="/hero.png"
          className="w-12 h-12 rounded-full border-2 border-green-500 shadow"
          alt="TECHNOSTHAN AGRITECH Logo"
        />
        <h1
          className={`font-bold text-3xl md:text-4xl ${theme.accent} drop-shadow-lg`}
        >
          TECHNOSTHAN AGRITECH
        </h1>
      </div>

      {/* 💎 Card */}
      <div
        className={`${theme.cardOpacity} ${theme.text} backdrop-blur-xl border border-white/40 dark:border-gray-800/40 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-green-200 dark:hover:shadow-yellow-900`}
      >
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded-l-xl transition ${isLogin ? `${theme.button} text-white` : `bg-gray-200 dark:bg-gray-700 ${theme.textSecondary}`}`}
          >
            <User size={18} className="inline mr-2" />
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded-r-xl transition ${!isLogin ? `${theme.button} text-white` : `bg-gray-200 dark:bg-gray-700 ${theme.textSecondary}`}`}
          >
            <UserPlus size={18} className="inline mr-2" />
            Register
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className={`${theme.accent}`} size={24} />
          <h2
            className={`text-2xl font-semibold text-center ${theme.text} ${theme.textDark}`}
          >
            {isLogin ? "Login" : "Register"}
          </h2>
        </div>
        <p className={`text-center ${theme.textSecondary} mb-6 text-sm`}>
          {isLogin ? "Welcome back! 🌱" : "Join us! 🌱"}
        </p>

        {/* ❌ Global Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 👤 Name - only for register */}
          {!isLogin && (
            <div className="relative">
              <User
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-300 ${fieldError.name ? theme.error : theme.input}`}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {fieldError.name && (
                <XCircle
                  className="absolute right-3 top-3.5 text-red-500"
                  size={20}
                />
              )}
              {fieldError.name && (
                <p className="text-red-500 text-xs mt-1">{fieldError.name}</p>
              )}
            </div>
          )}

          {/* 📧 Contact */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Email or Phone"
              value={form.contact}
              className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-300 ${fieldError.contact ? theme.error : theme.input}`}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            {fieldError.contact && (
              <XCircle
                className="absolute right-3 top-3.5 text-red-500"
                size={20}
              />
            )}
            {fieldError.contact && (
              <p className="text-red-500 text-xs mt-1">{fieldError.contact}</p>
            )}
          </div>

          {/* 🔒 Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-300 ${fieldError.password ? theme.error : theme.input}`}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {/* 👁 Toggle */}
            <div
              className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-green-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>

            {fieldError.password && (
              <p className="text-red-500 text-xs mt-1">{fieldError.password}</p>
            )}
          </div>

          {/* 🚀 Button */}
          <button
            className={`w-full ${theme.button} hover:scale-105 transition transform px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isLogin ? "Logging in..." : "Registering..."}
              </>
            ) : (
              <>
                <Shield size={18} />
                {isLogin ? "Login" : "Register"}
              </>
            )}
          </button>

          {/* 🌐 Google Login */}
          <button
            onClick={handleGoogleLogin}
            className={`w-full bg-white hover:bg-gray-50 ${theme.text} border border-gray-300 hover:scale-105 transition transform px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
