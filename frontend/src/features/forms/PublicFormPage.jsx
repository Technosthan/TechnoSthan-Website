import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";
import { useSettings } from "../../contexts/SettingsContext";
import {
  getPublicFormBySlug,
  submitPublicForm,
} from "./formsApi";
import { CheckCircle2, Upload, Send, ArrowLeft } from "lucide-react";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
    headline: "\u092f\u0939 \u092b\u093c\u0949\u0930\u094d\u092e \u0905\u092c \u092a\u094d\u0930\u0924\u093f\u0915\u094d\u0930\u093f\u092f\u093e\u090f\u0901 \u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0930\u0939\u093e \u0939\u0948\u0964",
    label: "\u092b\u093c\u0949\u0930\u094d\u092e \u0938\u092e\u093e\u092a\u094d\u0924 \u0939\u0941\u0906:",
  },
  rj: {
    headline: "\u0908 \u092b\u0949\u0930\u094d\u092e \u0905\u092c \u091c\u0935\u093e\u092c \u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0915\u094b\u0928\u0940 \u0915\u0930\u0948\u0964",
    label: "\u092b\u0949\u0930\u094d\u092e \u0916\u0924\u094d\u092e \u092d\u094d\u092f\u094b:",
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
    return "Only PDF, DOC, DOCX, JPG, JPEG, PNG, and WEBP files are allowed.";
  }

  return null;
};

const PublicFormPage = () => {
  const { slug } = useParams();
  const { theme, appSettings } = useTheme();
  const { loading: settingsLoading, settings: websiteSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);

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

  const handleAnswer = (questionId, value) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
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
        ) : question.type === "fileUpload" || question.type === "imageUpload" ? (
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
        ) : (
          <input
            type={question.type === "email" ? "email" : question.type === "phone" ? "tel" : question.type === "number" ? "number" : "text"}
            value={values[question._id] || ""}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            placeholder={question.placeholder}
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
        throw new Error(
          `${question.label} must be a valid Indian mobile number`,
        );
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
    if (!form) return;

    try {
      validate();
      setSubmitting(true);
      setError("");
      const payload = new FormData();
      payload.append("answers", JSON.stringify(values));
      Object.entries(files).forEach(([questionId, file]) => {
        if (file) {
          payload.append(questionId, file);
        }
      });

      const response = await submitPublicForm(form.slug, payload);
      setSubmitted(response.data?.data || response.data);
      setValues(initialValuesFromQuestions(form.questions || []));
      setFiles({});
      toast.success("Form submitted successfully");
    } catch (err) {
      setError(err.message || err.response?.data?.message || "Failed to submit form");
      toast.error(err.message || err.response?.data?.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const loadingState = loading || settingsLoading;
  const language = websiteSettings?.websiteLanguage || "en";
  const expiryCopy = getExpiryCopy(language);
  const expiresAt = form?.expiresAt ? new Date(form.expiresAt) : null;
  const isExpired =
    Boolean(form?.isExpired) ||
    Boolean(expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now());

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
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-green-300">
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
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-green-300">
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="text-xs text-slate-400">
              {appSettings.appName || "Technosthan AgriTech"}
            </div>
          </div>

          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8">
            <h1 className="text-3xl font-black">{expiryCopy.headline}</h1>
            {expiresAt && !Number.isNaN(expiresAt.getTime()) && (
              <p className="mt-3 text-sm text-slate-300">
                {expiryCopy.label}{" "}
                <span className="font-semibold">{formatDateTime(expiresAt)}</span>
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
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-green-300">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="text-xs text-slate-400">
            {appSettings.appName || "Technosthan AgriTech"}
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            {appSettings.logoUrl ? (
              <img
                src={appSettings.logoUrl}
                alt={appSettings.appName}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white">
                <CheckCircle2 size={28} />
              </div>
            )}
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-green-300">
                Public Form
              </div>
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
            <h2 className="text-3xl font-black">{form.successMessage}</h2>
            <p className="mt-3 text-slate-300">
              Reference ID: <span className="font-semibold">{submitted.referenceId}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
