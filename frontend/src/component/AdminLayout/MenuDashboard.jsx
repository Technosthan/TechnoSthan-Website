import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Database,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  LineChart,
  LayoutDashboard,
  Megaphone,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
  X,
  Clock3,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from "recharts";
import { useParams } from "react-router-dom";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";
import { EmptyState, GlassPanel, SectionHeading } from "../Dashboard/DashboardWidgets";
import { findMenuById } from "./adminMenuTree";

const MENU_ICON_MAP = {
  activity: Activity,
  bell: Bell,
  briefcase: BriefcaseBusiness,
  calendar: CalendarCheck,
  check: CheckCheck,
  clock: Clock3,
  database: Database,
  file: FileText,
  folder: FolderOpen,
  chart: LineChart,
  dashboard: LayoutDashboard,
  megaphone: Megaphone,
  settings: Settings,
  shield: Shield,
  users: Users,
};

const DATA_SOURCE_OPTIONS = [
  { value: "assignments", label: "Assignments" },
  { value: "forms", label: "Forms" },
  { value: "campaigns", label: "Campaigns" },
  { value: "pageContent", label: "Page Content" },
  { value: "users", label: "Users" },
  { value: "activityLogs", label: "Activity Logs" },
  { value: "businessVerticals", label: "Business Verticals" },
  { value: "dataWorks", label: "Data Works" },
  { value: "dailyTaskTemplates", label: "Daily Task Templates" },
  { value: "dailyTaskInstances", label: "Daily Task Instances" },
  { value: "notifications", label: "Notifications" },
  { value: "workspaceSettings", label: "Workspace Settings" },
];

const AGGREGATION_OPTIONS = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "average", label: "Average" },
  { value: "minimum", label: "Minimum" },
  { value: "maximum", label: "Maximum" },
];

const EMPTY_CARD = {
  id: "",
  title: "",
  subtitle: "",
  icon: "dashboard",
  dataSource: "assignments",
  aggregation: "count",
  field: "",
  filtersText: "{}",
  order: 0,
  active: true,
  link: "",
  refreshInterval: 0,
  chartEnabled: false,
};

const numberFormatter = new Intl.NumberFormat("en-US");

const safeParseFilters = (value) => {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return null;
  }
};

const toDraftCard = (card, index = 0) => ({
  id: card.id || `card-${index}`,
  title: card.title || "",
  subtitle: card.subtitle || "",
  icon: card.icon || "dashboard",
  dataSource: card.dataSource || "assignments",
  aggregation: card.aggregation || "count",
  field: card.field || "",
  filtersText: JSON.stringify(card.filters || {}, null, 2),
  order: Number.isFinite(Number(card.order)) ? Number(card.order) : index,
  active: card.active !== false,
  link: card.link || "",
  refreshInterval: Number.isFinite(Number(card.refreshInterval))
    ? Number(card.refreshInterval)
    : 0,
  chartEnabled: Boolean(card.chartEnabled),
});

const normalizeDraftCards = (cards) =>
  [...cards]
    .map((card, index) => toDraftCard(card, index))
    .sort((left, right) => left.order - right.order)
    .map((card, index) => ({ ...card, order: index }));

