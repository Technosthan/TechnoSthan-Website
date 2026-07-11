import { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";
import { useSettings } from "../../contexts/SettingsContext";
import {
  getPublicFormBySlug,
  sendPublicFormVerificationOtp,
  submitPublicForm,
  verifyPublicFormVerificationOtp,
} from "./formsApi";
import {
  CheckCircle2,
  Upload,
  Send,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { getOptimizedImageUrl } from "../../shared/lib/assetUrl";
import { normalizeHttpUrl } from "../../shared/lib/url";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const EXPIRY_COPY = {
  en: {
    headline: "This form is no longer accepting responses.",
    label: "Form expired on:",
  },
  hi: {
    headline:
      "\u092f\u0939 \u092b\u093c\u0949\u0930\u094d\u092e \u0905\u092c \u092a\u094d\u0930\u0924\u093f\u0915\u094d\u0930\u093f\u092f\u093e\u090f\u0901 \u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0930\u0939\u093e \u0939\u0948\u0964",
    label:
      "\u092b\u093c\u0949\u0930\u094d\u092e \u0938\u092e\u093e\u092a\u094d\u0924 \u0939\u0941\u0906:",
  },
  rj: {
    headline:
      "\u0908 \u092b\u0949\u0930\u094d\u092e \u0905\u092c \u091c\u0935\u093e\u092c \u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0915\u094b\u0928\u0940 \u0915\u0930\u0948\u0964",
    label:
      "\u092b\u0949\u0930\u094d\u092e \u0916\u0924\u094d\u092e \u092d\u094d\u092f\u094b:",
  },
};

const initialValuesFromQuestions = (questions = []) =>
  questions.reduce((acc, question) => {
    if (question.type === "checkbox") {
      acc[question._id] = [];
    } else if (question.type === "rating") {
      acc[question._id] = 0;
    } else {
      acc[question._id] = "";
    }
    return acc;
  }, {});

const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const validatePhone = (value) =>
  /^[6-9]\d{9}$/.test(String(value || "").trim());

const getNumberValidationMessage = (question, value) => {
  const validation = question?.validation || {};
  const customMessage =
    String(validation.errorMessage || "").trim() ||
    `Question "${question.label}" must be a valid number`;
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) return null;
  if (!/^-?\d+$/.test(normalizedValue)) return customMessage;

  const digitCount = normalizedValue.replace(/^-/, "").length;
  const numericValue = Number(normalizedValue);

  if (
    Number.isFinite(validation.minValue) &&
    numericValue < validation.minValue
  ) {
    return customMessage;
  }

  if (
    Number.isFinite(validation.maxValue) &&
    numericValue > validation.maxValue
  ) {
    return customMessage;
  }

  if (
    Number.isInteger(validation.minDigits) &&
    digitCount < validation.minDigits
  ) {
    return customMessage;
  }

  if (
    Number.isInteger(validation.maxDigits) &&
    digitCount > validation.maxDigits
  ) {
    return customMessage;
  }

  return null;
};

const sanitizeNumberInput = (value = "") =>
  String(value)
    .replace(/[^\d-]/g, "")
    .replace(/(?!^)-/g, "");

const sanitizePhoneInput = (value = "") =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

const isVerificationSupported = (question) =>
  question?.validationEnabled === true &&
  ["email", "phone"].includes(question?.type);

const formatDateTime = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString();
};

const getExpiryCopy = (language = "en") =>
  EXPIRY_COPY[language] || EXPIRY_COPY.en;

const validateSelectedFile = (questionType, file) => {
  if (!file) return null;

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return "Maximum file size allowed is 5 MB.";
  }

  if (questionType === "imageUpload" && !IMAGE_MIME_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  if (questionType === "fileUpload" && !FILE_MIME_TYPES.includes(file.type)) {
    return "Only PDF, DOC, DOCX, MP4, WEBM, MOV, JPG, JPEG, PNG, and WEBP files are allowed.";
  }

  return null;
};

const getSuccessMessage = (form = {}, submitted = null) =>
  String(submitted?.successMessage || form?.successMessage || "").trim() ||
  "Form submitted successfully.";

const getDefaultLinkPlaceholder = (question) =>
  String(question?.placeholder || "").trim() || "https://example.com";

const getVerificationStatus = (state = {}) => state.status || "idle";

