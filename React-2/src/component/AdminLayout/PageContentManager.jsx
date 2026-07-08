import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import api from "../../lib/api";
import AdminLayout from "./AdminLayout";

const positions = [
  { value: "hero", label: "Below Hero" },
  { value: "whoWeAre", label: "Below Who We Are" },
  { value: "businessVerticals", label: "Below Our Business Verticals" },
  { value: "footer", label: "Before Footer" },
  { value: "top", label: "Top of Page" },
  { value: "bottom", label: "Bottom of Page" },
  { value: "custom", label: "Custom Order" },
];

const displayStyleOptions = [
  { value: "original", label: "Original Text Style" },
  { value: "website", label: "Website Default Theme" },
];

const emptyForm = {
  route: "/",
  position: "hero",
  title: "",
  subtitle: "",
  content: "",
  mediaUrl: "",
  buttonText: "",
  buttonLink: "",
  themeType: "website",
  status: true,
  sortOrder: 0,
};

const triggerPageContentRefresh = () => {
  window.dispatchEvent(new Event("page-content-updated"));
  window.localStorage.setItem("page-content-updated", String(Date.now()));
};

const PageContentManager = () => {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        "/api/page-content?route=all&includeInactive=true",
      );
      if (response.data.success) {
        setSections(response.data.data || []);
      }
    } catch (err) {
      setError("Unable to load page content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const saveSection = async () => {
    if (!form.route || !form.position || !form.title) {
      setError("Route, position and title are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        ...form,
        status: form.status,
        sortOrder: Number(form.sortOrder || 0),
      };

      if (editingId) {
        await api.put(`/api/admin/page-content/${editingId}`, payload);
      } else {
        await api.post("/api/admin/page-content", payload);
      }

      resetForm();
      await loadSections();
      triggerPageContentRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save section");
    } finally {
      setSaving(false);
    }
  };

  const editSection = (section) => {
    setEditingId(section._id);
    setForm({
      ...emptyForm,
      ...section,
      status: Boolean(section.status),
      sortOrder: section.sortOrder || 0,
    });
  };

  const deleteSection = async (id) => {
    try {
      await api.delete(`/api/admin/page-content/${id}`);
      await loadSections();
      triggerPageContentRefresh();
    } catch (err) {
      setError("Unable to delete section");
    }
  };

  const toggleStatus = async (section) => {
    try {
      await api.patch(`/api/admin/page-content/${section._id}/status`, {
        status: !section.status,
      });
      await loadSections();
      triggerPageContentRefresh();
    } catch (err) {
      setError("Unable to update section status");
    }
  };

  const summary = useMemo(
    () => `${sections.length} section${sections.length === 1 ? "" : "s"}`,
    [sections.length],
  );

  return (
    <AdminLayout
      title="Page Content Manager"
      subtitle="Create reusable sections for any route and position without replacing the existing site content."
    >
      <div className="page-layout space-y-6">
        <div className="card glass p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Dynamic Section Builder</p>
              <h2 className="text-2xl font-semibold text-white">
                Add content blocks for routes like /, /about, /contact, or your
                future pages
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {summary}
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-900/30 p-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Route</span>
              <input
                name="route"
                value={form.route}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="/about"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Section Position</span>
              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
              >
                {positions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Heading</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="Our Vision"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Sub-heading</span>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="A short intro"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
              <span>Body Content</span>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={6}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="Use this for rich informational content"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Media URL</span>
              <input
                name="mediaUrl"
                value={form.mediaUrl}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="https://..."
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Button Text</span>
              <input
                name="buttonText"
                value={form.buttonText}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="Learn more"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Button Link</span>
              <input
                name="buttonLink"
                value={form.buttonLink}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="https://example.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Text Display Style</span>
              <select
                name="themeType"
                value={form.themeType}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
              >
                {displayStyleOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span>Sort Order / Priority</span>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="status"
                checked={form.status}
                onChange={handleChange}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={saveSection}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 font-medium text-white"
            >
              <Plus size={16} className="mr-2 inline" />
              {editingId ? "Update section" : "Create section"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-200"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="card glass p-6">
          <h3 className="text-xl font-semibold text-white">
            Existing sections
          </h3>
          {loading ? (
            <p className="mt-4 text-slate-300">Loading sections...</p>
          ) : null}
          <div className="mt-4 space-y-3">
            {sections.map((section) => (
              <div
                key={section._id}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {section.title}
                    </div>
                    <div className="text-sm text-slate-400">
                      Route: {section.route} • Position: {section.position} •
                      Order: {section.sortOrder}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(section)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                    >
                      {section.status ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => editSection(section)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteSection(section._id)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PageContentManager;
