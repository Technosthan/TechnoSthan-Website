import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  BookOpen,
  Building2,
  Code2,
  Hotel,
  LayoutGrid,
  Leaf,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
  ChevronDown,
  CircleDot,
  ClipboardList,
  BarChart3,
  BadgeInfo,
  Globe2,
  Layers3,
  Palette,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  createAdminHomepageService,
  deleteAdminHomepageService,
  getAdminHomepageService,
  getAdminHomepageServices,
  reorderAdminHomepageServices,
  translateAdminHomepageService,
  updateAdminHomepageService,
  updateAdminHomepageServiceStatus,
  uploadAdminHomepageServiceImage,
} from "../homepageServices/homepageServicesApi";
import {
  getLocalizedText,
  isSafeServiceUrl,
  normalizeServiceLanguage,
  SERVICE_LANGUAGES,
} from "../homepageServices/homepageServices.utils";

const ICON_OPTIONS = [
  { value: "Leaf", label: "Leaf", icon: Leaf },
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "Code2", label: "Code2", icon: Code2 },
  { value: "Hotel", label: "Hotel", icon: Hotel },
  { value: "Building2", label: "Building2", icon: Building2 },
  { value: "BookOpen", label: "BookOpen", icon: BookOpen },
  { value: "ClipboardList", label: "ClipboardList", icon: ClipboardList },
  { value: "Bot", label: "Bot", icon: Bot },
  { value: "BarChart3", label: "BarChart3", icon: BarChart3 },
  { value: "BadgeInfo", label: "BadgeInfo", icon: BadgeInfo },
  { value: "Globe2", label: "Globe2", icon: Globe2 },
  { value: "Layers3", label: "Layers3", icon: Layers3 },
  { value: "Palette", label: "Palette", icon: Palette },
];

const EMPTY_LOCALIZED = { en: "", hi: "", rj: "" };

const createInnerService = (index = 0) => ({
  title: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  sourceLanguage: "en",
  icon: "",
  imageUrl: "",
  imageAsset: null,
  redirectUrl: "",
  openInNewTab: false,
  displayOrder: index + 1,
  isActive: true,
  translationStatus: { en: "missing", hi: "missing", rj: "missing" },
  translationErrors: { en: "", hi: "", rj: "" },
});

const createEmptyForm = () => ({
  name: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  sourceLanguage: "en",
  icon: "Leaf",
  imageUrl: "",
  imageAsset: null,
  accentColor: "#16a34a",
  redirectUrl: "",
  openInNewTab: false,
  displayOrder: 1,
  status: "draft",
  isActive: true,
  translationStatus: { en: "missing", hi: "missing", rj: "missing" },
  translationErrors: { en: "", hi: "", rj: "" },
  innerServices: Array.from({ length: 4 }, (_, index) => createInnerService(index)),
});

const languageLabels = {
  en: "English",
  hi: "Hindi",
  rj: "Rajasthani",
};

const getInitialActiveLanguage = () =>
  normalizeServiceLanguage(localStorage.getItem("language") || "en");

const getServiceId = (service = {}) => service?._id || service?.id || "";

const buildLocalizedStatus = (...texts) => {
  const status = {};
  SERVICE_LANGUAGES.forEach((language) => {
    status[language] = texts.every((text) => String(text?.[language] || "").trim())
      ? "complete"
      : "missing";
  });
  return status;
};

const isPublishReady = (form) => {
  const mainComplete = SERVICE_LANGUAGES.every((language) =>
    Boolean(String(form?.name?.[language] || "").trim() && String(form?.description?.[language] || "").trim()),
  );

  if (!mainComplete) {
    return false;
  }

  return (form.innerServices || []).every((inner) =>
    SERVICE_LANGUAGES.every((language) =>
      Boolean(String(inner?.title?.[language] || "").trim() && String(inner?.description?.[language] || "").trim()),
    ),
  );
};

const countCompletedInnerServices = (form) =>
  (form.innerServices || []).filter((inner) =>
    SERVICE_LANGUAGES.every((language) =>
      Boolean(String(inner?.title?.[language] || "").trim() && String(inner?.description?.[language] || "").trim()),
    ),
  ).length;