const MenuMetricCard = ({ card }) => {
  const Icon = MENU_ICON_MAP[card.icon] || LayoutDashboard;

  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-300">{card.title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {typeof card.value === "number"
              ? numberFormatter.format(card.value)
              : String(card.value ?? "-")}
          </p>
          {card.subtitle ? (
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
              {card.subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-100">
          <Icon size={18} />
        </div>
      </div>

      {card.chartEnabled && Array.isArray(card.chartData) && card.chartData.length ? (
        <div className="mt-4 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={card.chartData}>
              <defs>
                <linearGradient id={`menu-dashboard-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.38} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <Tooltip
                cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#e2e8f0",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#818cf8"
                fill={`url(#menu-dashboard-${card.id})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
};

const CardEditor = ({
  value,
  onChange,
  onCancel,
  onSave,
  saving,
  menuLabel,
}) => {
  const selectedSource = DATA_SOURCE_OPTIONS.find(
    (option) => option.value === value.dataSource,
  );

  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            {value.id ? "Edit card" : "New card"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {menuLabel} dashboard card configuration.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:text-white"
          aria-label="Close editor"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Card title
          </span>
          <input
            value={value.title}
            onChange={(event) => onChange({ ...value, title: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Card subtitle
          </span>
          <input
            value={value.subtitle}
            onChange={(event) => onChange({ ...value, subtitle: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Icon key
          </span>
          <input
            value={value.icon}
            onChange={(event) => onChange({ ...value, icon: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Data source
          </span>
          <select
            value={value.dataSource}
            onChange={(event) => onChange({ ...value, dataSource: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
          >
            {DATA_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Aggregation
          </span>
          <select
            value={value.aggregation}
            onChange={(event) =>
              onChange({ ...value, aggregation: event.target.value })
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
          >
            {AGGREGATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Field
          </span>
          <input
            value={value.field}
            onChange={(event) => onChange({ ...value, field: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
            placeholder={selectedSource ? "Optional numeric field" : ""}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Order
          </span>
          <input
            type="number"
            value={value.order}
            onChange={(event) =>
              onChange({ ...value, order: Number(event.target.value) })
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Filters JSON
          </span>
          <textarea
            rows={5}
            value={value.filtersText}
            onChange={(event) =>
              onChange({ ...value, filtersText: event.target.value })
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Click destination
          </span>
          <input
            value={value.link}
            onChange={(event) => onChange({ ...value, link: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
            placeholder="/admin/assignments"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Refresh interval
          </span>
          <input
            type="number"
            min="0"
            value={value.refreshInterval}
            onChange={(event) =>
              onChange({ ...value, refreshInterval: Number(event.target.value) })
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
            placeholder="0"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={value.active}
            onChange={(event) => onChange({ ...value, active: event.target.checked })}
            className="h-4 w-4 rounded border-white/15 bg-slate-950 text-indigo-500"
          />
          Visible
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={value.chartEnabled}
            onChange={(event) =>
              onChange({ ...value, chartEnabled: event.target.checked })
            }
            className="h-4 w-4 rounded border-white/15 bg-slate-950 text-indigo-500"
          />
          Chart
        </label>
        <span className="text-xs text-slate-500">
          Approved source: {selectedSource?.label || value.dataSource}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500/20 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save card"}
        </button>
      </div>
    </div>
  );
};

const MenuDashboard = ({ menuId: menuIdProp }) => {
  const params = useParams();
  const { showToast } = useToast();
  const menuId = String(menuIdProp || params.menuId || "workspace")
    .trim()
    .toLowerCase();

  const menuNode = findMenuById(menuId) || { id: menuId, label: "Menu" };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState([]);
  const [draftCards, setDraftCards] = useState([]);
  const [draftConfig, setDraftConfig] = useState({
    menuId,
    dashboardTitle: `${menuNode.label || "Menu"} Dashboard`,
    description: "",
    isActive: true,
  });
  const [editorValue, setEditorValue] = useState(null);
  const [editingCardId, setEditingCardId] = useState("");

  const loadDashboard = async (nextMenuId = menuId) => {
    try {
      setLoading(true);
      setError("");

      const [configResponse, statsResponse] = await Promise.all([
        api.get(`/api/admin/menu-dashboards/${nextMenuId}`),
        api.get(`/api/admin/menu-dashboards/${nextMenuId}/stats`),
      ]);

      const config = configResponse.data?.data || {};
      const statsData = statsResponse.data?.data || {};

      const normalizedCards = normalizeDraftCards(config.cards || []);

      setDashboard(config);
      setStats(statsData.cards || []);
      setDraftConfig({
        menuId: config.menuId || nextMenuId,
        dashboardTitle:
          config.dashboardTitle ||
          `${menuNode.label || "Menu"} Dashboard`,
        description: config.description || "",
        isActive: config.isActive !== false,
      });
      setDraftCards(normalizedCards);
      setEditorValue(null);
      setEditingCardId("");
    } catch (loadError) {
      console.error("Menu dashboard load failed:", loadError);
      setError(
        loadError.response?.data?.message ||
          "Unable to load the menu dashboard right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(menuId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  const chartData = useMemo(
    () =>
      stats.map((card) => ({
        name: card.title,
        value: Number(card.value) || 0,
      })),
    [stats],
  );

  const handleAddCard = () => {
    const nextOrder = draftCards.length;
    setEditingCardId(`new-${Date.now()}`);
    setEditorValue({
      ...EMPTY_CARD,
      order: nextOrder,
      filtersText: "{}",
    });
  };

  const handleEditCard = (card) => {
    setEditingCardId(card.id);
    setEditorValue(toDraftCard(card));
  };

  const handleRemoveCard = (cardId) => {
    setDraftCards((current) =>
      normalizeDraftCards(current.filter((card) => card.id !== cardId)),
    );
    if (editingCardId === cardId) {
      setEditingCardId("");
      setEditorValue(null);
    }
  };

  const moveCard = (cardId, direction) => {
    setDraftCards((current) => {
      const sorted = normalizeDraftCards(current);
      const index = sorted.findIndex((card) => card.id === cardId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) {
        return sorted;
      }

      const next = [...sorted];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next.map((card, order) => ({ ...card, order }));
    });
  };

  const saveEditorCard = () => {
    if (!editorValue) {
      return;
    }

    const filters = safeParseFilters(editorValue.filtersText);
    if (filters === null) {
      showToast({
        title: "Invalid filters",
        message: "Please use valid JSON for the filters field.",
        type: "error",
      });
      return;
    }

    if (!editorValue.title.trim()) {
      showToast({
        title: "Card title required",
        message: "Please add a title before saving the card.",
        type: "error",
      });
      return;
    }

    const nextCard = {
      ...editorValue,
      id: editorValue.id || `card-${Date.now()}`,
      filters,
      order: Number.isFinite(Number(editorValue.order))
        ? Number(editorValue.order)
        : draftCards.length,
      refreshInterval: Number.isFinite(Number(editorValue.refreshInterval))
        ? Number(editorValue.refreshInterval)
        : 0,
      active: Boolean(editorValue.active),
      chartEnabled: Boolean(editorValue.chartEnabled),
    };

    const nextCards = normalizeDraftCards(
      editingCardId && draftCards.some((card) => card.id === editingCardId)
        ? draftCards.map((card) =>
            card.id === editingCardId ? { ...nextCard } : card,
          )
        : [...draftCards, nextCard],
    );

    setDraftCards(nextCards);
    setEditorValue(null);
    setEditingCardId("");
  };

  const handleSaveDashboard = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        menuId,
        dashboardTitle: draftConfig.dashboardTitle,
        description: draftConfig.description,
        isActive: Boolean(draftConfig.isActive),
        cards: draftCards.map((card) => ({
          ...card,
          filters: safeParseFilters(card.filtersText) || {},
        })),
      };

      const response = dashboard?._id
        ? await api.put(`/api/admin/menu-dashboards/${dashboard._id}`, payload)
        : await api.post("/api/admin/menu-dashboards", payload);

      const saved = response.data?.data || {};
      setDashboard(saved);
      setDraftCards(normalizeDraftCards(saved.cards || []));
      setDraftConfig({
        menuId: saved.menuId || menuId,
        dashboardTitle: saved.dashboardTitle || draftConfig.dashboardTitle,
        description: saved.description || "",
        isActive: saved.isActive !== false,
      });

      await loadDashboard(menuId);
      showToast({
        title: "Dashboard saved",
        message: "Menu dashboard configuration updated.",
        type: "success",
      });
    } catch (saveError) {
      console.error("Menu dashboard save failed:", saveError);
      setError(
        saveError.response?.data?.message ||
          "Unable to save the menu dashboard configuration.",
      );
      showToast({
        title: "Save failed",
        message:
          saveError.response?.data?.message ||
          "Unable to save the menu dashboard configuration.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const visibleStats = stats.filter((card) => card.active !== false);

  return (
    <div className="space-y-5">
      <GlassPanel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              Menu dashboards
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {draftConfig.dashboardTitle}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {draftConfig.description || "Menu-specific totals and operational metrics."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadDashboard(menuId)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleAddCard}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/15 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500/20"
            >
              <Plus size={16} />
              Add card
            </button>
          </div>
        </div>
      </GlassPanel>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-36 animate-pulse rounded-[22px] border border-white/10 bg-white/5" />
          <div className="h-36 animate-pulse rounded-[22px] border border-white/10 bg-white/5" />
          <div className="h-36 animate-pulse rounded-[22px] border border-white/10 bg-white/5" />
          <div className="h-36 animate-pulse rounded-[22px] border border-white/10 bg-white/5" />
        </div>
      ) : visibleStats.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleStats.map((card) => (
            <MenuMetricCard
              key={card.id}
              card={{
                ...card,
                chartEnabled: card.chartEnabled,
                chartData,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No dashboard cards"
          message="Add cards to surface statistics for this menu."
        />
      )}

      {chartData.length > 1 ? (
        <GlassPanel compact>
          <SectionHeading
            eyebrow="Current snapshot"
            title="Menu card values"
            description="A compact view of the visible card values in their current order."
          />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`menu-dash-${menuId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#818cf8"
                  fill={`url(#menu-dash-${menuId})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      ) : null}

      <GlassPanel compact>
        <SectionHeading
          eyebrow="Dashboard setup"
          title="Manage cards"
          description="Add, edit, reorder, show, hide, and delete cards for this menu dashboard."
          action={
            <button
              type="button"
              onClick={handleSaveDashboard}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/15 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500/20 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save dashboard"}
            </button>
          }
        />

        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Dashboard title
              </span>
              <input
                value={draftConfig.dashboardTitle}
                onChange={(event) =>
                  setDraftConfig((current) => ({
                    ...current,
                    dashboardTitle: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Description
              </span>
              <input
                value={draftConfig.description}
                onChange={(event) =>
                  setDraftConfig((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/40"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={draftConfig.isActive}
              onChange={(event) =>
                setDraftConfig((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-white/15 bg-slate-950 text-indigo-500"
            />
            Dashboard active
          </label>

          {editorValue ? (
            <CardEditor
              value={editorValue}
              onChange={setEditorValue}
              onCancel={() => {
                setEditorValue(null);
                setEditingCardId("");
              }}
              onSave={saveEditorCard}
              saving={false}
              menuLabel={menuNode.label}
            />
          ) : null}

          {draftCards.length ? (
            <div className="space-y-3">
              {draftCards.map((card, index) => {
                const Icon = MENU_ICON_MAP[card.icon] || LayoutDashboard;
                return (
                  <div
                    key={card.id}
                    className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-100">
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {card.title || "Untitled card"}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {card.subtitle || card.dataSource}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                          {card.dataSource} · {card.aggregation}
                          {card.field ? ` · ${card.field}` : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveCard(card.id, -1)}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white disabled:opacity-40"
                          disabled={index === 0}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCard(card.id, 1)}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white disabled:opacity-40"
                          disabled={index === draftCards.length - 1}
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDraftCards((current) =>
                              current.map((item) =>
                                item.id === card.id
                                  ? { ...item, active: !item.active }
                                  : item,
                              ),
                            );
                          }}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white"
                        >
                          {card.active ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditCard(card)}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(card.id)}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-rose-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No cards yet"
              message="Use Add card to create dashboard stats for this menu."
              action={
                <button
                  type="button"
                  onClick={handleAddCard}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/15 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500/20"
                >
                  <Plus size={16} />
                  Add card
                </button>
              }
            />
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default MenuDashboard;
