import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";
import { getAvailableForms, submitForm } from "./formsApi";
import {
  BookOpen,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Send,
} from "lucide-react";
import { richTextToPlainText } from "./richTextUtils";

const FormsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadForms = async () => {
      try {
        setLoading(true);
        const response = await getAvailableForms();
        setForms(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load available forms. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  useEffect(() => {
    if (!selectedForm) return;
    const initial = {};
    selectedForm.fields?.forEach((field) => {
      initial[field.key] = field.type === "checkbox" ? false : "";
    });
    setValues(initial);
  }, [selectedForm]);

  const handleSelectForm = (form) => {
    setSelectedForm(form);
    setSuccessMessage("");
    setError("");
  };

  const handleInputChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedForm) return;

    try {
      setSubmitting(true);
      setError("");
      const response = await submitForm(selectedForm._id, { values });
      setSuccessMessage("Form submitted successfully.");
      toast.success("Form submitted successfully");
      setValues(
        selectedForm.fields.reduce((acc, field) => {
          acc[field.key] = field.type === "checkbox" ? false : "";
          return acc;
        }, {}),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit form. Please check your fields and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-6 ${theme.text}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-lg">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Forms & Surveys</h1>
                <p className={theme.textSecondary}>
                  Complete dashboard forms created by admin.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-2xl border border-green-200 bg-white bg-opacity-80 px-5 py-3 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              <ArrowRight size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
          <div
            className={`${theme.card} border ${theme.border} rounded-3xl p-5 space-y-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Available Forms</h2>
                <p className={theme.textSecondary}>
                  Select a form to fill out.
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                {forms.length}
              </span>
            </div>
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Loading forms…
              </div>
            ) : forms.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No forms available yet.
              </div>
            ) : (
              <div className="space-y-3">
                {forms.map((form) => (
                  <button
                    key={form._id}
                    type="button"
                    onClick={() => handleSelectForm(form)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                      selectedForm?._id === form._id
                        ? "border-green-500 bg-green-50"
                        : `${theme.card} ${theme.border}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          {form.title}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {form.description
                            ? richTextToPlainText(form.description) || "No description"
                            : "No description"}
                        </p>
                      </div>
                      <ExternalLink size={18} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {form.externalLink ? "External form" : "Built-in form"}
                      <span>•</span>
                      <span>{form.roleVisibility.join(", ")}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`${theme.card} border ${theme.border} rounded-3xl p-6`}
          >
            {!selectedForm ? (
              <div className="text-center py-20">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50 text-green-600">
                  <CheckCircle size={28} />
                </div>
                <h2 className="text-xl font-semibold">Choose a form</h2>
                <p className={theme.textSecondary}>
                  Select a form from the list to review or submit.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-950/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {selectedForm.title}
                      </h2>
                      <p className={`mt-2 text-sm ${theme.textSecondary}`}>
                        {selectedForm.description
                          ? richTextToPlainText(selectedForm.description) ||
                            "Fill out the fields below."
                          : "Fill out the fields below."}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                      <div>{selectedForm.active ? "Live" : "Inactive"}</div>
                      <div>{selectedForm.roleVisibility.join(", ")}</div>
                    </div>
                  </div>
                  {selectedForm.publicSlug && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
                      <span>Public link:</span>
                      <a
                        href={`${window.location.origin}/forms/${selectedForm.publicSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-green-700 hover:text-green-900 dark:text-green-300"
                      >
                        {`${window.location.origin}/forms/${selectedForm.publicSlug}`}
                      </a>
                    </div>
                  )}
                </div>

                {selectedForm.externalLink ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    <p className="mb-4 text-lg font-semibold">External form</p>
                    <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                      This form is managed externally and can be opened using
                      the link below.
                    </p>
                    <a
                      href={selectedForm.externalLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-700"
                    >
                      Open external form
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {selectedForm.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-sm font-medium">
                            {field.label}
                          </label>
                          {field.required && (
                            <span className="text-xs font-semibold uppercase tracking-wider text-red-500">
                              Required
                            </span>
                          )}
                        </div>

                        {field.type === "textarea" ? (
                          <textarea
                            rows={4}
                            value={values[field.key] || ""}
                            onChange={(event) =>
                              handleInputChange(field.key, event.target.value)
                            }
                            placeholder={
                              field.placeholder || "Type your answer..."
                            }
                            className={`${theme.input} w-full min-h-30 rounded-3xl border ${theme.border} p-4 resize-none`}
                          />
                        ) : field.type === "select" ? (
                          <select
                            value={values[field.key] || ""}
                            onChange={(event) =>
                              handleInputChange(field.key, event.target.value)
                            }
                            className={`${theme.input} w-full rounded-3xl border ${theme.border} px-4 py-3`}
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "checkbox" ? (
                          <label
                            className={`inline-flex items-center gap-3 rounded-3xl border ${theme.border} px-4 py-4 w-full`}
                          >
                            <input
                              type="checkbox"
                              checked={values[field.key] || false}
                              onChange={(event) =>
                                handleInputChange(
                                  field.key,
                                  event.target.checked,
                                )
                              }
                              className="h-5 w-5 rounded border-gray-300 text-green-600"
                            />
                            <span>{field.placeholder || "Check to agree"}</span>
                          </label>
                        ) : (
                          <input
                            type={field.type}
                            value={values[field.key] || ""}
                            onChange={(event) =>
                              handleInputChange(field.key, event.target.value)
                            }
                            placeholder={
                              field.placeholder || "Enter your answer..."
                            }
                            className={`${theme.input} w-full rounded-3xl border ${theme.border} px-4 py-4`}
                          />
                        )}
                        {field.helpText && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {field.helpText}
                          </p>
                        )}
                      </div>
                    ))}

                    {error && (
                      <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className="rounded-3xl bg-green-50 p-4 text-sm text-green-700">
                        {successMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-3xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Send size={16} />
                      {submitting ? "Submitting..." : "Submit Form"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormsPage;
