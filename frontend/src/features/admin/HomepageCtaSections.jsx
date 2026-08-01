import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  createAdminHomepageCtaSection,
  deleteAdminHomepageCtaSection,
  getAdminHomepageCtaSections,
  notifyHomepageCtaSectionsChanged,
  reorderAdminHomepageCtaSections,
  updateAdminHomepageCtaSection,
  updateAdminHomepageCtaSectionStatus,
} from "../homepageCtaSections/homepageCtaSectionsApi";
import {
  CTA_ICON_OPTIONS,
  createCtaFeature,
  getCtaIcon,
  isSafeCtaButtonLink,
} from "../homepageCtaSections/homepageCtaSections.utils";
import HomepageCtaSection from "../../sections/HomepageCtaSection";

const FEATURE_ICON_OPTIONS = CTA_ICON_OPTIONS;

const createEmptyForm = () => ({
  heading: "Smart Farming Starts Here",
  headingIconKey: "sprout",
  description:
    "Learn AgriTech, explore AI tools, monitor farming progress, and improve agricultural productivity with TECHNOSTHAN AGRITECH.",
  buttonText: "Explore AgriTech",
  buttonLink: "/AgriTech Wiki",
  openInNewTab: false,
  panelTitle: "AI Agriculture",
  panelSubtitle: "Smart & sustainable farming",
  panelIconKey: "tractor",
  displayOrder: 0,
  isActive: true,
  features: [
    {
      id: createCtaFeature(0).id,
      title: "Smart Crop Monitoring",
      description: "",
      iconKey: "leaf",
      displayOrder: 0,
    },
    {
      id: createCtaFeature(1).id,
      title: "AI Farming Solutions",
      description: "",
      iconKey: "bot",
      displayOrder: 1,
    },
    {
      id: createCtaFeature(2).id,
      title: "Sustainable Agriculture",
      description: "",
      iconKey: "chart",
      displayOrder: 2,
    },
  ],
});

const getSectionId = (section = {}) => section?._id || section?.id || "";

const mapSectionToForm = (section = {}) => ({
  heading: section.heading || "",
  headingIconKey: section.headingIconKey || "sprout",
  description: section.description || "",
  buttonText: section.buttonText || "Explore AgriTech",
  buttonLink: section.buttonLink || "/",
  openInNewTab: Boolean(section.openInNewTab),
  panelTitle: section.panelTitle || "",
  panelSubtitle: section.panelSubtitle || "",
  panelIconKey: section.panelIconKey || "tractor",
  displayOrder: Number(section.displayOrder || 0),
  isActive: Boolean(section.isActive),
  features: (Array.isArray(section.features) ? section.features : []).map((feature, index) => ({
    id: feature._id || feature.id || createCtaFeature(index).id,
    _id: feature._id || feature.id || "",
    title: feature.title || "",
    description: feature.description || "",
    iconKey: feature.iconKey || "leaf",
    displayOrder: Number(feature.displayOrder || index),
  })),
});

const buildPayload = (form) => ({
  heading: form.heading,
  headingIconKey: form.headingIconKey,
  description: form.description,
  buttonText: form.buttonText,
  buttonLink: form.buttonLink,
  openInNewTab: form.openInNewTab,
  panelTitle: form.panelTitle,
  panelSubtitle: form.panelSubtitle,
  panelIconKey: form.panelIconKey,
  displayOrder: Number(form.displayOrder || 0),
  isActive: Boolean(form.isActive),
  features: (Array.isArray(form.features) ? form.features : []).map((feature, index) => ({
    _id: feature._id || feature.id || undefined,
    id: feature.id || feature._id || undefined,
    title: feature.title,
    description: feature.description,
    iconKey: feature.iconKey,
    displayOrder: Number(feature.displayOrder || index),
  })),
});

const SectionPreview = ({ form }) => (
  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-2xl">
    <div className="border-b border-slate-200 px-5 py-4">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-slate-900">Preview</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">This mirrors the public section layout.</p>
    </div>

    <div className="pointer-events-none bg-[#07111f] p-4">
      <div className="mx-auto max-w-6xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
        <HomepageCtaSection
          section={{
            ...form,
            features: form.features || [],
          }}
        />
      </div>
    </div>
  </div>
);

