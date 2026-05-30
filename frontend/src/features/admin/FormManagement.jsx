import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Plus,
  Save,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  ShieldCheck,
  Eye,
} from "lucide-react";
import {
  getAllForms,
  createForm,
  updateForm,
  deleteForm,
  getFormSubmissions,
  updateSubmissionStatus,
} from "./adminApi";

const emptyForm = {
  title: "",
  description: "",
  externalLink: "",
  roleVisibility: ["student"],
  fields: [
    {
      key: "field1",
      label: "Untitled field",
      type: "text",
      required: false,
      options: [],
      placeholder: "",
      helpText: "",
    },
  ],
  publicSlug: "",
  active: true,
};

const fieldTypes = [
  "text",
  "textarea",
  "email",
  "number",
  "select",
  "checkbox",
  "file",
  "date",
];

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
  { value: "student", label: "Student" },
];

const FormManagement = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [builder, setBuilder] = useState(emptyForm);
  const [loadingForms, setLoadingForms] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadForms();
      resetBuilder();
    }
  }, [isOpen]);

  const loadForms = async () => {
    try {
      setLoadingForms(true);
      const response = await getAllForms();
      setForms(response.data.data || []);
    } catch (err) {
      toast.error("Unable to load forms.");
    } finally {
      setLoadingForms(false);
    }
  };

  const resetBuilder = () => {
    setSelectedForm(null);
    setBuilder(emptyForm);
    setSubmissions([]);
    setError("");
  };

  const generatePublicSlug = () => {
    const base = (builder.title || "form")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${base || "form"}-${Math.random().toString(36).slice(2, 8)}`;
    setBuilder((prev) => ({ ...prev, publicSlug: slug }));
  };

  const updateField = (index, field, value) => {
    const updatedFields = [...builder.fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
    };
    setBuilder((prev) => ({ ...prev, fields: updatedFields }));
  };

  const addField = () => {
    setBuilder((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          key: `field${prev.fields.length + 1}`,
          label: "New field",
          type: "text",
          required: false,
          options: [],
          placeholder: "",
          helpText: "",
        },
      ],
    }));
  };

  const removeField = (index) => {
    if (builder.fields.length <= 1) return;
    setBuilder((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, idx) => idx !== index),
    }));
  };

  const selectForm = async (form) => {
    setSelectedForm(form);
    setBuilder({
      title: form.title,
      description: form.description || "",
      externalLink: form.externalLink || "",
      roleVisibility: form.roleVisibility || ["student"],
      fields: form.fields || [],
      publicSlug: form.publicSlug || "",
      active: form.active,
    });
    setError("");
    try {
      const res = await getFormSubmissions(form._id);
      setSubmissions(res.data.data || []);
    } catch (err) {
      toast.error("Unable to load submissions.");
      setSubmissions([]);
    }
  };

  const saveForm = async () => {
    try {
      setSaveLoading(true);
      setError("");
      if (!builder.title.trim()) {
        setError("Form title is required.");
        return;
      }
      const payload = {
        ...builder,
        fields: builder.fields.map((field) => ({
          ...field,
          options: field.options?.filter(Boolean) || [],
        })),
      };
      if (selectedForm) {
        await updateForm(selectedForm._id, payload);
        toast.success("Form updated successfully.");
      } else {
        await createForm(payload);
        toast.success("Form created successfully.");
      }
      await loadForms();
      resetBuilder();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save form.");
    } finally {
      setSaveLoading(false);
    }
  };

  const removeSelectedForm = async () => {
    if (!selectedForm) return;
    if (!window.confirm("Delete this form permanently?")) return;

    try {
      await deleteForm(selectedForm._id);
      toast.success("Form deleted.");
      await loadForms();
      resetBuilder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete form.");
    }
  };

  const updateStatus = async (submissionId, status) => {
    try {
      await updateSubmissionStatus(selectedForm._id, submissionId, status);
      toast.success("Submission status updated.");
      const res = await getFormSubmissions(selectedForm._id);
      setSubmissions(res.data.data || []);
    } catch (err) {
      toast.error("Unable to update status.");
    }
  };

  const visibleFields = useMemo(() => builder.fields || [], [builder.fields]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
    >
      <div className="mx-auto flex max-w-350 flex-col gap-6 rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-green-500 p-3 text-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Form Builder</h2>
                <p className={theme.textSecondary}>
                  Create custom forms, manage role visibility and review
                  submissions.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetBuilder}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              New Form
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <div
            className={`${theme.card} border ${theme.border} rounded-3xl p-5`}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold">Forms</h3>
                <p className={`text-sm ${theme.textSecondary}`}>
                  Manage saved forms and review selected form responses.
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {forms.length}
              </span>
            </div>

            <div className="space-y-3">
              {loadingForms ? (
                <div className="rounded-3xl border border-slate-200 p-5 text-center text-sm text-slate-500 dark:border-slate-800">
                  Loading forms...
                </div>
              ) : forms.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 p-5 text-center text-sm text-slate-500 dark:border-slate-800">
                  No forms yet. Create one to get started.
                </div>
              ) : (
                forms.map((form) => (
                  <button
                    key={form._id}
                    type="button"
                    onClick={() => selectForm(form)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                      selectedForm?._id === form._id
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{form.title}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {form.roleVisibility.join(", ")}
                        </div>
                      </div>
                      <ExternalLink size={16} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div
            className={`${theme.card} border ${theme.border} rounded-3xl p-6`}
          >
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">Form details</h3>
                      <p className={`text-sm ${theme.textSecondary}`}>
                        Add title, roles and fields for the form.
                      </p>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {selectedForm ? "Editing" : "New"}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Title</label>
                      <input
                        value={builder.title}
                        onChange={(e) =>
                          setBuilder((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className={`${theme.input} mt-2 w-full rounded-3xl border ${theme.border} px-4 py-3`}
                        placeholder="Form title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Description
                      </label>
                      <textarea
                        value={builder.description}
                        onChange={(e) =>
                          setBuilder((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        className={`${theme.input} mt-2 w-full rounded-3xl border ${theme.border} px-4 py-3 resize-none`}
                        placeholder="Optional description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        External form link
                      </label>
                      <input
                        value={builder.externalLink}
                        onChange={(e) =>
                          setBuilder((prev) => ({
                            ...prev,
                            externalLink: e.target.value,
                          }))
                        }
                        className={`${theme.input} mt-2 w-full rounded-3xl border ${theme.border} px-4 py-3`}
                        placeholder="https://google.com/forms/..."
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium">
                          Status
                        </label>
                        <select
                          value={builder.active ? "live" : "disabled"}
                          onChange={(e) =>
                            setBuilder((prev) => ({
                              ...prev,
                              active: e.target.value === "live",
                            }))
                          }
                          className={`${theme.input} mt-2 w-full rounded-3xl border ${theme.border} px-4 py-3`}
                        >
                          <option value="live">Live</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium">
                            Public slug
                          </label>
                          <button
                            type="button"
                            onClick={generatePublicSlug}
                            className="text-sm text-green-600 hover:underline"
                          >
                            Generate
                          </button>
                        </div>
                        <input
                          value={builder.publicSlug}
                          onChange={(e) =>
                            setBuilder((prev) => ({
                              ...prev,
                              publicSlug: e.target.value,
                            }))
                          }
                          className={`${theme.input} mt-2 w-full rounded-3xl border ${theme.border} px-4 py-3`}
                          placeholder="Auto-generated when saved"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="text-sm font-semibold">
                        Visible to roles
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {roleOptions.map((role) => (
                          <label
                            key={role.value}
                            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={builder.roleVisibility.includes(
                                role.value,
                              )}
                              onChange={(e) => {
                                setBuilder((prev) => {
                                  const next = prev.roleVisibility.includes(
                                    role.value,
                                  )
                                    ? prev.roleVisibility.filter(
                                        (item) => item !== role.value,
                                      )
                                    : [...prev.roleVisibility, role.value];
                                  return {
                                    ...prev,
                                    roleVisibility: next.length
                                      ? next
                                      : [role.value],
                                  };
                                });
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-green-600"
                            />
                            {role.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Form fields</h3>
                      <p className={`text-sm ${theme.textSecondary}`}>
                        Add fields and define their input type.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addField}
                      className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Plus size={16} /> Add field
                    </button>
                  </div>

                  <div className="space-y-4">
                    {visibleFields.map((field, index) => (
                      <div
                        key={field.key}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold">
                              {field.label}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {field.type} field
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium">
                              Label
                            </label>
                            <input
                              value={field.label}
                              onChange={(e) =>
                                updateField(index, "label", e.target.value)
                              }
                              className={`${theme.input} mt-2 w-full rounded-2xl border ${theme.border} px-3 py-3`}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium">
                              Key
                            </label>
                            <input
                              value={field.key}
                              onChange={(e) =>
                                updateField(index, "key", e.target.value)
                              }
                              className={`${theme.input} mt-2 w-full rounded-2xl border ${theme.border} px-3 py-3`}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium">
                              Type
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) =>
                                updateField(index, "type", e.target.value)
                              }
                              className={`${theme.input} mt-2 w-full rounded-2xl border ${theme.border} px-3 py-3`}
                            >
                              {fieldTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium">
                              Required
                            </label>
                            <select
                              value={field.required ? "yes" : "no"}
                              onChange={(e) =>
                                updateField(
                                  index,
                                  "required",
                                  e.target.value === "yes",
                                )
                              }
                              className={`${theme.input} mt-2 w-full rounded-2xl border ${theme.border} px-3 py-3`}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium">
                              Placeholder
                            </label>
                            <input
                              value={field.placeholder}
                              onChange={(e) =>
                                updateField(
                                  index,
                                  "placeholder",
                                  e.target.value,
                                )
                              }
                              className={`${theme.input} mt-2 w-full rounded-2xl border ${theme.border} px-3 py-3`}
                            />
                          </div>
                        </div>

                        {field.type === "select" && (
                          <div>
                            <label className="block text-sm font-medium">
                              Select options
                            </label>
                            <textarea
                              value={field.options.join("\n")}
                              onChange={(e) =>
                                updateField(
                                  index,
                                  "options",
                                  e.target.value
                                    .split("\n")
                                    .map((item) => item.trim()),
                                )
                              }
                              className={`${theme.input} mt-2 w-full rounded-2xl border ${theme.border} px-3 py-3 resize-none`}
                              rows={3}
                              placeholder="One option per line"
                            />
                          </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium">
                              Help text
                            </label>
                            <input
                              value={field.helpText}
                              onChange={(e) =>
                                updateField(index, "helpText", e.target.value)
                              }
                              className={`${theme.input} mt-2 w-full rounded-2xl border ${theme.border} px-3 py-3`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Submission queue</h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {submissions.length} records
                    </span>
                  </div>

                  {selectedForm && submissions.length > 0 ? (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <div
                          key={submission._id}
                          className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold">
                                {submission.userName || "Anonymous"}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {submission.userEmail ||
                                  submission.role ||
                                  "No contact"}
                              </div>
                            </div>
                            <div className="text-sm rounded-2xl bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              {submission.status}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            {Object.entries(submission.values || {}).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="grid grid-cols-[140px_1fr] gap-3"
                                >
                                  <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {key}
                                  </span>
                                  <span>{String(value)}</span>
                                </div>
                              ),
                            )}
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            {[
                              "pending",
                              "reviewed",
                              "approved",
                              "rejected",
                            ].map((statusOption) => (
                              <button
                                key={statusOption}
                                type="button"
                                onClick={() =>
                                  updateStatus(submission._id, statusOption)
                                }
                                className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                              >
                                {statusOption}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500 dark:border-slate-800">
                      Select a form to review submissions.
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">Live sharing</h3>
                      <p className={`text-sm ${theme.textSecondary}`}>
                        Share the public form link with any selected role.
                      </p>
                    </div>
                    <ExternalLink size={20} />
                  </div>
                  {builder.publicSlug ? (
                    <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
                      <div className="font-medium">Public URL</div>
                      <a
                        href={`${window.location.origin}/forms/${builder.publicSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block truncate text-green-700 hover:text-green-900 dark:text-green-300"
                      >
                        {`${window.location.origin}/forms/${builder.publicSlug}`}
                      </a>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
                      Generate the form once saved to get a public link.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          {selectedForm && (
            <button
              type="button"
              onClick={removeSelectedForm}
              className="rounded-2xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Delete Form
            </button>
          )}
          <button
            type="button"
            onClick={saveForm}
            disabled={saveLoading}
            className="rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex items-center gap-2">
              <Save size={16} /> {saveLoading ? "Saving..." : "Save Form"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FormManagement;
