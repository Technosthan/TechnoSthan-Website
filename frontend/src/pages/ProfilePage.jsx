import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Shield,
  Mail,
  Phone,
  MessageSquare,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
  User,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../features/auth/useAuth";
import {
  getProfile,
  updateProfile,
  changePassword,
  sendProfileEmailVerificationOTP,
  verifyProfileEmailOTP,
  sendProfilePhoneVerificationOTP,
  verifyProfilePhoneOTP,
  generateTelegramProfileLinkCode,
  getTelegramStatus,
  unlinkTelegramProfile,
} from "../features/dashboard/dashboardApi";

const initialTelegramState = {
  telegramLinked: false,
  telegramUsername: "",
  telegramChatId: "",
  telegramLinkCode: "",
  telegramLinkCodeExpires: null,
};

const ProfilePage = () => {
  const { theme } = useTheme();
  const { syncStoredUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    emailVerified: false,
    phoneVerified: false,
    telegramLinked: false,
    telegramUsername: "",
    status: "",
    hasPassword: false,
  });
  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [telegram, setTelegram] = useState(initialTelegramState);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState({
    profile: true,
    name: false,
    emailSend: false,
    emailVerify: false,
    phoneSend: false,
    phoneVerify: false,
    password: false,
    telegramGenerate: false,
    telegramRefresh: false,
    telegramUnlink: false,
  });
  const [cooldowns, setCooldowns] = useState({
    email: 0,
    phone: 0,
  });

  const verificationRequired = searchParams.get("verification") === "required";

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (cooldowns.email <= 0 && cooldowns.phone <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldowns((prev) => ({
        email: Math.max(prev.email - 1, 0),
        phone: Math.max(prev.phone - 1, 0),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldowns.email, cooldowns.phone]);

  const refreshAll = async () => {
    setLoading((prev) => ({ ...prev, profile: true, telegramRefresh: true }));
    try {
      const [profileRes, telegramRes] = await Promise.all([
        getProfile(),
        getTelegramStatus(),
      ]);
      const user = profileRes.data?.data;
      const telegramData = telegramRes.data?.data || initialTelegramState;

      setProfile(user);
      setName(user?.name || "");
      setEmailInput(user?.email || "");
      setPhoneInput(user?.mobile || "");
      setTelegram(telegramData);
      syncStoredUser({
        name: user?.name,
        email: user?.email,
        mobile: user?.mobile,
        emailVerified: user?.emailVerified,
        phoneVerified: user?.phoneVerified,
        telegramLinked: user?.telegramLinked,
        telegramUsername: user?.telegramUsername,
        status: user?.status,
        picture: user?.picture,
        hasPassword: user?.hasPassword,
      });
    } catch (error) {
      setBanner({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to load profile details",
      });
    } finally {
      setLoading((prev) => ({ ...prev, profile: false, telegramRefresh: false }));
    }
  };

  const setStatusMessage = (type, text) => setBanner({ type, text });

  const statusItems = useMemo(
    () => [
      {
        label: "Email",
        verified: !!profile.emailVerified,
        detail: profile.email || "Not added",
        icon: Mail,
      },
      {
        label: "Phone",
        verified: !!profile.phoneVerified,
        detail: profile.mobile || "Not added",
        icon: Phone,
      },
      {
        label: "Telegram",
        verified: !!profile.telegramLinked,
        detail: profile.telegramUsername ? `@${profile.telegramUsername}` : "Not linked",
        icon: MessageSquare,
      },
    ],
    [profile],
  );

  const completedChecks = statusItems.filter((item) => item.verified).length;

  const handleNameSave = async () => {
    if (!name.trim()) {
      setStatusMessage("error", "Name is required");
      return;
    }
    if (name.trim() === profile.name) {
      setStatusMessage("info", "Name is unchanged");
      return;
    }

    setLoading((prev) => ({ ...prev, name: true }));
    try {
      const res = await updateProfile({ name: name.trim() });
      const updatedUser = res.data?.user;
      setProfile((prev) => ({ ...prev, name: updatedUser?.name || name.trim() }));
      syncStoredUser({ name: updatedUser?.name || name.trim() });
      setStatusMessage("success", "Name updated successfully");
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to update name",
      );
    } finally {
      setLoading((prev) => ({ ...prev, name: false }));
    }
  };

  const handleSendEmailOtp = async () => {
    setLoading((prev) => ({ ...prev, emailSend: true }));
    try {
      const res = await sendProfileEmailVerificationOTP(emailInput);
      setCooldowns((prev) => ({ ...prev, email: 60 }));
      setStatusMessage("success", res.data?.message || "OTP sent to email");
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to send email OTP",
      );
    } finally {
      setLoading((prev) => ({ ...prev, emailSend: false }));
    }
  };

  const handleVerifyEmail = async () => {
    setLoading((prev) => ({ ...prev, emailVerify: true }));
    try {
      const res = await verifyProfileEmailOTP(emailOtp);
      const user = res.data?.data;
      setProfile((prev) => ({
        ...prev,
        email: user?.email || emailInput,
        emailVerified: true,
        status: user?.status || prev.status,
      }));
      setEmailInput(user?.email || emailInput);
      setEmailOtp("");
      syncStoredUser({
        email: user?.email || emailInput,
        emailVerified: true,
        status: user?.status || profile.status,
      });
      setStatusMessage("success", res.data?.message || "Email verified successfully");
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to verify email OTP",
      );
    } finally {
      setLoading((prev) => ({ ...prev, emailVerify: false }));
    }
  };

  const handleSendPhoneOtp = async () => {
    setLoading((prev) => ({ ...prev, phoneSend: true }));
    try {
      const res = await sendProfilePhoneVerificationOTP(phoneInput);
      setCooldowns((prev) => ({ ...prev, phone: 60 }));
      setStatusMessage("success", res.data?.message || "OTP sent to phone");
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to send phone OTP",
      );
    } finally {
      setLoading((prev) => ({ ...prev, phoneSend: false }));
    }
  };

  const handleVerifyPhone = async () => {
    setLoading((prev) => ({ ...prev, phoneVerify: true }));
    try {
      const res = await verifyProfilePhoneOTP(phoneOtp);
      const user = res.data?.data;
      setProfile((prev) => ({
        ...prev,
        mobile: user?.mobile || phoneInput,
        phoneVerified: true,
        status: user?.status || prev.status,
      }));
      setPhoneInput(user?.mobile || phoneInput);
      setPhoneOtp("");
      syncStoredUser({
        mobile: user?.mobile || phoneInput,
        phoneVerified: true,
        status: user?.status || profile.status,
      });
      setStatusMessage(
        "success",
        res.data?.message || "Phone number verified successfully",
      );
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to verify phone OTP",
      );
    } finally {
      setLoading((prev) => ({ ...prev, phoneVerify: false }));
    }
  };

  const handleGenerateTelegramCode = async () => {
    setLoading((prev) => ({ ...prev, telegramGenerate: true }));
    try {
      const res = await generateTelegramProfileLinkCode();
      const code = res.data?.data?.code || "";
      const expiresIn = 15 * 60 * 1000;
      setTelegram((prev) => ({
        ...prev,
        telegramLinkCode: code,
        telegramLinkCodeExpires: new Date(Date.now() + expiresIn).toISOString(),
      }));
      setStatusMessage(
        "success",
        res.data?.message || "Telegram linking code generated",
      );
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to generate Telegram link code",
      );
    } finally {
      setLoading((prev) => ({ ...prev, telegramGenerate: false }));
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setStatusMessage("error", "New password must be at least 6 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage("error", "New password and confirm password do not match");
      return;
    }

    setLoading((prev) => ({ ...prev, password: true }));
    try {
      const res = await changePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfile((prev) => ({ ...prev, hasPassword: true }));
      syncStoredUser({ hasPassword: true });
      setStatusMessage(
        "success",
        res.data?.message || "Password updated successfully",
      );
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to update password",
      );
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const handleRefreshTelegramStatus = async () => {
    setLoading((prev) => ({ ...prev, telegramRefresh: true }));
    try {
      const res = await getTelegramStatus();
      const telegramData = res.data?.data || initialTelegramState;
      setTelegram(telegramData);
      setProfile((prev) => ({
        ...prev,
        telegramLinked: telegramData.telegramLinked,
        telegramUsername: telegramData.telegramUsername,
      }));
      syncStoredUser({
        telegramLinked: telegramData.telegramLinked,
        telegramUsername: telegramData.telegramUsername,
      });
      setStatusMessage("success", "Telegram status refreshed");
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to refresh Telegram status",
      );
    } finally {
      setLoading((prev) => ({ ...prev, telegramRefresh: false }));
    }
  };

  const handleUnlinkTelegram = async () => {
    setLoading((prev) => ({ ...prev, telegramUnlink: true }));
    try {
      const res = await unlinkTelegramProfile();
      setTelegram(initialTelegramState);
      setProfile((prev) => ({
        ...prev,
        telegramLinked: false,
        telegramUsername: "",
      }));
      syncStoredUser({
        telegramLinked: false,
        telegramUsername: "",
      });
      setStatusMessage("success", res.data?.message || "Telegram unlinked successfully");
    } catch (error) {
      setStatusMessage(
        "error",
        error.response?.data?.message || "Failed to unlink Telegram",
      );
    } finally {
      setLoading((prev) => ({ ...prev, telegramUnlink: false }));
    }
  };

  const badgeClasses = (verified) =>
    verified
      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
      : "bg-rose-500/15 text-rose-300 border border-rose-500/30";

  const cardClasses = `${theme.card} border border-gray-700 rounded-2xl p-5 shadow-lg`;
  const buttonBase =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg} ${theme.text}`}>
      <Navbar />

      <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">
              Account Center
            </p>
            <h1 className="text-3xl font-semibold mt-2">Profile & Verification</h1>
            <p className="text-gray-400 mt-2">
              Manage your personal details, complete pending verification, and secure your account access.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Security Progress</p>
            <p className="mt-1 text-2xl font-semibold">
              {completedChecks}/{statusItems.length}
            </p>
          </div>
        </div>

        {verificationRequired && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5" size={18} />
              <div>
                <p className="font-semibold">Complete your account verification to continue.</p>
                <p className="text-sm text-amber-100/80 mt-1">
                  You are signed in, but some protected areas will stay locked until your email and phone number are verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {banner && (
          <div
            className={`mb-6 rounded-2xl p-4 ${
              banner.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : banner.type === "error"
                  ? "border border-rose-500/30 bg-rose-500/10 text-rose-200"
                  : "border border-blue-500/30 bg-blue-500/10 text-blue-200"
            }`}
          >
            {banner.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className={cardClasses}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Basic Profile</h2>
                  <p className="text-sm text-gray-400">Update the primary details visible on your account.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={theme.input}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Account Status</label>
                  <div className="rounded-xl border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-gray-300">
                    {profile.status || "Unknown"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNameSave}
                disabled={loading.name}
                className={`${buttonBase} mt-4 bg-blue-600 hover:bg-blue-500`}
              >
                {loading.name ? <RefreshCw className="animate-spin" size={16} /> : null}
                {loading.name ? "Saving..." : "Save Name"}
              </button>
            </section>

            <section className={cardClasses}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                  <Mail size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">Email Verification</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(profile.emailVerified)}`}>
                      {profile.emailVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Verify your email or update it safely using a one-time password.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={theme.input}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="md:self-end">
                  <button
                    onClick={handleSendEmailOtp}
                    disabled={loading.emailSend || cooldowns.email > 0 || !emailInput.trim()}
                    className={`${buttonBase} w-full md:w-auto bg-emerald-600 hover:bg-emerald-500`}
                  >
                    {loading.emailSend ? <RefreshCw className="animate-spin" size={16} /> : null}
                    {cooldowns.email > 0
                      ? `Resend in ${cooldowns.email}s`
                      : loading.emailSend
                        ? "Sending..."
                        : "Send OTP"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Email OTP</label>
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                    className={`${theme.input} text-center tracking-[0.35em]`}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div className="md:self-end">
                  <button
                    onClick={handleVerifyEmail}
                    disabled={loading.emailVerify || emailOtp.length !== 6}
                    className={`${buttonBase} w-full md:w-auto bg-sky-600 hover:bg-sky-500`}
                  >
                    {loading.emailVerify ? <RefreshCw className="animate-spin" size={16} /> : null}
                    {loading.emailVerify ? "Verifying..." : "Verify Email"}
                  </button>
                </div>
              </div>
            </section>

            <section className={cardClasses}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-300">
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">Phone Verification</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(profile.phoneVerified)}`}>
                      {profile.phoneVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Add or update your phone number with OTP verification. Country code is supported.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className={theme.input}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div className="md:self-end">
                  <button
                    onClick={handleSendPhoneOtp}
                    disabled={loading.phoneSend || cooldowns.phone > 0 || !phoneInput.trim()}
                    className={`${buttonBase} w-full md:w-auto bg-violet-600 hover:bg-violet-500`}
                  >
                    {loading.phoneSend ? <RefreshCw className="animate-spin" size={16} /> : null}
                    {cooldowns.phone > 0
                      ? `Resend in ${cooldowns.phone}s`
                      : loading.phoneSend
                        ? "Sending..."
                        : "Send OTP"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Phone OTP</label>
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                    className={`${theme.input} text-center tracking-[0.35em]`}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div className="md:self-end">
                  <button
                    onClick={handleVerifyPhone}
                    disabled={loading.phoneVerify || phoneOtp.length !== 6}
                    className={`${buttonBase} w-full md:w-auto bg-cyan-600 hover:bg-cyan-500`}
                  >
                    {loading.phoneVerify ? <RefreshCw className="animate-spin" size={16} /> : null}
                    {loading.phoneVerify ? "Verifying..." : "Verify Phone"}
                  </button>
                </div>
              </div>
            </section>

            <section className={cardClasses}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-300">
                  <Lock size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">Password & Access</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {profile.hasPassword
                      ? "Change your current password to keep your account secure."
                      : "Set a password for your Google account so you can also sign in with email and password."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className={`${theme.input} pr-12`}
                      placeholder={
                        profile.hasPassword
                          ? "Enter your current password"
                          : "Not required for Google-only accounts"
                      }
                      disabled={!profile.hasPassword}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute inset-y-0 right-3 text-gray-400"
                      disabled={!profile.hasPassword}
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {!profile.hasPassword && (
                    <p className="mt-2 text-xs text-cyan-300">
                      This account does not have a password yet. You can set one directly below.
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.next ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className={`${theme.input} pr-12`}
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            next: !prev.next,
                          }))
                        }
                        className="absolute inset-y-0 right-3 text-gray-400"
                      >
                        {showPasswords.next ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className={`${theme.input} pr-12`}
                        placeholder="Repeat new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                        className="absolute inset-y-0 right-3 text-gray-400"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={
                    loading.password ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword
                  }
                  className={`${buttonBase} bg-amber-600 hover:bg-amber-500`}
                >
                  {loading.password ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
                  {loading.password ? "Updating..." : "Update Password"}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className={cardClasses}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Security Status</h2>
                  <p className="text-sm text-gray-400">A quick overview of your account verification health.</p>
                </div>
              </div>

              <div className="space-y-3">
                {statusItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-gray-700 bg-gray-900/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gray-800 p-2 text-gray-200">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.detail}</p>
                        </div>
                      </div>
                      {item.verified ? (
                        <CheckCircle2 className="text-emerald-400" size={18} />
                      ) : (
                        <AlertTriangle className="text-amber-400" size={18} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={cardClasses}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
                  <MessageSquare size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">Telegram Linking</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(telegram.telegramLinked)}`}>
                      {telegram.telegramLinked ? "Linked" : "Not Linked"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Link your Telegram account to receive secure login OTPs.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-4">
                <p className="text-sm text-gray-400">Current Telegram Account</p>
                <p className="mt-2 text-lg font-semibold">
                  {telegram.telegramUsername ? `@${telegram.telegramUsername}` : "Not linked yet"}
                </p>
              </div>

              {!telegram.telegramLinked && (
                <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-200">Generate a link code, open the bot, then send the command shown below.</p>
                  {telegram.telegramLinkCode && (
                    <div className="mt-4 rounded-xl border border-blue-500/20 bg-gray-950/40 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-blue-300">Link Command</p>
                      <p className="mt-2 text-lg font-semibold tracking-wider">
                        /link {telegram.telegramLinkCode}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleGenerateTelegramCode}
                  disabled={
                    loading.telegramGenerate ||
                    !profile.phoneVerified ||
                    !profile.mobile ||
                    telegram.telegramLinked
                  }
                  className={`${buttonBase} bg-blue-600 hover:bg-blue-500`}
                >
                  {loading.telegramGenerate ? <RefreshCw className="animate-spin" size={16} /> : <LinkIcon size={16} />}
                  {loading.telegramGenerate ? "Generating..." : "Generate Link Code"}
                </button>

                <button
                  onClick={() =>
                    window.open("https://t.me/TechnoSthan_HR_Bot", "_blank")
                  }
                  className={`${buttonBase} bg-transparent border border-blue-500/40 hover:bg-blue-500/10`}
                >
                  <ExternalLink size={16} />
                  Open Telegram Bot
                </button>

                <button
                  onClick={handleRefreshTelegramStatus}
                  disabled={loading.telegramRefresh}
                  className={`${buttonBase} bg-transparent border border-gray-600 hover:bg-gray-800`}
                >
                  {loading.telegramRefresh ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  Refresh Status
                </button>

                {telegram.telegramLinked && (
                  <button
                    onClick={handleUnlinkTelegram}
                    disabled={loading.telegramUnlink}
                    className={`${buttonBase} bg-rose-600 hover:bg-rose-500`}
                  >
                    {loading.telegramUnlink ? <RefreshCw className="animate-spin" size={16} /> : <Unlink size={16} />}
                    Unlink Telegram
                  </button>
                )}
              </div>

              {!profile.phoneVerified && (
                <p className="mt-4 text-sm text-amber-300">
                  Verify your phone number before linking Telegram.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
