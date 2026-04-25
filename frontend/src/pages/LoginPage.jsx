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

  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      const userData = JSON.parse(user);
      navigate(userData.role === "admin" ? "/admin/dashboard" : "/");
    }
  }, [searchParams, navigate]);

  const validate = () => {
    let errors = {};
    if (!isLogin && !form.name.trim()) errors.name = "Name is required";
    if (!form.contact.trim()) errors.contact = "Email or Phone is required";
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
      navigate(user.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${theme.bg} ${theme.text}`}
    >
      <div
        className={`${theme.cardOpacity} p-8 rounded-3xl shadow-2xl w-full max-w-md`}
      >
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-l-xl ${
              isLogin ? theme.button : `${theme.surface} ${theme.textSecondary}`
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-r-xl ${
              !isLogin
                ? theme.button
                : `${theme.surface} ${theme.textSecondary}`
            }`}
          >
            Register
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <Shield className={`mx-auto mb-2 ${theme.accent}`} size={28} />
          <h2 className="text-2xl font-semibold">
            {isLogin ? "Login" : "Register"}
          </h2>
          <p className={theme.textSecondary}>
            {isLogin ? "Welcome back 🌱" : "Create account 🌱"}
          </p>
        </div>

        {/* Error */}
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <User className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                className={`${theme.input} pl-10`}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          {/* Contact */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Mail className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Email or Phone"
              value={form.contact}
              className={`${theme.input} pl-10`}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Lock className="text-gray-400" size={18} />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              className={`${theme.input} pl-10 pr-10`}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full ${theme.button} py-3 rounded-xl flex justify-center items-center gap-2`}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={`w-full ${theme.card} ${theme.border} py-3 rounded-xl flex items-center justify-center gap-2`}
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