const HomepageCtaSections = () => {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());

  const refreshSections = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminHomepageCtaSections();
      setSections(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSections();
  }, []);

  const openCreateForm = () => {
    setEditingSectionId(null);
    setForm(createEmptyForm());
    setShowForm(true);
  };

  const openEditForm = (section) => {
    setEditingSectionId(getSectionId(section));
    setForm(mapSectionToForm(section));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSectionId(null);
    setForm(createEmptyForm());
  };

  const setFeatureField = (featureId, field, value) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((feature) =>
        feature.id === featureId ? { ...feature, [field]: value } : feature,
      ),
    }));
  };

  const addFeature = () => {
    setForm((prev) => {
      if ((prev.features || []).length >= 10) {
        toast.error("A maximum of 10 features is allowed");
        return prev;
      }

      return {
        ...prev,
        features: [
          ...prev.features,
          createCtaFeature(prev.features.length),
        ],
      };
    });
  };

  const deleteFeature = (featureId) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((feature) => feature.id !== featureId),
    }));
  };

  const moveFeature = (featureId, direction) => {
    setForm((prev) => {
      const index = prev.features.findIndex((feature) => feature.id === featureId);
      if (index < 0) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.features.length) return prev;

      const nextFeatures = [...prev.features];
      [nextFeatures[index], nextFeatures[nextIndex]] = [nextFeatures[nextIndex], nextFeatures[index]];

      return {
        ...prev,
        features: nextFeatures.map((feature, orderIndex) => ({
          ...feature,
          displayOrder: orderIndex,
        })),
      };
    });
  };

  const handleSave = async () => {
    if (!String(form.heading || "").trim()) {
      toast.error("Heading is required");
      return;
    }

    if (!String(form.panelTitle || "").trim()) {
      toast.error("Panel title is required");
      return;
    }

    if (!isSafeCtaButtonLink(form.buttonLink)) {
      toast.error("Please enter a valid button link");
      return;
    }

    if (!Array.isArray(form.features) || form.features.length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(form);
      const response = editingSectionId
        ? await updateAdminHomepageCtaSection(editingSectionId, payload)
        : await createAdminHomepageCtaSection(payload);

      toast.success(response.data?.message || "Section saved successfully.");
      notifyHomepageCtaSectionsChanged();
      closeForm();
      await refreshSections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save the section. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    try {
      await deleteAdminHomepageCtaSection(getSectionId(section));
      toast.success("Section deleted successfully.");
      notifyHomepageCtaSectionsChanged();
      await refreshSections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete the section. Please try again.");
    }
  };

  const handleStatusToggle = async (section) => {
    try {
      const next = !section.isActive;
      await updateAdminHomepageCtaSectionStatus(getSectionId(section), next);
      toast.success(next ? "Section status updated successfully." : "Section status updated successfully.");
      notifyHomepageCtaSectionsChanged();
      await refreshSections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update section status. Please try again.");
    }
  };

  const handleMove = async (section, direction) => {
    const id = getSectionId(section);
    const index = sections.findIndex((item) => getSectionId(item) === id);
    if (index < 0) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    const nextSections = [...sections];
    [nextSections[index], nextSections[nextIndex]] = [nextSections[nextIndex], nextSections[index]];
    const reordered = nextSections.map((item, orderIndex) => ({
      id: getSectionId(item),
      displayOrder: orderIndex,
    }));

    try {
      setSections(nextSections.map((item, orderIndex) => ({ ...item, displayOrder: orderIndex })));
      await reorderAdminHomepageCtaSections(reordered);
      toast.success("Section order updated successfully.");
      notifyHomepageCtaSectionsChanged();
      await refreshSections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save the section order.");
      await refreshSections();
    }
  };

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [sections],
  );

  return (
    <div className={`min-h-full ${theme.surface} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Homepage CTA Sections
          </p>
          <h1 className={`mt-2 text-3xl font-black ${theme.text}`}>
            Smart Farming Sections
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Manage the Smart Farming call-to-action sections shown above the footer.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refreshSections}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add section
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-200" />
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : sortedSections.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">No sections found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add the first homepage CTA section to populate the public homepage.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSections.map((section, index) => {
            const SectionIcon = getCtaIcon(section.panelIconKey);
            const HeadingIcon = getCtaIcon(section.headingIconKey);

            return (
              <div
                key={getSectionId(section) || index}
                className={`rounded-3xl border p-5 shadow-sm transition ${
                  section.isActive ? "border-emerald-200 bg-white" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600">
                          <HeadingIcon className="h-6 w-6" />
                        </div>
                        <h2 className={`truncate text-xl font-bold ${theme.text}`}>
                          {section.heading}
                        </h2>
                        {section.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Order {section.displayOrder}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {section.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          <SectionIcon className="h-3.5 w-3.5" />
                          {section.panelTitle}
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {section.features?.length || 0} feature rows
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {section.buttonLink || "/"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start xl:self-center">
                    <button
                      type="button"
                      onClick={() => handleMove(section, "up")}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(section, "down")}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(section)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(section)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Toggle active"
                    >
                      {section.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(section)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100"
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
              initial={{ y: reduceMotion ? 0 : 28, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: reduceMotion ? 0 : 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`max-h-[92vh] w-full overflow-y-auto rounded-[2rem] ${theme.card} ${theme.text} border ${theme.border} bg-white shadow-2xl`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {editingSectionId ? "Edit section" : "Add section"}
                  </p>
                  <h2 className="text-2xl font-black text-slate-900">
                    {editingSectionId ? "Update Smart Farming section" : "Create Smart Farming section"}
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

              <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Left content</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Heading
                        </label>
                        <input
                          value={form.heading}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, heading: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Smart Farming Starts Here"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Heading icon
                        </label>
                        <select
                          value={form.headingIconKey}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, headingIconKey: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        >
                          {FEATURE_ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          rows={4}
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Describe the section"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Button text
                        </label>
                        <input
                          value={form.buttonText}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, buttonText: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Explore AgriTech"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Button link
                        </label>
                        <input
                          value={form.buttonLink}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, buttonLink: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="/AgriTech Wiki or https://example.com"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Internal routes should start with /. External links may use http or https.
                        </p>
                      </div>

                      <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-700">Open in new tab</p>
                          <p className="text-xs text-slate-500">Best used for external links.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, openInNewTab: !prev.openInNewTab }))
                          }
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
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Display order
                        </label>
                        <input
                          type="number"
                          value={form.displayOrder}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              displayOrder: Number(e.target.value || 0),
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>

                      <div className="flex items-end">
                        <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <div>
                            <p className="font-semibold text-slate-700">Active</p>
                            <p className="text-xs text-slate-500">
                              Inactive sections stay in admin and hide publicly.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
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
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Right panel</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Panel title
                        </label>
                        <input
                          value={form.panelTitle}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, panelTitle: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="AI Agriculture"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Panel subtitle
                        </label>
                        <input
                          value={form.panelSubtitle}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, panelSubtitle: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Smart & sustainable farming"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600">
                          Panel icon
                        </label>
                        <select
                          value={form.panelIconKey}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, panelIconKey: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        >
                          {FEATURE_ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-lg font-bold text-slate-900">Feature rows</h3>
                      </div>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add feature
                      </button>
                    </div>

                    <div className="space-y-4">
                      {form.features.map((feature, index) => (
                        <div
                          key={feature.id}
                          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600">
                                {(() => {
                                  const Icon = getCtaIcon(feature.iconKey);
                                  return <Icon className="h-5 w-5" />;
                                })()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  Feature {index + 1}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Display order {feature.displayOrder}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => moveFeature(feature.id, "up")}
                                className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
                                aria-label="Move feature up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveFeature(feature.id, "down")}
                                className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
                                aria-label="Move feature down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteFeature(feature.id)}
                                className="rounded-2xl border border-rose-200 bg-rose-50 p-2.5 text-rose-600 transition hover:bg-rose-100"
                                aria-label="Delete feature"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm font-semibold text-slate-600">
                                Feature title
                              </label>
                              <input
                                value={feature.title}
                                onChange={(e) =>
                                  setFeatureField(feature.id, "title", e.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                placeholder="Smart Crop Monitoring"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm font-semibold text-slate-600">
                                Feature description
                              </label>
                              <textarea
                                value={feature.description}
                                onChange={(e) =>
                                  setFeatureField(feature.id, "description", e.target.value)
                                }
                                rows={3}
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                placeholder="Optional description"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-slate-600">
                                Feature icon
                              </label>
                              <select
                                value={feature.iconKey}
                                onChange={(e) =>
                                  setFeatureField(feature.id, "iconKey", e.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                              >
                                {FEATURE_ICON_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-slate-600">
                                Display order
                              </label>
                              <input
                                type="number"
                                value={feature.displayOrder}
                                onChange={(e) =>
                                  setFeatureField(
                                    feature.id,
                                    "displayOrder",
                                    Number(e.target.value || 0),
                                  )
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <SectionPreview form={form} />

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Eye className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Save summary</h3>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <span className="font-semibold text-slate-900">
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Button link</span>
                        <span className="font-semibold text-slate-900">
                          {form.buttonLink || "/"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Feature rows</span>
                        <span className="font-semibold text-slate-900">
                          {form.features?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Heading icon</span>
                        <span className="font-semibold text-slate-900">
                          {form.headingIconKey}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save section
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default HomepageCtaSections;
