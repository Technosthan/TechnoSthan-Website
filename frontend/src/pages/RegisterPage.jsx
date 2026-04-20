import { useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, XCircle } from "lucide-react";
import GoogleLoginButton from "../components/GoogleLoginButton";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) errors.name = "Name is required";

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else {
      if (!emailRegex.test(form.email)) {
        errors.email = "Enter a valid email address";
      } else {
        // Additional email domain check
        const allowedDomains = [
          "gmail.com",
          "yahoo.com",
          "outlook.com",
          "icloud.com",
          "hotmail.com",
        ];
        const domain = form.email.split("@")[1]?.toLowerCase();
        if (!allowedDomains.includes(domain)) {
          errors.email =
            "Only Gmail, Yahoo, Outlook, iCloud, or Hotmail emails are allowed";
        }
      }
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
      const registerData = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      console.log("Register Data:", registerData);
      const result = await register(registerData);
      console.log("Register Result:", result);

      // Navigate to login after successful registration
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-500 px-4">
      {/* 🌱 Branding */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src="/hero.png"
          className="w-12 h-12 rounded-full border-2 border-gray-300 shadow"
          alt="TECHNOSTHAN AGRITECH Logo"
        />
        <h1 className="font-bold text-3xl md:text-4xl bg-gradient-to-r from-gray-600 to-gray-500 text-transparent bg-clip-text drop-shadow-lg">
          TECHNOSTHAN AGRITECH
        </h1>
      </div>

      {/* 💎 Card */}
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-800/40 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-gray-200 dark:hover:shadow-gray-900">
        <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-gray-300 mb-1">
          Create Account
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-300 mb-6 text-sm">
          Smart farming starts here 🌱
        </p>

        {/* ❌ Global Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 👤 Name */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 ${
                fieldError.name
                  ? "border-gray-300 focus:ring-gray-400"
                  : "border-gray-200 focus:ring-gray-400"
              }`}
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

          {/* � Phone */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 ${
                fieldError.email
                  ? "border-gray-300 focus:ring-gray-400"
                  : "border-gray-200 focus:ring-gray-400"
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

          {/* �🔒 Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              className={`w-full pl-10 pr-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 ${
                fieldError.password
                  ? "border-gray-300 focus:ring-gray-400"
                  : "border-gray-200 focus:ring-gray-400"
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
                Registering...
              </>
            ) : (
              "Create Account"
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
            <GoogleLoginButton text="Continue with Google" />
          </div>
        </div>

        {/* �🔗 Footer */}
        <p className="text-center mt-5 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