const PublicFormPage = () => {
  const { slug } = useParams();
  const { theme, appSettings } = useTheme();
  const { loading: settingsLoading, settings: websiteSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [verificationTokens, setVerificationTokens] = useState({});
  const [verificationState, setVerificationState] = useState({});
  const [otpValues, setOtpValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [now, setNow] = useState(Date.now());
  const submitLockRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const loadForm = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPublicFormBySlug(slug);
        if (!mounted) return;
        const nextForm = response.data?.data;
        setForm(nextForm);
        setValues(initialValuesFromQuestions(nextForm?.questions || []));
        setVerificationTokens({});
        setVerificationState({});
        setOtpValues({});
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || "Form not found.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadForm();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const resetVerificationForQuestion = (questionId) => {
    setVerificationTokens((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setOtpValues((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setVerificationState((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      next[questionId] = { status: "idle", otp: "", verifiedAt: null };
      return next;
    });
  };

  const handleAnswer = (questionId, value, question = null) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
    if (isVerificationSupported(question)) {
      resetVerificationForQuestion(questionId);
    }
  };

  const handleCheckbox = (questionId, option) => {
    setValues((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  };

  const handleFile = (question, fileList) => {
    const file = fileList?.[0] || null;
    if (!file) {
      setFiles((prev) => ({ ...prev, [question._id]: null }));
      return;
    }

    const validationMessage = validateSelectedFile(question.type, file);
    if (validationMessage) {
      setError(validationMessage);
      toast.error(validationMessage);
      setFiles((prev) => ({ ...prev, [question._id]: null }));
      return;
    }

    setError("");
    setFiles((prev) => ({ ...prev, [question._id]: file }));
  };

  const togglePasswordVisibility = (questionId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const updateVerificationState = (questionId, nextState) => {
    setVerificationState((prev) => ({
      ...prev,
      [questionId]:
        typeof nextState === "function"
          ? nextState(prev[questionId] || {})
          : nextState,
    }));
  };

  const requestVerificationOtp = async (question) => {
    const currentValue = String(values[question._id] || "").trim();
    if (question.type === "email" && !validateEmail(currentValue)) {
      throw new Error("Please enter a valid email address.");
    }
    if (question.type === "phone" && !validatePhone(currentValue)) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }

    updateVerificationState(question._id, {
      status: "sending",
      otp: otpValues[question._id] || "",
      verifiedAt: null,
      resendAvailableAt: null,
      message: "",
    });

    const response = await sendPublicFormVerificationOtp(form.slug, {
      questionId: question._id,
      value: currentValue,
      challengeType: question.type,
    });

    updateVerificationState(question._id, {
      status: "otp_sent",
      otp: "",
      verifiedAt: null,
      resendAvailableAt: response.data?.data?.resendAvailableAt || null,
      message: response.data?.data?.message || "OTP sent.",
    });
    setOtpValues((prev) => ({ ...prev, [question._id]: "" }));
    toast.success(response.data?.data?.message || "OTP sent.");
  };

  const verifyQuestionOtp = async (question) => {
    const otp = String(otpValues[question._id] || "").trim();
    if (!otp) {
      throw new Error("Please enter the OTP sent to you.");
    }

    updateVerificationState(question._id, {
      status: "verifying",
      otp,
      verifiedAt: null,
      message: "",
    });

    const response = await verifyPublicFormVerificationOtp(form.slug, {
      questionId: question._id,
      value: values[question._id],
      otp,
      challengeType: question.type,
    });

    const token = response.data?.data?.verificationToken || "";
    if (token) {
      setVerificationTokens((prev) => ({ ...prev, [question._id]: token }));
    }
    updateVerificationState(question._id, {
      status: "verified",
      otp: "",
      verifiedAt: response.data?.data?.verifiedAt || new Date().toISOString(),
      message: response.data?.data?.message || "Verified",
    });
    toast.success(response.data?.data?.message || "Verified");
  };

  const getPreparedAnswerValue = (question, value) => {
    if (question.type === "link") {
      return normalizeHttpUrl(value);
    }
    return value;
  };

  const renderVerificationUI = (question) => {
    if (!isVerificationSupported(question)) return null;

    const state = verificationState[question._id] || { status: "idle" };
    const status = getVerificationStatus(state);
    const isVerified = status === "verified";
    const isBusy = status === "sending" || status === "verifying";
    const showOtpRow = status === "otp_sent" || status === "verifying" || isVerified;

    return (
      <div className="mt-3 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <button
            type="button"
            disabled={isBusy || isVerified}
            onClick={async () => {
              try {
                await requestVerificationOtp(question);
              } catch (err) {
                const message =
                  err.response?.data?.message || err.message || "Failed to send OTP";
                toast.error(message);
                setError(message);
                updateVerificationState(question._id, {
                  status: "idle",
                  otp: "",
                  verifiedAt: null,
                  message,
                });
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-44"
          >
            {status === "sending" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isVerified ? (
              <ShieldCheck size={16} />
            ) : (
              <Send size={16} />
            )}
            {status === "sending"
              ? "Sending OTP..."
              : isVerified
                ? "Verified"
                : status === "otp_sent"
                  ? "Resend OTP"
                  : "Verify Now"}
          </button>

          {showOtpRow && !isVerified && (
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpValues[question._id] || ""}
                onChange={(e) =>
                  setOtpValues((prev) => ({
                    ...prev,
                    [question._id]: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                placeholder="Enter OTP"
                className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`}
              />
              <button
                type="button"
                disabled={status === "verifying"}
                onClick={async () => {
                  try {
                    await verifyQuestionOtp(question);
                  } catch (err) {
                    const message =
                      err.response?.data?.message ||
                      err.message ||
                      "Failed to verify OTP";
                    toast.error(message);
                    setError(message);
                    updateVerificationState(question._id, {
                      ...state,
                      status: "otp_sent",
                      message,
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-36"
              >
                {status === "verifying" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {status === "verifying" ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}
        </div>

        {isVerified && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            <ShieldCheck size={14} />
            Verified
          </div>
        )}

        {status === "otp_sent" && (
          <p className="text-xs text-slate-300">
            Enter the OTP we sent to the verified contact.
          </p>
        )}
      </div>
    );
  };

  const renderQuestion = (question) => {
    const commonProps = {
      className: `${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3`,
    };

    if (question.type === "sectionHeading") {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-2xl font-bold">{question.label}</h2>
          {question.helpText && (
            <p className={`mt-2 text-sm ${theme.textSecondary}`}>
              {question.helpText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <label className="text-base font-semibold">
            {question.label}
            {question.required && <span className="ml-1 text-red-400">*</span>}
          </label>
        </div>

        {question.type === "paragraph" || question.type === "address" ? (
          <textarea
            rows={4}
            value={values[question._id] || ""}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            placeholder={question.placeholder}
            {...commonProps}
            className={`${commonProps.className} resize-none`}
          />
        ) : question.type === "dropdown" ? (
          <select
            value={values[question._id] || ""}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            {...commonProps}
          >
            <option value="">Select an option</option>
            {(question.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : question.type === "radio" ? (
          <div className="space-y-2">
            {(question.options || []).map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3"
              >
                <input
                  type="radio"
                  name={question._id}
                  checked={values[question._id] === option}
                  onChange={() => handleAnswer(question._id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        ) : question.type === "checkbox" ? (
          <div className="space-y-2">
            {(question.options || []).map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={(values[question._id] || []).includes(option)}
                  onChange={() => handleCheckbox(question._id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        ) : question.type === "fileUpload" ||
          question.type === "imageUpload" ? (
          <div className="space-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">
              <Upload size={16} />
              <input
                type="file"
                hidden
                disabled={!form?.allowFileUpload}
                accept={
                  question.type === "imageUpload"
                    ? IMAGE_MIME_TYPES.join(",")
                    : FILE_MIME_TYPES.join(",")
                }
                onChange={(e) => handleFile(question, e.target.files)}
              />
              {form?.allowFileUpload
                ? files[question._id]?.name || "Choose file"
                : "Uploads disabled"}
            </label>
            {files[question._id] && (
              <p className="text-xs text-slate-400">
                Selected: {files[question._id].name}
              </p>
            )}
            {!form?.allowFileUpload && (
              <p className="text-xs text-amber-300">
                File uploads are currently disabled for this form.
              </p>
            )}
          </div>
        ) : question.type === "rating" ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswer(question._id, rating)}
                className={`h-11 w-11 rounded-2xl border ${
                  values[question._id] === rating
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        ) : question.type === "link" ? (
          <input
            type="url"
            autoComplete="url"
            value={values[question._id] || ""}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            placeholder={getDefaultLinkPlaceholder(question)}
            {...commonProps}
          />
        ) : question.type === "password" ? (
          <div className="relative">
            <input
              type={visiblePasswords[question._id] ? "text" : "password"}
              autoComplete="new-password"
              value={values[question._id] || ""}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
              placeholder={question.placeholder || "Enter secret"}
              {...commonProps}
              className={`${commonProps.className} pr-12`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(question._id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-300 transition hover:bg-white/10"
              aria-label={
                visiblePasswords[question._id]
                  ? "Hide secret"
                  : "Show secret"
              }
            >
              {visiblePasswords[question._id] ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type={
                question.type === "email"
                  ? "email"
                  : question.type === "phone"
                    ? "tel"
                    : question.type === "number"
                      ? "number"
                      : question.type === "date"
                        ? "date"
                        : "text"
              }
              step={question.type === "number" ? "1" : undefined}
              inputMode={
                question.type === "number" || question.type === "phone"
                  ? "numeric"
                  : undefined
              }
              pattern={question.type === "phone" ? "[0-9]*" : undefined}
              maxLength={question.type === "phone" ? 10 : undefined}
              autoComplete={
                question.type === "email"
                  ? "email"
                  : question.type === "phone"
                    ? "tel"
                    : undefined
              }
              min={
                question.type === "number" &&
                Number.isFinite(question.validation?.minValue)
                  ? question.validation.minValue
                  : undefined
              }
              max={
                question.type === "number" &&
                Number.isFinite(question.validation?.maxValue)
                  ? question.validation.maxValue
                  : undefined
              }
              value={values[question._id] || ""}
              onChange={(e) =>
                handleAnswer(
                  question._id,
                  question.type === "number"
                    ? sanitizeNumberInput(e.target.value)
                    : question.type === "phone"
                      ? sanitizePhoneInput(e.target.value)
                    : getPreparedAnswerValue(question, e.target.value),
                  question,
                )
              }
              onPaste={
                question.type === "phone"
                  ? (e) => {
                      e.preventDefault();
                      const pastedText =
                        sanitizePhoneInput(e.clipboardData?.getData("text") || "");
                      const input = e.currentTarget;
                      const start = input.selectionStart ?? input.value.length;
                      const end = input.selectionEnd ?? input.value.length;
                      const nextValue = sanitizePhoneInput(
                        `${input.value.slice(0, start)}${pastedText}${input.value.slice(end)}`,
                      );
                      handleAnswer(question._id, nextValue, question);
                    }
                  : undefined
              }
              placeholder={
                question.type === "date"
                  ? undefined
                  : question.placeholder ||
                    (question.type === "link" ? "https://example.com" : undefined)
              }
              {...commonProps}
            />
            {renderVerificationUI(question)}
          </div>
        )}

        {question.helpText && (
          <p className="text-xs text-slate-400">{question.helpText}</p>
        )}
      </div>
    );
  };

  const prepareSubmissionValues = () => {
    const normalizedValues = { ...values };
    const normalizedVerificationTokens = {};

    for (const question of form?.questions || []) {
      if (question.type === "sectionHeading") continue;
      const value = values[question._id];
      const file = files[question._id];
      const normalizedLinkValue =
        question.type === "link" ? normalizeHttpUrl(value) : value;
      const empty =
        normalizedLinkValue === undefined ||
        normalizedLinkValue === null ||
        normalizedLinkValue === "" ||
        (Array.isArray(normalizedLinkValue) && normalizedLinkValue.length === 0);

      if (question.required && empty && !file) {
        throw new Error(`${question.label} is required`);
      }

      if (question.type === "email" && value && !validateEmail(value)) {
        throw new Error(`${question.label} must be a valid email`);
      }
      if (question.type === "phone" && value && !validatePhone(value)) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }
      if (question.type === "number") {
        const validationMessage = getNumberValidationMessage(question, value);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }

      if (question.type === "link" && value) {
        if (!normalizedLinkValue) {
          throw new Error("Please enter a valid link.");
        }
        normalizedValues[question._id] = normalizedLinkValue;
      }

      if (isVerificationSupported(question) && !empty) {
        const token = verificationTokens[question._id];
        if (!token) {
          throw new Error(
            `Please verify ${question.label} before submitting.`,
          );
        }
        normalizedVerificationTokens[question._id] = token;
      }

      if (file) {
        const validationMessage = validateSelectedFile(question.type, file);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }
    }

    return {
      answers: normalizedValues,
      verificationTokens: normalizedVerificationTokens,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form || submitLockRef.current || submitting || submitted) return;

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const { answers: normalizedValues, verificationTokens: tokens } =
        prepareSubmissionValues();
      setError("");
      const payload = new FormData();
      payload.append("answers", JSON.stringify(normalizedValues));
      if (Object.keys(tokens).length) {
        payload.append("verificationTokens", JSON.stringify(tokens));
      }
      Object.entries(files).forEach(([questionId, file]) => {
        if (file) {
          payload.append(questionId, file);
        }
      });

      const response = await submitPublicForm(form.slug, payload);
      setSubmitted(response.data?.data || response.data);
      setValues(initialValuesFromQuestions(form.questions || []));
      setFiles({});
      setVerificationTokens({});
      setVerificationState({});
      setOtpValues({});
      setSubmitting(false);
      toast.success(
        getSuccessMessage(form, response.data?.data || response.data),
      );
    } catch (err) {
      const status = err.response?.status;
      const responseMessage = err.response?.data?.message || "";
      const duplicateMessage = "You have already filled this form.";
      const validationMessage =
        responseMessage || err.message || "Failed to submit form";
      const serverMessage = "Something went wrong. Please try again.";
      const isClientValidationError =
        !status && err.message && !/Network Error/i.test(err.message);
      const nextMessage =
        status === 409
          ? duplicateMessage
          : status && status < 500
            ? validationMessage
            : isClientValidationError
              ? validationMessage
              : serverMessage;

      setError(nextMessage);
      toast.error(nextMessage);
      setSubmitting(false);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const loadingState = loading || settingsLoading;
  const language = websiteSettings?.websiteLanguage || "en";
  const expiryCopy = getExpiryCopy(language);
  const expiresAt = form?.expiresAt ? new Date(form.expiresAt) : null;
  const isExpired =
    Boolean(form?.isExpired) ||
    Boolean(
      expiresAt &&
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt.getTime() < now,
    );

  if (loadingState) {
    return (
      <div className={`min-h-screen ${theme.bgGradient} ${theme.text} p-6`}>
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-20 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-64 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-64 animate-pulse rounded-3xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className={`min-h-screen ${theme.bgGradient} ${theme.text} p-6`}>
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-green-300"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <h1 className="text-3xl font-black">Form unavailable</h1>
          <p className={theme.textSecondary}>{error}</p>
        </div>
      </div>
    );
  }

  if (!form) return <Navigate to="/" replace />;

  if (isExpired) {
    return (
      <div className={`min-h-screen ${theme.bgGradient} ${theme.text}`}>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-green-300"
            >
              <ArrowLeft size={16} /> Home
            </Link>
          </div>

          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8">
            <h1 className="text-3xl font-black">{expiryCopy.headline}</h1>
            {expiresAt && !Number.isNaN(expiresAt.getTime()) && (
              <p className="mt-3 text-sm text-slate-300">
                {expiryCopy.label}{" "}
                <span className="font-semibold">
                  {formatDateTime(expiresAt)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bgGradient} ${theme.text}`}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-green-300"
          >
            <ArrowLeft size={16} /> Home
          </Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          {form.bannerImageUrl && (
            <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
              <img
                src={getOptimizedImageUrl(form.bannerImageAsset || form.bannerImageUrl)}
                alt={form.title ? `${form.title} banner` : "Form banner"}
                className="h-52 w-full object-cover sm:h-64"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            {appSettings.logoUrl ? (
              <img
                src={getOptimizedImageUrl(appSettings.logoUrl)}
                alt={appSettings.appName}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white">
                <CheckCircle2 size={28} />
              </div>
            )}
            <div>
              <h1 className="mt-1 text-4xl font-black">{form.title}</h1>
              {form.description && (
                <p className={`mt-2 max-w-2xl ${theme.textSecondary}`}>
                  {form.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-[2rem] border border-green-500/20 bg-green-500/10 p-8">
            <CheckCircle2 className="mb-4 text-green-300" size={36} />
            <h2 className="text-3xl font-black">
              {getSuccessMessage(form, submitted)}
            </h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {form.questions?.map((question) => (
              <div key={question._id}>{renderQuestion(question)}</div>
            ))}

            {error && (
              <div className="rounded-3xl bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-4 text-sm font-semibold text-white shadow-2xl disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Response"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PublicFormPage;
