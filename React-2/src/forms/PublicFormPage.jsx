import { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";
import {
  DEFAULT_DESCRIPTION_STYLE,
  DEFAULT_TITLE_STYLE,
  normalizeTypographyStyle,
  resolveTypographyStyle,
} from "./formTypography";
import { sanitizeRichTextHtml } from "./richTextUtils";

import {
  getPublicFormBySlug,
  sendPublicFormVerification,
  verifyPublicFormVerification,
  sendPublicPhoneVerification,
  verifyPublicPhoneVerification,
  submitPublicForm,
} from "./formsApi";
import { CheckCircle2, Upload, Send, ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck, RefreshCcw } from "lucide-react";
import { getOptimizedImageUrl } from "../shared/lib/assetUrl";
import { normalizeHttpUrl } from "./formUtils";

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
  /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(String(value || "").trim());

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
  String(value).replace(/\D/g, "").slice(0, 10);

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

const PublicFormPage = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const { loading: settingsLoading, settings: websiteSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [verificationStates, setVerificationStates] = useState({});
  const [verificationTokens, setVerificationTokens] = useState({});
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
        setVisiblePasswords({});
        setVerificationStates({});
        setVerificationTokens({});
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
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const handleAnswer = (questionId, value) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
  };

  const resetVerification = (questionId) => {
    setVerificationStates((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setVerificationTokens((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleVerifiedInputChange = (question, value, sanitizer = (input) => input) => {
    const nextValue = sanitizer(value);
    handleAnswer(question._id, nextValue);
    const currentVerification = verificationStates[question._id];
    if (currentVerification?.destination && currentVerification.destination !== String(nextValue || "").trim()) {
      resetVerification(question._id);
    }
  };

  const togglePasswordVisibility = (questionId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const sendVerificationCode = async (question) => {
    const destination = String(values[question._id] || "").trim();
    if (!destination) {
      toast.error(
        question.type === "email"
          ? "Please enter a valid email."
          : "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    try {
      setVerificationStates((prev) => ({
        ...prev,
        [question._id]: {
          ...(prev[question._id] || {}),
          status: "sending",
          destination,
        },
      }));

      const payload = {
        questionId: question._id,
        destination,
        type: question.type,
      };
      const response =
        question.type === "email"
          ? await sendPublicFormVerification(form.slug, payload)
          : await sendPublicPhoneVerification(form.slug, payload);

      setVerificationStates((prev) => ({
        ...prev,
        [question._id]: {
          ...(prev[question._id] || {}),
          status: "otp",
          destination,
          resendAvailableAt: response.data?.data?.resendAvailableAt || null,
        },
      }));
      toast.success("Verification code sent");
    } catch (error) {
      setVerificationStates((prev) => ({
        ...prev,
        [question._id]: {
          ...(prev[question._id] || {}),
          status: "idle",
          destination,
        },
      }));
      toast.error(error.response?.data?.message || error.message || "Failed to send verification code");
    }
  };

  const verifyOtp = async (question) => {
    const state = verificationStates[question._id] || {};
    const destination = String(values[question._id] || "").trim();
    if (!state.otp) {
      toast.error("Enter the OTP first.");
      return;
    }

    try {
      setVerificationStates((prev) => ({
        ...prev,
        [question._id]: {
          ...state,
          status: "verifying",
        },
      }));

      const payload = {
        questionId: question._id,
        destination,
        type: question.type,
        otp: state.otp,
      };
      const response =
        question.type === "email"
          ? await verifyPublicFormVerification(form.slug, payload)
          : await verifyPublicPhoneVerification(form.slug, payload);

      const token = response.data?.data?.token || "";
      setVerificationTokens((prev) => ({
        ...prev,
        [question._id]: token,
      }));
      setVerificationStates((prev) => ({
        ...prev,
        [question._id]: {
          ...state,
          status: "verified",
          destination,
          verifiedAt: response.data?.data?.verifiedAt || new Date().toISOString(),
        },
      }));
      toast.success("Verified");
    } catch (error) {
      setVerificationStates((prev) => ({
        ...prev,
        [question._id]: {
          ...state,
          status: "otp",
          destination,
        },
      }));
      toast.error(error.response?.data?.message || error.message || "OTP verification failed");
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

  const handlePhonePaste = (questionId, event) => {
    event.preventDefault();
    const pasted = event.clipboardData?.getData("text") || "";
    handleAnswer(questionId, sanitizePhoneInput(pasted));
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
                    ? "border-cyan-500 bg-cyan-500 text-white"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        ) : question.type === "password" ? (
          <div className="relative">
            <input
              type={visiblePasswords[question._id] ? "text" : "password"}
              autoComplete="new-password"
              spellCheck={false}
              value={values[question._id] || ""}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
              placeholder={question.placeholder}
              {...commonProps}
              className={`${commonProps.className} pr-12`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(question._id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-300"
              aria-label={visiblePasswords[question._id] ? "Hide secret" : "Show secret"}
            >
              {visiblePasswords[question._id] ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        ) : question.type === "email" || question.type === "phone" ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type={question.type === "phone" ? "tel" : "email"}
                inputMode={question.type === "phone" ? "numeric" : undefined}
                pattern={question.type === "phone" ? "[0-9]*" : undefined}
                maxLength={question.type === "phone" ? 10 : undefined}
                autoComplete={question.type === "phone" ? "tel" : "email"}
                value={values[question._id] || ""}
                onChange={(e) =>
                  handleVerifiedInputChange(
                    question,
                    e.target.value,
                    question.type === "phone" ? sanitizePhoneInput : (input) => input,
                  )
                }
                placeholder={question.placeholder}
                {...commonProps}
                className={`${commonProps.className} sm:flex-1`}
              />
              {question.validationEnabled === true ? (
                <button
                  type="button"
                  onClick={() => {
                    const current = values[question._id] || "";
                    if (question.type === "email" && !validateEmail(current)) {
                      toast.error("Please enter a valid email.");
                      return;
                    }
                    if (question.type === "phone" && !validatePhone(current)) {
                      toast.error("Please enter a valid 10-digit mobile number.");
                      return;
                    }
                    if ((verificationStates[question._id]?.status || "idle") === "verified") {
                      resetVerification(question._id);
                    } else {
                      sendVerificationCode(question);
                    }
                  }}
                  disabled={(verificationStates[question._id]?.status || "idle") === "sending"}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:opacity-60 sm:w-40"
                >
                  {(verificationStates[question._id]?.status || "idle") === "sending" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending OTP...
                    </>
                  ) : (verificationStates[question._id]?.status || "idle") === "verified" ? (
                    <>
                      <ShieldCheck size={16} /> Verified
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Verify Now
                    </>
                  )}
                </button>
              ) : null}
            </div>

            {question.validationEnabled === true &&
              (verificationStates[question._id]?.status || "idle") === "otp" && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={verificationStates[question._id]?.otp || ""}
                    onChange={(e) =>
                      setVerificationStates((prev) => ({
                        ...prev,
                        [question._id]: {
                          ...(prev[question._id] || {}),
                          otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                          status: "otp",
                        },
                      }))
                    }
                    placeholder="Enter OTP"
                    className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-3 sm:flex-1`}
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => verifyOtp(question)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white sm:w-40"
                  >
                    <ShieldCheck size={16} /> Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => sendVerificationCode(question)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold sm:w-40"
                  >
                    <RefreshCcw size={16} /> Resend OTP
                  </button>
                </div>
              )}

            {question.validationEnabled === true &&
              (verificationStates[question._id]?.status || "idle") === "verified" && (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 size={14} /> Verified
                </div>
              )}
          </div>
        ) : (
          <input
            type={
              question.type === "email"
                ? "email"
                : question.type === "phone"
                  ? "tel"
                  : question.type === "link"
                    ? "url"
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
                  : e.target.value,
              )
            }
            onPaste={
              question.type === "phone"
                ? (e) => handlePhonePaste(question._id, e)
                : undefined
            }
            placeholder={
              question.type === "date"
                ? undefined
                : question.type === "link"
                  ? question.placeholder || "https://example.com"
                  : question.placeholder
            }
            onBlur={
              question.type === "link"
                ? (e) => {
                    const normalized = normalizeHttpUrl(e.target.value);
                    if (normalized) {
                      handleAnswer(question._id, normalized);
                    }
                  }
                : undefined
            }
            {...commonProps}
          />
        )}

        {question.helpText && (
          <p className="text-xs text-slate-400">{question.helpText}</p>
        )}
      </div>
    );
  };

  const validate = () => {
    for (const question of form?.questions || []) {
      if (question.type === "sectionHeading") continue;
      const value = values[question._id];
      const file = files[question._id];
      const empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (question.required && empty && !file) {
        throw new Error(`${question.label} is required`);
      }

      if (question.type === "email" && value && !validateEmail(value)) {
        throw new Error(`${question.label} must be a valid email`);
      }
      if (question.type === "phone" && value && !validatePhone(value)) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }
      if (
        question.validationEnabled === true &&
        (question.type === "email" || question.type === "phone") &&
        !verificationTokens[question._id]
      ) {
        throw new Error(`Please verify ${question.label} before submitting.`);
      }
      if (question.type === "number") {
        const validationMessage = getNumberValidationMessage(question, value);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }
      if (question.type === "link" && value) {
        const normalized = normalizeHttpUrl(value);
        if (!normalized) {
          throw new Error("Please enter a valid link.");
        }
      }

      if (file) {
        const validationMessage = validateSelectedFile(question.type, file);
        if (validationMessage) {
          throw new Error(validationMessage);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form || submitLockRef.current || submitting || submitted) return;

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      validate();
      setError("");
      const payload = new FormData();
      payload.append("answers", JSON.stringify(values));
      payload.append("verificationTokens", JSON.stringify(verificationTokens));
      Object.entries(files).forEach(([questionId, file]) => {
        if (file) {
          payload.append(questionId, file);
        }
      });

      const response = await submitPublicForm(form.slug, payload);
      setSubmitted(response.data?.data || response.data);
      setValues(initialValuesFromQuestions(form.questions || []));
      setFiles({});
      setVisiblePasswords({});
      setVerificationStates({});
      setVerificationTokens({});
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
  const titleStyle = resolveTypographyStyle(form?.titleStyle, DEFAULT_TITLE_STYLE);
  const descriptionStyle = normalizeTypographyStyle(
    form?.descriptionStyle,
    DEFAULT_DESCRIPTION_STYLE,
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
            className="inline-flex items-center gap-2 text-sm text-cyan-300"
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
              className="inline-flex items-center gap-2 text-sm text-cyan-300"
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
            className="inline-flex items-center gap-2 text-sm text-cyan-300"
          >
            <ArrowLeft size={16} /> Home
          </Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          {(form.bannerImage || form.bannerImageUrl) && (
            <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 p-3 sm:p-4">
              <img
                src={getOptimizedImageUrl(
                  form.bannerImageAsset || form.bannerImage || form.bannerImageUrl,
                )}
                alt={form.title ? `${form.title} banner` : "Form banner"}
                className="block h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {form.logoUrl ? (
              <img
                src={getOptimizedImageUrl(form.logoAsset || form.logoUrl)}
                alt={form.title ? `${form.title} logo` : "Form logo"}
                className="h-16 w-16 rounded-2xl object-contain bg-white/5 p-2"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                <CheckCircle2 size={28} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1
                className="mt-1 break-words"
                style={titleStyle}
              >
                {form.title}
              </h1>
              {form.description && (
                <div
                  className={`public-form-description mt-2 max-w-3xl break-words ${theme.textSecondary}`}
                  style={{
                    ...descriptionStyle,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichTextHtml(form.description || ""),
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-8">
            <CheckCircle2 className="mb-4 text-cyan-300" size={36} />
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
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-2xl disabled:opacity-60"
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