const clampArray = (value) => (Array.isArray(value) ? value.slice(0, 4) : []);

const LanguageTabs = ({ activeLanguage, onChange, statuses = {} }) => (
  <div className="flex flex-wrap gap-2">
    {SERVICE_LANGUAGES.map((language) => {
      const active = activeLanguage === language;
      const status = statuses[language];
      return (
        <button
          key={language}
          type="button"
          onClick={() => onChange(language)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            active
              ? "bg-emerald-600 text-white shadow-lg"
              : "bg-white/70 text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          {languageLabels[language]}
          {status ? (
            <span
              className={`ml-2 text-[11px] uppercase tracking-wide ${
                active ? "text-emerald-100" : "text-slate-400"
              }`}
            >
              {status}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);

const StatusPill = ({ label, tone = "slate" }) => {
  const toneClass =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-200"
      : tone === "amber"
        ? "bg-amber-500/15 text-amber-700 border-amber-200"
        : tone === "rose"
          ? "bg-rose-500/15 text-rose-600 border-rose-200"
          : "bg-slate-500/15 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  );
};

const ServicePreview = ({ form, language, theme }) => {
  const Icon = ICON_OPTIONS.find((option) => option.value === form.icon)?.icon || Leaf;
  const title = getLocalizedText(form.name, language) || "Service preview";
  const description = getLocalizedText(form.description, language) || "Preview the selected language before publishing.";

  return (
    <div className={`${theme.card} ${theme.border} border rounded-3xl p-5 shadow-2xl sticky top-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Preview</p>
          <h3 className={`text-lg font-bold ${theme.text}`}>Live service card</h3>
        </div>
        <StatusPill
          label={form.status === "published" ? "Published" : "Draft"}
          tone={form.status === "published" ? "green" : "amber"}
        />
      </div>

      <div
        className="rounded-3xl p-5 text-white shadow-xl"
        style={{ background: form.accentColor || "#16a34a" }}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-semibold">{title}</h4>
              {form.isActive ? <StatusPill label="Active" tone="green" /> : <StatusPill label="Inactive" tone="rose" />}
            </div>
            <p className="mt-2 text-sm text-white/85 leading-6">{description}</p>
          </div>
        </div>

        {form.imageUrl ? (
          <img
            src={form.imageUrl}
            alt={title}
            className="mt-4 h-36 w-full rounded-2xl object-cover border border-white/20"
            loading="lazy"
            decoding="async"
          />
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/90">
          <span className="rounded-full bg-white/10 px-3 py-1">Order {form.displayOrder || 1}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            {countCompletedInnerServices(form)}/4 inner services complete
          </span>
          {form.openInNewTab ? <span className="rounded-full bg-white/10 px-3 py-1">New tab</span> : <span className="rounded-full bg-white/10 px-3 py-1">Same tab</span>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {clampArray(form.innerServices).map((inner, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-700">
              <CircleDot className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {getLocalizedText(inner.title, language) || `Inner ${index + 1}`}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {getLocalizedText(inner.description, language) || "Translation pending."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceEditor = ({
  form,
  setForm,
  activeLanguage,
  setActiveLanguage,
  onTranslate,
  onImageUpload,
  onInnerImageUpload,
  saving,
  translating,
  theme,
}) => {
  const updateField = (path, value) => {
    setForm((prev) => {
      const next =
        typeof structuredClone === "function"
          ? structuredClone(prev)
          : JSON.parse(JSON.stringify(prev));
      const segments = path.split(".");
      let cursor = next;
      for (let i = 0; i < segments.length - 1; i += 1) {
        cursor = cursor[segments[i]];
      }
      cursor[segments[segments.length - 1]] = value;
      return next;
    });
  };

  const updateLocalizedField = (field, language, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value,
      },
    }));
  };

  const updateInnerLocalizedField = (index, field, language, value) => {
    setForm((prev) => ({
      ...prev,
      innerServices: prev.innerServices.map((inner, innerIndex) =>
        innerIndex === index
          ? {
              ...inner,
              [field]: {
                ...inner[field],
                [language]: value,
              },
            }
          : inner,
      ),
    }));
  };

  const updateInnerField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      innerServices: prev.innerServices.map((inner, innerIndex) =>
        innerIndex === index ? { ...inner, [field]: value } : inner,
      ),
    }));
  };

  const currentLanguageStatus = buildLocalizedStatus(form.name, form.description);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
      <div className="space-y-6">
        <div className={`${theme.card} ${theme.border} border rounded-3xl p-5 shadow-2xl`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Main service</p>
              <h3 className={`text-xl font-bold ${theme.text}`}>Create and localize a homepage service</h3>
            </div>
            <StatusPill
              label={`${countCompletedInnerServices(form)}/4 inner services complete`}
              tone="green"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-600">Language tabs</label>
            <LanguageTabs
              activeLanguage={activeLanguage}
              onChange={setActiveLanguage}
              statuses={currentLanguageStatus}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field
              label="Service name"
              value={form.name[activeLanguage]}
              onChange={(value) => updateLocalizedField("name", activeLanguage, value)}
              placeholder="Enter service name"
            />
            <Field
              label="Short description"
              value={form.description[activeLanguage]}
              onChange={(value) => updateLocalizedField("description", activeLanguage, value)}
              placeholder="Enter service description"
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Source language"
              value={form.sourceLanguage}
              onChange={(value) => updateField("sourceLanguage", value)}
              options={SERVICE_LANGUAGES.map((language) => ({
                value: language,
                label: languageLabels[language],
              }))}
            />
            <SelectField
              label="Icon"
              value={form.icon}
              onChange={(value) => updateField("icon", value)}
              options={ICON_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
            <Field
              label="Accent colour"
              value={form.accentColor}
              onChange={(value) => updateField("accentColor", value)}
              type="color"
            />
            <Field
              label="Display order"
              value={String(form.displayOrder)}
              onChange={(value) => updateField("displayOrder", Number(value || 1))}
              type="number"
              min="1"
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field
              label="Redirect URL"
              value={form.redirectUrl}
              onChange={(value) => updateField("redirectUrl", value)}
              placeholder="https://example.com"
              hint="Only http and https URLs are allowed."
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Open link behavior</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <button
                  type="button"
                  onClick={() => updateField("openInNewTab", !form.openInNewTab)}
                  className={`relative h-8 w-14 rounded-full transition ${
                    form.openInNewTab ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                      form.openInNewTab ? "left-7" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-600">
                  {form.openInNewTab ? "Open in new tab" : "Open in same tab"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => updateField("imageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
              <p className="mt-2 text-xs text-slate-500">Optional image used in the public preview.</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">Upload image</label>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onImageUpload(e.target.files?.[0])}
                  />
                </label>
                {form.imageUrl ? (
                  <button
                    type="button"
                    onClick={() => updateField("imageUrl", "")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <SelectField
              label="Status"
              value={form.status}
              onChange={(value) => updateField("status", value)}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />
            <div className="flex items-end">
              <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-700">Active on homepage</p>
                  <p className="text-xs text-slate-500">Inactive services remain hidden publicly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField("isActive", !form.isActive)}
                  className={`relative h-8 w-14 rounded-full transition ${
                    form.isActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                      form.isActive ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onTranslate}
              disabled={translating}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className={`h-4 w-4 ${translating ? "animate-spin" : ""}`} />
              {translating ? "Translating..." : "Translate"}
            </button>
            <button
              type="button"
              onClick={() => updateField("status", "draft")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save draft
            </button>
            <button
              type="button"
              onClick={() => updateField("status", "published")}
              disabled={saving || !isPublishReady(form)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Eye className="h-4 w-4" />
              Publish
            </button>
          </div>

          {!isPublishReady(form) ? (
            <p className="mt-3 text-sm text-amber-700">
              Publish requires all main and inner service translations to be complete in English, Hindi, and Rajasthani.
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Inner services</p>
              <h3 className={`text-xl font-bold ${theme.text}`}>Exactly four inner service slots</h3>
            </div>
            <StatusPill
              label={`${countCompletedInnerServices(form)}/4 completed`}
              tone={countCompletedInnerServices(form) === 4 ? "green" : "amber"}
            />
          </div>

          <div className="space-y-4">
            {form.innerServices.map((inner, index) => (
              <InnerServiceCard
                key={index}
                index={index}
                inner={inner}
                activeLanguage={activeLanguage}
                setActiveLanguage={setActiveLanguage}
                onLocalizedChange={(field, language, value) =>
                  updateInnerLocalizedField(index, field, language, value)
                }
                onFieldChange={(field, value) => updateInnerField(index, field, value)}
                onImageUpload={(file) => onInnerImageUpload(index, file)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ServicePreview form={form} language={activeLanguage} theme={theme} />
        <div className={`${theme.card} ${theme.border} border rounded-3xl p-5 shadow-xl`}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`font-bold ${theme.text}`}>Translation status</h4>
              <p className="text-sm text-slate-500">Switch tabs to review each language.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {SERVICE_LANGUAGES.map((language) => (
              <div key={language} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700">{languageLabels[language]}</span>
                  <StatusPill
                    label={
                      String(form.translationStatus?.[language] || "missing").replace(/^[a-z]/, (c) => c.toUpperCase())
                    }
                    tone={form.translationStatus?.[language] === "complete" ? "green" : "amber"}
                  />
                </div>
                {form.translationErrors?.[language] ? (
                  <p className="mt-2 text-sm text-rose-600">{form.translationErrors[language]}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    {String(form.name?.[language] || "").trim()
                      ? "Content exists for this language."
                      : "No translated content saved yet."}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder = "", hint = "", ...rest }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-600">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      {...rest}
    />
    {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
  </div>
);

const SelectField = ({ label, value, onChange, options = [] }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-600">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const InnerServiceCard = ({
  index,
  inner,
  activeLanguage,
  setActiveLanguage,
  onLocalizedChange,
  onFieldChange,
  onImageUpload,
  theme,
}) => {
  const [expanded, setExpanded] = useState(index === 0);
  const localizedStatus = buildLocalizedStatus(inner.title, inner.description);

  return (
    <div className={`${theme.card} ${theme.border} border rounded-3xl p-5 shadow-xl`}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            {index + 1}
          </div>
          <div>
            <h4 className={`font-bold ${theme.text}`}>Inner service {index + 1}</h4>
            <p className="text-sm text-slate-500">
              {getLocalizedText(inner.title, activeLanguage) || "Add translated title"}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-4">
              <LanguageTabs
                activeLanguage={activeLanguage}
                onChange={setActiveLanguage}
                statuses={localizedStatus}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Title"
                  value={inner.title[activeLanguage]}
                  onChange={(value) => onLocalizedChange("title", activeLanguage, value)}
                  placeholder="Inner service title"
                />
                <Field
                  label="Short description"
                  value={inner.description[activeLanguage]}
                  onChange={(value) => onLocalizedChange("description", activeLanguage, value)}
                  placeholder="Inner service description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SelectField
                  label="Source language"
                  value={inner.sourceLanguage}
                  onChange={(value) => onFieldChange("sourceLanguage", value)}
                  options={SERVICE_LANGUAGES.map((language) => ({
                    value: language,
                    label: languageLabels[language],
                  }))}
                />
                <SelectField
                  label="Icon"
                  value={inner.icon}
                  onChange={(value) => onFieldChange("icon", value)}
                  options={ICON_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
                <Field
                  label="Display order"
                  type="number"
                  value={String(inner.displayOrder || index + 1)}
                  onChange={(value) => onFieldChange("displayOrder", Number(value || index + 1))}
                  min="1"
                />
                <Field
                  label="Redirect URL"
                  value={inner.redirectUrl}
                  onChange={(value) => onFieldChange("redirectUrl", value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Image URL</label>
                  <input
                    value={inner.imageUrl}
                    onChange={(e) => onFieldChange("imageUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Upload image</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    <Upload className="h-4 w-4" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onImageUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-700">Active</p>
                  <p className="text-xs text-slate-500">Hidden from public view when disabled.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onFieldChange("isActive", !inner.isActive)}
                  className={`relative h-8 w-14 rounded-full transition ${
                    inner.isActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                      inner.isActive ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {SERVICE_LANGUAGES.map((language) => (
                  <StatusPill
                    key={language}
                    label={`${languageLabels[language]} ${String(inner.translationStatus?.[language] || "missing")}`}
                    tone={inner.translationStatus?.[language] === "complete" ? "green" : "amber"}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const HomepageServices = () => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeLanguage, setActiveLanguage] = useState(getInitialActiveLanguage);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminHomepageServices();
      const data = response.data?.data || [];
      setServices(data);
      setSelectedId((current) => {
        if (current && data.some((service) => getServiceId(service) === current)) {
          return current;
        }
        return getServiceId(data[0]) || null;
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [services],
  );

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedServices
      .filter((service) => {
        if (filter === "active" && !service.isActive) return false;
        if (filter === "inactive" && service.isActive) return false;
        if (!query) return true;
        const fields = [
          getLocalizedText(service.name, activeLanguage),
          getLocalizedText(service.name, "en"),
          getLocalizedText(service.description, activeLanguage),
          getLocalizedText(service.description, "en"),
          ...(service.innerServices || []).flatMap((inner) => [
            getLocalizedText(inner.title, activeLanguage),
            getLocalizedText(inner.title, "en"),
          ]),
        ];
        return fields.some((value) => value.toLowerCase().includes(query));
      })
  }, [sortedServices, search, filter, activeLanguage]);

  const selectedService = useMemo(
    () =>
      filteredServices.find((service) => getServiceId(service) === selectedId) ||
      filteredServices[0] ||
      null,
    [filteredServices, selectedId],
  );

  useEffect(() => {
    const id = getServiceId(selectedService);
    if (!id) return;
    setSelectedId(id);
  }, [selectedService]);

  const openCreateModal = () => {
    setEditingServiceId(null);
    setForm(createEmptyForm());
    setActiveLanguage(getInitialActiveLanguage());
    setShowForm(true);
  };

  const openEditModal = async (service) => {
    try {
      const response = await getAdminHomepageService(getServiceId(service));
      const data = response.data?.data;
      if (!data) throw new Error("Service not found");
      setEditingServiceId(getServiceId(service));
      setForm({
        ...createEmptyForm(),
        ...data,
        name: { ...EMPTY_LOCALIZED, ...(data.name || {}) },
        description: { ...EMPTY_LOCALIZED, ...(data.description || {}) },
        innerServices: Array.from({ length: 4 }, (_, index) => ({
          ...createInnerService(index),
          ...(data.innerServices?.[index] || {}),
          title: { ...EMPTY_LOCALIZED, ...(data.innerServices?.[index]?.title || {}) },
          description: { ...EMPTY_LOCALIZED, ...(data.innerServices?.[index]?.description || {}) },
          translationStatus: {
            en: data.innerServices?.[index]?.translationStatus?.en || "missing",
            hi: data.innerServices?.[index]?.translationStatus?.hi || "missing",
            rj: data.innerServices?.[index]?.translationStatus?.rj || "missing",
          },
          translationErrors: {
            en: data.innerServices?.[index]?.translationErrors?.en || "",
            hi: data.innerServices?.[index]?.translationErrors?.hi || "",
            rj: data.innerServices?.[index]?.translationErrors?.rj || "",
          },
        })),
      });
      setActiveLanguage(getInitialActiveLanguage());
      setShowForm(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to load service");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingServiceId(null);
    setForm(createEmptyForm());
  };

  const handleTranslate = async () => {
    try {
      setTranslating(true);
      const response = await translateAdminHomepageService({
        sourceLanguage: form.sourceLanguage,
        name: form.name,
        description: form.description,
        innerServices: form.innerServices,
      });
      const translated = response.data?.data;
      if (!translated) throw new Error("No translation returned");

      setForm((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          ...(translated.name || {}),
        },
        description: {
          ...prev.description,
          ...(translated.description || {}),
        },
        innerServices: prev.innerServices.map((inner, index) => ({
          ...inner,
          title: {
            ...inner.title,
            ...(translated.innerServices?.[index]?.title || {}),
          },
          description: {
            ...inner.description,
            ...(translated.innerServices?.[index]?.description || {}),
          },
          translationStatus: translated.innerServices?.[index]?.translationStatus || inner.translationStatus,
          translationErrors: translated.innerServices?.[index]?.translationErrors || inner.translationErrors,
        })),
        translationStatus: translated.translationStatus || buildLocalizedStatus(translated.name || {}, translated.description || {}),
        translationErrors: translated.translationErrors || { en: "", hi: "", rj: "" },
      }));
      toast.success("Translations generated");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Translation failed";
      toast.error(message);
      setForm((prev) => ({
        ...prev,
        translationErrors: {
          en: message,
          hi: message,
          rj: message,
        },
      }));
    } finally {
      setTranslating(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await uploadAdminHomepageServiceImage(formData);
      const asset = response.data?.data;
      setForm((prev) => ({
        ...prev,
        imageUrl: asset?.secureUrl || asset?.url || prev.imageUrl,
        imageAsset: asset || prev.imageAsset,
      }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    }
  };

  const handleInnerImageUpload = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await uploadAdminHomepageServiceImage(formData);
      const asset = response.data?.data;
      setForm((prev) => ({
        ...prev,
        innerServices: prev.innerServices.map((inner, innerIndex) =>
          innerIndex === index
            ? {
                ...inner,
                imageUrl: asset?.secureUrl || asset?.url || inner.imageUrl,
                imageAsset: asset || inner.imageAsset,
              }
            : inner,
        ),
      }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    }
  };

  const buildPayload = () => ({
    ...form,
    name: form.name,
    description: form.description,
    innerServices: form.innerServices.map((inner, index) => ({
      ...inner,
      displayOrder: Number(inner.displayOrder || index + 1),
    })),
  });

  const handleSave = async ({ publish = false } = {}) => {
    if (!form.name?.[form.sourceLanguage]?.trim()) {
      toast.error("Service name is required in the source language");
      return;
    }
    if (!form.description?.[form.sourceLanguage]?.trim()) {
      toast.error("Service description is required in the source language");
      return;
    }
    if (form.redirectUrl && !isSafeServiceUrl(form.redirectUrl)) {
      toast.error("Please enter a valid http or https redirect URL");
      return;
    }
    if (form.innerServices.length !== 4) {
      toast.error("Exactly four inner services are required");
      return;
    }

    if (publish && !isPublishReady(form)) {
      toast.error("Complete all translations before publishing");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      payload.status = publish ? "published" : "draft";

      const response = editingServiceId
        ? await updateAdminHomepageService(editingServiceId, payload)
        : await createAdminHomepageService(payload);

      const saved = response.data?.data;
      toast.success(response.data?.message || "Saved successfully");
      await loadServices();
      if (getServiceId(saved)) {
        setSelectedId(getServiceId(saved));
      }
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete "${getLocalizedText(service.name, activeLanguage)}"?`)) return;
    try {
      await deleteAdminHomepageService(getServiceId(service));
      toast.success("Service deleted");
      await loadServices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleStatusToggle = async (service) => {
    try {
      const nextIsActive = !service.isActive;
      await updateAdminHomepageServiceStatus(getServiceId(service), { isActive: nextIsActive });
      toast.success(nextIsActive ? "Service activated" : "Service deactivated");
      await loadServices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleMove = async (service, direction) => {
    const serviceId = getServiceId(service);
    const index = sortedServices.findIndex((item) => getServiceId(item) === serviceId);
    if (index < 0) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sortedServices.length) return;

    const nextOrder = [...sortedServices];
    const temp = nextOrder[index];
    nextOrder[index] = nextOrder[nextIndex];
    nextOrder[nextIndex] = temp;

    const reordered = nextOrder.map((item, orderIndex) => ({
      id: item._id,
      displayOrder: orderIndex + 1,
    }));

    try {
      setServices((prev) =>
        prev.map((item) => {
          const updated = reordered.find((candidate) => candidate.id === getServiceId(item));
          return updated ? { ...item, displayOrder: updated.displayOrder } : item;
        }),
      );
      await reorderAdminHomepageServices(reordered);
      toast.success("Order updated");
      await loadServices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reorder failed");
      await loadServices();
    }
  };

  return (
    <div className={`min-h-full ${theme.surface} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Homepage Services</p>
          <h1 className={`mt-2 text-3xl font-black ${theme.text}`}>Our Services / हमारी सेवाएं</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Admin-controlled multilingual homepage services with exactly four inner services per card.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadServices}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add service
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service name"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
        <SelectField
          label="Status filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All services" },
            { value: "active", label: "Active only" },
            { value: "inactive", label: "Inactive only" },
          ]}
        />
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Visible services</p>
          <p className="text-2xl font-black text-slate-900">{filteredServices.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-200" />
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <h2 className="text-lg font-bold">Unable to load homepage services</h2>
          <p className="mt-2 text-sm">{error}</p>
          <button
            type="button"
            onClick={loadServices}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">No services found</h2>
          <p className="mt-2 text-sm text-slate-500">Create the first homepage service or adjust your filters.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add service
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const Icon = ICON_OPTIONS.find((option) => option.value === service.icon)?.icon || Leaf;
            const active = selectedId === getServiceId(service);
            return (
              <div
                key={getServiceId(service)}
                className={`rounded-3xl border p-5 shadow-sm transition ${
                  active
                    ? `${theme.card} ${theme.border} border-2`
                    : `${theme.card} ${theme.border} border hover:shadow-lg`
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedId(active ? null : getServiceId(service))}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                      style={{ background: service.accentColor || "#16a34a" }}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className={`truncate text-xl font-bold ${theme.text}`}>
                          {getLocalizedText(service.name, activeLanguage)}
                        </h2>
                        {service.status === "published" ? (
                          <StatusPill label="Published" tone="green" />
                        ) : (
                          <StatusPill label="Draft" tone="amber" />
                        )}
                      </div>
                      <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                        {getLocalizedText(service.description, activeLanguage)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill
                          label={`${service.innerServices?.length || 0} inner services`}
                          tone={service.innerServices?.length === 4 ? "green" : "amber"}
                        />
                        <StatusPill label={`Order ${service.displayOrder || 1}`} />
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => handleMove(service, "up")}
                      className="rounded-2xl border border-slate-200 bg-white/5 p-3 text-slate-600 transition hover:bg-white/10"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(service, "down")}
                      className="rounded-2xl border border-slate-200 bg-white/5 p-3 text-slate-600 transition hover:bg-white/10"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      className="rounded-2xl border border-slate-200 bg-white/5 p-3 text-slate-600 transition hover:bg-white/10"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(service)}
                      className="rounded-2xl border border-slate-200 bg-white/5 p-3 text-slate-600 transition hover:bg-white/10"
                      aria-label="Toggle active"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service)}
                      className="rounded-2xl border border-rose-200 bg-rose-500/10 p-3 text-rose-600 transition hover:bg-rose-500/20"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: shouldReduceMotion ? 0 : 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`max-h-[92vh] w-full overflow-y-auto rounded-[2rem] ${theme.card} ${theme.text} border ${theme.border} bg-white shadow-2xl`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {editingServiceId ? "Edit service" : "Add service"}
                  </p>
                  <h2 className="text-2xl font-black text-slate-900">
                    {editingServiceId ? "Update homepage service" : "Create homepage service"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-6">
                <ServiceEditor
                  form={form}
                  setForm={setForm}
                  activeLanguage={activeLanguage}
                  setActiveLanguage={setActiveLanguage}
                  onTranslate={handleTranslate}
                  onImageUpload={handleImageUpload}
                  onInnerImageUpload={handleInnerImageUpload}
                  saving={saving}
                  translating={translating}
                  theme={theme}
                />
              </div>

              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave({ publish: false })}
                  disabled={saving}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave({ publish: true })}
                  disabled={saving || !isPublishReady(form)}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Publish
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default HomepageServices;
