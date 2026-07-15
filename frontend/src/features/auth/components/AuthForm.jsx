import { useState } from "react";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
} from "react-icons/fi";

const AuthForm = ({
  mode = "login",
  onSubmit,
  loading = false,
  error = "",
}) => {
  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const isRegister = mode === "register";

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (loading) return;

    onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <label className="auth-field">
          <span className="auth-field-label">
            <FiUser />
            Full name
          </span>

          <div className="auth-input-wrapper">
            <FiUser className="auth-input-icon" />

            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={loading}
              required
            />
          </div>
        </label>
      )}

      <label className="auth-field">
        <span className="auth-field-label">
          <FiMail />
          Email address
        </span>

        <div className="auth-input-wrapper">
          <FiMail className="auth-input-icon" />

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            autoComplete="email"
            disabled={loading}
            required
          />
        </div>
      </label>

      <label className="auth-field">
        <span className="auth-field-label">
          <FiLock />
          Password
        </span>

        <div className="auth-input-wrapper">
          <FiLock className="auth-input-icon" />

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            autoComplete={
              isRegister ? "new-password" : "current-password"
            }
            disabled={loading}
            required
          />

          <button
            type="button"
            className="auth-password-toggle"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
            disabled={loading}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </label>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        <span>
          {loading
            ? isRegister
              ? "Creating account..."
              : "Signing in..."
            : isRegister
              ? "Create account"
              : "Login"}
        </span>

        {!loading && <FiArrowRight />}
      </button>
    </form>
  );
};

export default AuthForm;
