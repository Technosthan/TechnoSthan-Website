import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
  Shield,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { toast } from "react-hot-toast";

import { useAuth } from "../auth/useAuth";

import {
  getProfile,
  updateProfile,
  changePassword,
  sendProfileEmailVerificationOTP,
  sendProfilePhoneVerificationOTP,
} from "../dashboard/dashboardApi";

import {
  generateAdminTelegramProfileLinkCode,
  getAdminTelegramStatus,
  unlinkAdminTelegramProfile,
} from "./adminApi";

const initialPasswordState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const AdminProfilePage = () => {
  const { syncStoredUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    status: "",
    emailVerified: false,
    phoneVerified: false,
    telegramLinked: false,
    telegramUsername: "",
  });

  const [telegram, setTelegram] = useState({
    telegramLinked: false,
    telegramUsername: "",
    telegramLinkCode: "",
  });

  const [password, setPassword] = useState(
    initialPasswordState,
  );

  const [loading, setLoading] = useState({
    profile: false,
    saveProfile: false,
    changePassword: false,
    generateTelegram: false,
    unlinkTelegram: false,
    emailOtp: false,
    phoneOtp: false,
  });

  useEffect(() => {
    refreshProfile();
    refreshTelegramStatus();
  }, []);

  const refreshProfile = async () => {
    setLoading((prev) => ({
      ...prev,
      profile: true,
    }));

    try {
      const res = await getProfile();

      if (res?.data?.data) {
        setProfile((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (error) {
      toast.error("Unable to load profile.");
    } finally {
      setLoading((prev) => ({
        ...prev,
        profile: false,
      }));
    }
  };

  const refreshTelegramStatus = async () => {
    try {
      const res = await getAdminTelegramStatus();

      setTelegram(
        res?.data?.data || {
          telegramLinked: false,
        },
      );
    } catch (error) {
      toast.error(
        "Unable to load Telegram status.",
      );
    }
  };

  const handleInputChange = (
    field,
    value,
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!profile.name?.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!profile.email?.trim()) {
      toast.error("Email is required.");
      return;
    }

    setLoading((prev) => ({
      ...prev,
      saveProfile: true,
    }));

    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        mobile: profile.mobile?.trim() || "",
      };

      const res = await updateProfile(
        payload,
      );

      if (res?.data?.success) {
        const updatedUser =
          res?.data?.user || payload;

        setProfile((prev) => ({
          ...prev,
          ...updatedUser,
        }));

        syncStoredUser(updatedUser);

        toast.success(
          "Profile updated successfully.",
        );
      } else {
        toast.error(
          res?.data?.message ||
            "Unable to update profile.",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update profile.",
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        saveProfile: false,
      }));
    }
  };

  const handleChangePassword =
    async () => {
      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = password;

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        toast.error(
          "Please fill all password fields.",
        );
        return;
      }

      if (newPassword.length < 8) {
        toast.error(
          "Password must be at least 8 characters.",
        );
        return;
      }

      if (
        newPassword !== confirmPassword
      ) {
        toast.error(
          "Passwords do not match.",
        );
        return;
      }

      setLoading((prev) => ({
        ...prev,
        changePassword: true,
      }));

      try {
        await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

        setPassword(
          initialPasswordState,
        );

        toast.success(
          "Password updated successfully.",
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to change password.",
        );
      } finally {
        setLoading((prev) => ({
          ...prev,
          changePassword: false,
        }));
      }
    };

  const handleGenerateTelegramCode =
    async () => {
      setLoading((prev) => ({
        ...prev,
        generateTelegram: true,
      }));

      try {
        const res =
          await generateAdminTelegramProfileLinkCode();

        if (res?.data?.data) {
          setTelegram((prev) => ({
            ...prev,
            telegramLinkCode:
              res.data.data.code,
          }));

          toast.success(
            "Telegram code generated.",
          );
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to generate code.",
        );
      } finally {
        setLoading((prev) => ({
          ...prev,
          generateTelegram: false,
        }));
      }
    };

  const handleUnlinkTelegram =
    async () => {
      setLoading((prev) => ({
        ...prev,
        unlinkTelegram: true,
      }));

      try {
        await unlinkAdminTelegramProfile();

        setTelegram({
          telegramLinked: false,
          telegramUsername: "",
          telegramLinkCode: "",
        });

        toast.success(
          "Telegram unlinked successfully.",
        );

        refreshProfile();
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to unlink Telegram.",
        );
      } finally {
        setLoading((prev) => ({
          ...prev,
          unlinkTelegram: false,
        }));
      }
    };

  const handleSendEmailOTP =
    async () => {
      if (!profile.email?.trim()) {
        toast.error(
          "Please enter email first.",
        );
        return;
      }

      setLoading((prev) => ({
        ...prev,
        emailOtp: true,
      }));

      try {
        await sendProfileEmailVerificationOTP(
          profile.email.trim(),
        );

        toast.success("Email OTP sent.");
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to send email OTP.",
        );
      } finally {
        setLoading((prev) => ({
          ...prev,
          emailOtp: false,
        }));
      }
    };

  const handleSendPhoneOTP =
    async () => {
      if (!profile.mobile?.trim()) {
        toast.error(
          "Please enter mobile number.",
        );
        return;
      }

      setLoading((prev) => ({
        ...prev,
        phoneOtp: true,
      }));

      try {
        await sendProfilePhoneVerificationOTP(
          profile.mobile.trim(),
        );

        toast.success("Phone OTP sent.");
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to send phone OTP.",
        );
      } finally {
        setLoading((prev) => ({
          ...prev,
          phoneOtp: false,
        }));
      }
    };

  const badgeClasses = (active) =>
    `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
      active
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-amber-500/15 text-amber-300"
    }`;

  return (
    <div className="min-h-screen bg-transparent py-6 px-4 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-400">
            Admin Profile
          </p>

          <h1 className="mt-2 text-2xl font-bold text-white">
            Manage Account
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Update profile, password &
            Telegram settings.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <p className="text-sm text-sky-400">
                    Profile
                  </p>

                  <h2 className="text-lg font-semibold text-white">
                    Personal Information
                  </h2>
                </div>

                <span
                  className={badgeClasses(
                    profile.status ===
                      "active",
                  )}
                >
                  {profile.status ||
                    "Unknown"}
                </span>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Full Name
                  </label>

                  <input
                    value={profile.name}
                    onChange={(e) =>
                      handleInputChange(
                        "name",
                        e.target.value,
                      )
                    }
                    placeholder="Admin Name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Email
                  </label>

                  <input
                    value={profile.email}
                    onChange={(e) =>
                      handleInputChange(
                        "email",
                        e.target.value,
                      )
                    }
                    placeholder="admin@email.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Mobile
                  </label>

                  <input
                    value={profile.mobile}
                    onChange={(e) =>
                      handleInputChange(
                        "mobile",
                        e.target.value,
                      )
                    }
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={badgeClasses(
                    profile.emailVerified,
                  )}
                >
                  <Mail className="h-3.5 w-3.5" />

                  {profile.emailVerified
                    ? "Email Verified"
                    : "Email Not Verified"}
                </span>

                <span
                  className={badgeClasses(
                    profile.phoneVerified,
                  )}
                >
                  <Phone className="h-3.5 w-3.5" />

                  {profile.phoneVerified
                    ? "Phone Verified"
                    : "Phone Not Verified"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {!profile.emailVerified && (
                  <button
                    onClick={
                      handleSendEmailOTP
                    }
                    disabled={
                      loading.emailOtp
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition"
                  >
                    {loading.emailOtp ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}

                    Send Email OTP
                  </button>
                )}

                {!profile.phoneVerified && (
                  <button
                    onClick={
                      handleSendPhoneOTP
                    }
                    disabled={
                      loading.phoneOtp
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition"
                  >
                    {loading.phoneOtp ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}

                    Send Phone OTP
                  </button>
                )}

                <button
                  onClick={
                    handleSaveProfile
                  }
                  disabled={
                    loading.saveProfile
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition"
                >
                  {loading.saveProfile ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}

                  Save Profile
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-5 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-sm text-sky-400">
                  Security
                </p>

                <h2 className="text-lg font-semibold text-white">
                  Change Password
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={
                    password.currentPassword
                  }
                  onChange={(e) =>
                    setPassword((prev) => ({
                      ...prev,
                      currentPassword:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={
                      password.newPassword
                    }
                    onChange={(e) =>
                      setPassword(
                        (prev) => ({
                          ...prev,
                          newPassword:
                            e.target.value,
                        }),
                      )
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={
                      password.confirmPassword
                    }
                    onChange={(e) =>
                      setPassword(
                        (prev) => ({
                          ...prev,
                          confirmPassword:
                            e.target.value,
                        }),
                      )
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  onClick={
                    handleChangePassword
                  }
                  disabled={
                    loading.changePassword
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition"
                >
                  {loading.changePassword ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}

                  Update Password
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-5 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-sm text-sky-400">
                  Summary
                </p>

                <h2 className="text-lg font-semibold text-white">
                  Account Info
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs text-slate-500 uppercase">
                    Role
                  </p>

                  <p className="mt-2 text-white font-semibold">
                    {profile.role ||
                      "Admin"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs text-slate-500 uppercase">
                    Telegram
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={badgeClasses(
                        profile.telegramLinked,
                      )}
                    >
                      {profile.telegramLinked ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}

                      {profile.telegramLinked
                        ? "Linked"
                        : "Not Linked"}
                    </span>

                    {profile.telegramUsername && (
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                        @
                        {
                          profile.telegramUsername
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-5 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-sm text-sky-400">
                  Telegram
                </p>

                <h2 className="text-lg font-semibold text-white">
                  Link Telegram
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">
                    Current Account
                  </p>

                  <p className="mt-2 text-white font-semibold">
                    {telegram.telegramUsername
                      ? `@${telegram.telegramUsername}`
                      : "Not linked"}
                  </p>
                </div>

                {!telegram.telegramLinked &&
                  telegram.telegramLinkCode && (
                    <div className="rounded-xl border border-sky-600 bg-slate-900 p-4">
                      <p className="text-xs text-sky-300 uppercase">
                        Command
                      </p>

                      <p className="mt-2 text-white font-semibold">
                        /link{" "}
                        {
                          telegram.telegramLinkCode
                        }
                      </p>
                    </div>
                  )}

                <button
                  onClick={
                    handleGenerateTelegramCode
                  }
                  disabled={
                    loading.generateTelegram ||
                    profile.telegramLinked
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition"
                >
                  {loading.generateTelegram ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}

                  Generate Link Code
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://t.me/Technosthan_Bot",
                      "_blank",
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition"
                >
                  <ExternalLink className="h-4 w-4" />

                  Open Telegram Bot
                </button>

                {profile.telegramLinked && (
                  <button
                    onClick={
                      handleUnlinkTelegram
                    }
                    disabled={
                      loading.unlinkTelegram
                    }
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition"
                  >
                    {loading.unlinkTelegram ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="h-4 w-4" />
                    )}

                    Unlink Telegram
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;