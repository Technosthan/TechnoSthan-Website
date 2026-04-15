import { useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, XCircle, Mail } from "lucide-react";
import GoogleLoginButton from "../components/GoogleLoginButton";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Validation
  const validate = () => {
    let errors = {};

    if (!form.email.trim()) {
      errors.email = "Email is required";
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
      const result = await login(form);
      const { user } = result;

      // Role-based navigation
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-white to-yellow-100 dark:from-green-900 dark:via-gray-900 dark:to-yellow-900 transition-colors duration-500 px-4">
      {/* 🌱 Branding */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src="/hero.png"
          className="w-12 h-12 rounded-full border-2 border-green-500 shadow"
          alt="TECHNOSTHAN AGRITECH Logo"
        />
        <h1 className="font-bold text-3xl md:text-4xl bg-gradient-to-r from-green-600 to-yellow-500 text-transparent bg-clip-text drop-shadow-lg">
          TECHNOSTHAN AGRITECH
        </h1>
      </div>

      {/* 💎 Card */}
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-800/40 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-green-200 dark:hover:shadow-yellow-900">
        <h2 className="text-2xl font-semibold text-center text-green-700 dark:text-yellow-300 mb-1">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-300 mb-6 text-sm">
          Login to continue 🌱
        </p>

        {/* ❌ Global Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* � Phone */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 ${
                fieldError.email
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-green-500"
              }`}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldError.email && (
              <XCircle
                className="absolute right-3 top-3.5 text-red-500"
                size={20}
              />
            )}
            {fieldError.email && (
              <p className="text-red-500 text-xs mt-1">{fieldError.email}</p>
            )}
          </div>

          {/* 🔒 Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 ${
                fieldError.password
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-green-500"
              }`}
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
            className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* � Google Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Or
              </span>
            </div>
          </div>

          <div className="mt-4">
            <GoogleLoginButton />
          </div>
        </div>

        {/* �🔗 Footer */}
        <div className="text-center mt-5 space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-green-700 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
