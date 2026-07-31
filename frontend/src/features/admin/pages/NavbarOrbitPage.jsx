import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiFacebook,
  FiEye,
  FiEyeOff,
  FiGithub,
  FiInstagram,
  FiLink,
  FiLogIn,
  FiLogOut,
  FiMail,
  FiPlus,
  FiMonitor,
  FiMoon,
  FiRefreshCw,
  FiRotateCcw,
  FiShield,
  FiSun,
  FiUser,
  FiUserPlus,
  FiShare2,
  FiYoutube,
} from "react-icons/fi";

import {
  createNavbarOrbitItem,
  deleteNavbarOrbitItem,
  getAdminNavbarOrbitItems,
  reorderNavbarOrbitItems,
  resetNavbarOrbitGroup,
  updateNavbarOrbitItem,
  updateNavbarOrbitItemStatus,
} from "../../../api/navbar-orbit.api";
import {
  DEFAULT_ICON_KEY,
} from "../../../shared/constants";
import {
  NAVBAR_ORBIT_ACTION_TYPES,
  NAVBAR_ORBIT_GROUPS,
  NAVBAR_ORBIT_ICON_OPTIONS,
  NAVBAR_ORBIT_PROFILE_ACTIONS,
  NAVBAR_ORBIT_SOCIAL_SEEDS,
  NAVBAR_ORBIT_THEME_MODES,
  NAVBAR_ORBIT_VISIBILITY,
} from "../../../shared/constants/navbar-orbit";
import { getIconComponent } from "../../../shared/utils";
import { calculateOrbitLayout } from "../../../shared/utils/orbit-layout";
import useReducedMotion from "../../../lib/useReducedMotion";
import "../styles/navbar-orbit-manager.css";

const GROUPS = [
  {
    key: NAVBAR_ORBIT_GROUPS.SOCIAL,
    label: "Social",
    icon: FiShare2,
    description: "Linked social and community actions.",
  },
  {
    key: NAVBAR_ORBIT_GROUPS.THEME,
    label: "Theme",
    icon: FiSun,
    description: "Theme modes controlled by the system action set.",
  },
  {
    key: NAVBAR_ORBIT_GROUPS.PROFILE,
    label: "Profile",
    icon: FiUser,
    description: "Authentication and account actions.",
  },
];

const VISIBILITY_LABELS = {
  [NAVBAR_ORBIT_VISIBILITY.PUBLIC]: "Public",
  [NAVBAR_ORBIT_VISIBILITY.GUEST]: "Guests",
  [NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED]: "Authenticated",
  [NAVBAR_ORBIT_VISIBILITY.USER]: "Users",
  [NAVBAR_ORBIT_VISIBILITY.ADMIN]: "Admins",
};

const ACTION_LABELS = {
  [NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL]: "External URL",
  [NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE]: "Internal Route",
  [NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE]: "Theme Mode",
  [NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION]: "System Action",
};

const PROFILE_ACTIONS = NAVBAR_ORBIT_PROFILE_ACTIONS.map((item) => ({
  key: item.key,
  label: item.label,
}));

const SOCIAL_ACTIONS = NAVBAR_ORBIT_SOCIAL_SEEDS.map((item) => ({
  key: item.systemActionKey,
  label: item.label,
}));

const getDefaultForm = (groupKey = NAVBAR_ORBIT_GROUPS.SOCIAL) => {
  if (groupKey === NAVBAR_ORBIT_GROUPS.THEME) {
    return {
      groupKey,
      label: "Dark mode",
      iconKey: "FiMoon",
      actionType: NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE,
      systemActionKey: "dark",
      externalUrl: "",
      internalPath: "",
      openInNewTab: false,
      tooltip: "Switch to dark mode",
      visibility: NAVBAR_ORBIT_VISIBILITY.PUBLIC,
      displayOrder: 1,
      isActive: true,
      isSystem: true,
    };
  }

  if (groupKey === NAVBAR_ORBIT_GROUPS.PROFILE) {
    return {
      groupKey,
      label: "Dashboard",
      iconKey: "FiMonitor",
      actionType: NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION,
      systemActionKey: "dashboard",
      externalUrl: "",
      internalPath: "",
      openInNewTab: false,
      tooltip: "Open the dashboard",
      visibility: NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED,
      displayOrder: 1,
      isActive: true,
      isSystem: true,
    };
  }

  return {
    groupKey,
    label: "LinkedIn",
    iconKey: "FiLinkedin",
    actionType: NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL,
    systemActionKey: "linkedin",
    externalUrl: "https://www.linkedin.com/company/technosthan/",
    internalPath: "",
    openInNewTab: true,
    tooltip: "Open TechnoSthan on LinkedIn",
    visibility: NAVBAR_ORBIT_VISIBILITY.PUBLIC,
    displayOrder: 1,
    isActive: true,
    isSystem: true,
  };
};

const normalizeOrbitItem = (item) => ({
  id: item.id,
  groupKey: item.groupKey || NAVBAR_ORBIT_GROUPS.SOCIAL,
  label: item.label || "",
  iconKey: item.iconKey || DEFAULT_ICON_KEY,
  actionType: item.actionType || NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL,
  systemActionKey: item.systemActionKey || "",
  externalUrl: item.externalUrl || "",
  internalPath: item.internalPath || "",
  openInNewTab: Boolean(item.openInNewTab),
  tooltip: item.tooltip || "",
  visibility: item.visibility || NAVBAR_ORBIT_VISIBILITY.PUBLIC,
  displayOrder: item.displayOrder ?? 0,
  isActive: item.isActive !== false,
  isSystem: Boolean(item.isSystem),
});

const renderIcon = (iconKey, size = 16) => {
  const Icon = getIconComponent(iconKey);
  return <Icon size={size} />;
};

const renderPreviewIcon = (iconKey, size = 14) => {
  switch (iconKey) {
    case "FiFacebook":
      return <FiFacebook size={size} />;
    case "FiGithub":
      return <FiGithub size={size} />;
    case "FiGlobe":
      return <FiShield size={size} />;
    case "FiInstagram":
      return <FiInstagram size={size} />;
    case "FiLink":
      return <FiLink size={size} />;
    case "FiLinkedin":
      return <FiShare2 size={size} />;
    case "FiLogIn":
      return <FiLogIn size={size} />;
    case "FiLogOut":
      return <FiLogOut size={size} />;
    case "FiMail":
      return <FiMail size={size} />;
    case "FiMonitor":
      return <FiMonitor size={size} />;
    case "FiMoon":
      return <FiMoon size={size} />;
    case "FiSun":
      return <FiSun size={size} />;
    case "FiTwitter":
      return <FiShare2 size={size} />;
    case "FiUser":
      return <FiUser size={size} />;
    case "FiUserPlus":
      return <FiUserPlus size={size} />;
    case "FiYoutube":
      return <FiYoutube size={size} />;
    default:
      return <FiShare2 size={size} />;
  }
};

const OrbitItemPreview = ({ items, groupKey }) => {
  const previewLayout = calculateOrbitLayout(items, {
    itemSize: 42,
    minimumGap: 12,
    baseRadius: groupKey === NAVBAR_ORBIT_GROUPS.PROFILE ? 92 : 88,
    maximumRadius: 96,
    minimumRadius: 64,
    startAngle: -110,
    centerOffsetX: 0,
    centerOffsetY: 0,
  });

  const previewItems = previewLayout.orbitItems;

  return (
    <div className="orbit-preview-shell">
      <div className="orbit-preview-core">
        <strong>Orbit</strong>
        <span>{groupKey}</span>
      </div>
      <div className="orbit-preview-ring" aria-hidden="true" />
      {previewItems.length === 0 ? (
        <div className="orbit-preview-empty">No stored orbit items yet.</div>
      ) : null}
      {previewItems.map((previewItem, index) => (
        <div
          key={previewItem.id || `${previewItem.label}-${index}`}
          className="orbit-preview-node"
          style={{
            "--node-x": `${previewItem.orbitX}px`,
            "--node-y": `${previewItem.orbitY}px`,
          }}
        >
          <span className="orbit-preview-node-inner">
            {renderPreviewIcon(previewItem.iconKey || DEFAULT_ICON_KEY, 14)}
            <small>{previewItem.label}</small>
          </span>
        </div>
      ))}
    </div>
  );
};

const NavbarOrbitPage = () => {
  const reducedMotion = useReducedMotion();
  const [items, setItems] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(
    NAVBAR_ORBIT_GROUPS.SOCIAL
  );
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [formData, setFormData] = useState(
    getDefaultForm(NAVBAR_ORBIT_GROUPS.SOCIAL)
  );

  const groupItems = useMemo(
    () =>
      items
        .filter((item) => item.groupKey === selectedGroup)
        .slice()
        .sort(
          (a, b) =>
            (a.displayOrder || 0) - (b.displayOrder || 0) ||
            String(a.label || "").localeCompare(String(b.label || ""))
        ),
    [items, selectedGroup]
  );

  const summary = useMemo(
    () =>
      GROUPS.map((group) => {
        const groupRecords = items.filter(
          (item) => item.groupKey === group.key
        );
        return {
          ...group,
          total: groupRecords.length,
          active: groupRecords.filter((item) => item.isActive).length,
        };
      }),
    [items]
  );

  const iconOptions = useMemo(
    () =>
      NAVBAR_ORBIT_ICON_OPTIONS.filter((key) =>
        key.toLowerCase().includes(iconSearch.toLowerCase())
      ).map((key) => ({
        key,
        icon: renderIcon(key, 18),
      })),
    [iconSearch]
  );

  const loadItems = async () => {
    setLoading(true);

    try {
      const response = await getAdminNavbarOrbitItems();
      const nextItems = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      setItems(nextItems.map(normalizeOrbitItem));
      setError("");
    } catch (fetchError) {
      setError(
        fetchError?.response?.data?.message ||
          fetchError?.message ||
          "Failed to load orbit items"
      );
      toast.error(
        fetchError?.response?.data?.message ||
          "Failed to load orbit items"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const selectedGroupItems = items.filter(
        (item) => item.groupKey === selectedGroup
      );

      setFormData((current) => ({
        ...getDefaultForm(selectedGroup),
        groupKey: selectedGroup,
        displayOrder:
          selectedGroupItems.length > 0
            ? selectedGroupItems[selectedGroupItems.length - 1].displayOrder + 1
            : 1,
        ...(current.groupKey === selectedGroup ? current : {}),
      }));
      setEditingId(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [items, selectedGroup]);

  const resetForm = () => {
    setEditingId(null);
    setIconSearch("");
    setFormData(getDefaultForm(selectedGroup));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setIconSearch("");
    setSelectedGroup(item.groupKey);
    setFormData(normalizeOrbitItem(item));
  };

  const handleFieldChange = (field, value) => {
    setFormData((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (field === "groupKey") {
        const defaults = getDefaultForm(value);
        return {
          ...defaults,
          groupKey: value,
          displayOrder:
            items.filter((item) => item.groupKey === value).length + 1,
        };
      }

      if (field === "actionType") {
        if (value === NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL) {
          next.systemActionKey = "";
          next.internalPath = "";
          next.openInNewTab = true;
        }

        if (value === NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE) {
          next.externalUrl = "";
          next.systemActionKey = "";
          next.openInNewTab = false;
        }

        if (value === NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION) {
          next.externalUrl = "";
          next.internalPath = "";
          next.openInNewTab = false;
        }
      }

      if (field === "systemActionKey") {
        if (selectedGroup === NAVBAR_ORBIT_GROUPS.THEME) {
          const themeItem =
            NAVBAR_ORBIT_THEME_MODES.find((mode) => mode.key === value) ||
            NAVBAR_ORBIT_THEME_MODES[0];
          next.label = themeItem?.label || next.label;
          next.iconKey = themeItem?.iconKey || next.iconKey;
          next.tooltip = themeItem?.tooltip || next.tooltip;
          next.actionType = NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE;
          next.visibility = NAVBAR_ORBIT_VISIBILITY.PUBLIC;
        }

        if (selectedGroup === NAVBAR_ORBIT_GROUPS.SOCIAL) {
          if (!value || value.startsWith("custom")) {
            next.systemActionKey = "";
            next.actionType = NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL;
            next.visibility = NAVBAR_ORBIT_VISIBILITY.PUBLIC;
            next.openInNewTab = true;
            return next;
          }

          const socialItem =
            NAVBAR_ORBIT_SOCIAL_SEEDS.find(
              (preset) => preset.systemActionKey === value
            ) || NAVBAR_ORBIT_SOCIAL_SEEDS[0];
          if (socialItem) {
            next.label = socialItem.label || next.label;
            next.iconKey = socialItem.iconKey || next.iconKey;
            next.externalUrl = socialItem.externalUrl || next.externalUrl;
            next.openInNewTab = socialItem.openInNewTab ?? next.openInNewTab;
            next.tooltip = socialItem.tooltip || next.tooltip;
            next.actionType = NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL;
            next.visibility = NAVBAR_ORBIT_VISIBILITY.PUBLIC;
          }
        }

        if (selectedGroup === NAVBAR_ORBIT_GROUPS.PROFILE) {
          if (!value || value.startsWith("custom")) {
            next.systemActionKey = "";
            next.externalUrl = "";
            next.internalPath = "";
            next.openInNewTab = false;
            return next;
          }

          const profileItem =
            NAVBAR_ORBIT_PROFILE_ACTIONS.find(
              (preset) => preset.key === value
            ) || NAVBAR_ORBIT_PROFILE_ACTIONS[0];
          if (profileItem) {
            next.label = profileItem.label || next.label;
            next.iconKey = profileItem.iconKey || next.iconKey;
            next.tooltip = profileItem.tooltip || next.tooltip;
            next.actionType = NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION;
            next.visibility = profileItem.visibility || next.visibility;
            next.externalUrl = "";
            next.internalPath = "";
            next.openInNewTab = false;
          }
        }
      }

      return next;
    });
  };

  const handleMove = async (itemId, direction) => {
    const currentIndex = groupItems.findIndex((item) => item.id === itemId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= groupItems.length) {
      return;
    }

    const nextGroupItems = [...groupItems];
    const [movedItem] = nextGroupItems.splice(currentIndex, 1);
    nextGroupItems.splice(targetIndex, 0, movedItem);

    setItems((current) => {
      const others = current.filter((item) => item.groupKey !== selectedGroup);
      const reordered = nextGroupItems.map((item, index) => ({
        ...item,
        displayOrder: index + 1,
      }));
      return [...others, ...reordered];
    });

    try {
      const response = await reorderNavbarOrbitItems(
        selectedGroup,
        nextGroupItems.map((item) => item.id)
      );
      setItems(response.data?.data?.map(normalizeOrbitItem) || []);
      toast.success("Orbit order updated");
    } catch (reorderError) {
      toast.error(
        reorderError?.response?.data?.message ||
          "Failed to update orbit order"
      );
      loadItems();
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await updateNavbarOrbitItemStatus(
        item.id,
        !item.isActive
      );
      const updated = normalizeOrbitItem(response.data?.data);
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );
      toast.success("Orbit item status updated");
    } catch (toggleError) {
      toast.error(
        toggleError?.response?.data?.message ||
          "Failed to update orbit item status"
      );
    }
  };

  const handleDelete = async (item) => {
    const label = "Delete";

    if (
      !window.confirm(
        `${label} "${item.label}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await deleteNavbarOrbitItem(item.id);
      setItems((current) =>
        current.filter((currentItem) => currentItem.id !== item.id)
      );

      toast.success(response.data?.message || `${label} complete`);
      if (editingId === item.id) {
        resetForm();
      }
    } catch (deleteError) {
      toast.error(
        deleteError?.response?.data?.message ||
          "Failed to update orbit item"
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        groupKey: selectedGroup,
        iconKey: formData.iconKey || DEFAULT_ICON_KEY,
        displayOrder: Number.parseInt(formData.displayOrder, 10) || 0,
        isActive: Boolean(formData.isActive),
        openInNewTab: Boolean(formData.openInNewTab),
        tooltip: formData.tooltip || "",
      };

      if (selectedGroup === NAVBAR_ORBIT_GROUPS.THEME) {
        payload.actionType = NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE;
        payload.visibility = NAVBAR_ORBIT_VISIBILITY.PUBLIC;
        payload.externalUrl = "";
        payload.internalPath = "";
        payload.openInNewTab = false;
      }

      if (selectedGroup === NAVBAR_ORBIT_GROUPS.SOCIAL) {
        payload.actionType = NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL;
        payload.visibility = NAVBAR_ORBIT_VISIBILITY.PUBLIC;
        payload.internalPath = "";
      }

      const response = editingId
        ? await updateNavbarOrbitItem(editingId, payload)
        : await createNavbarOrbitItem(payload);

      const nextItem = normalizeOrbitItem(response.data?.data);

      setItems((current) => {
        const currentItems = current.filter((item) => item.id !== nextItem.id);
        return [...currentItems, nextItem].sort(
          (a, b) =>
            String(a.groupKey).localeCompare(String(b.groupKey)) ||
            (a.displayOrder || 0) - (b.displayOrder || 0)
        );
      });

      setEditingId(null);
      setFormData(getDefaultForm(selectedGroup));
      toast.success(
        editingId ? "Orbit item updated" : "Orbit item created"
      );
      setStatusMessage("Saved successfully.");
    } catch (saveError) {
      const message =
        saveError?.response?.data?.message || "Failed to save orbit item";
      toast.error(message);
      setStatusMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetGroup = async () => {
    if (
      !window.confirm(
        `Reset ${GROUPS.find((group) => group.key === selectedGroup)?.label || selectedGroup} items to defaults? Custom items in this group will be removed.`
      )
    ) {
      return;
    }

    try {
      const response = await resetNavbarOrbitGroup(selectedGroup);
      setItems(
        Array.isArray(response.data?.data)
          ? response.data.data.map(normalizeOrbitItem)
          : []
      );
      toast.success("Group reset to defaults");
      setStatusMessage("Group restored to defaults.");
      resetForm();
    } catch (resetError) {
      const message =
        resetError?.response?.data?.message ||
        "Failed to reset orbit group";
      toast.error(message);
      setStatusMessage(message);
    }
  };

  const visibleItems = groupItems.filter((item) => item.isActive);

  return (
    <div className="admin-page navbar-orbit-manager">
      <section className="admin-card navbar-orbit-manager__hero">
        <span className="section-badge">
          <span className="badge-dot" />
          Navbar Orbit Manager
        </span>
        <div className="admin-section-title navbar-orbit-manager__hero-title">
          <div>
            <h2>Control the orbit items behind the public navbar</h2>
            <p className="admin-note">
              Social, theme and profile orbit items stay on-brand, secured and
              ordered here. Public navbar styling remains unchanged.
            </p>
          </div>

          <div className="admin-actions">
            <button type="button" className="btn-secondary" onClick={loadItems}>
              <FiRefreshCw />
              Refresh
            </button>
            <button type="button" className="btn-secondary" onClick={handleResetGroup}>
              <FiRotateCcw />
              Reset group
            </button>
          </div>
        </div>
        <div className="navbar-orbit-manager__summary">
          {summary.map((group) => {
            const Icon = group.icon;
            return (
              <article key={group.key} className="navbar-orbit-manager__summary-card">
                <span className="navbar-orbit-manager__summary-icon">
                  <Icon />
                </span>
                <strong>{group.label}</strong>
                <span>
                  {group.active}/{group.total} active
                </span>
              </article>
            );
          })}
        </div>
        <p className="navbar-orbit-manager__feedback" aria-live="polite">
          {statusMessage || (reducedMotion ? "Reduced motion is active." : "Live orbit config loaded with safe defaults.")}
        </p>
      </section>

      <section className="navbar-orbit-manager__tabs admin-card">
        <div className="navbar-orbit-manager__tabbar">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            const active = selectedGroup === group.key;
            return (
              <button
                key={group.key}
                type="button"
                className={`navbar-orbit-manager__tab ${active ? "is-active" : ""}`}
                onClick={() => setSelectedGroup(group.key)}
              >
                <Icon />
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>
        <p className="admin-note">
          {GROUPS.find((group) => group.key === selectedGroup)?.description}
        </p>
      </section>

      <div className="admin-grid">
        <section className="admin-form-panel">
          <div className="admin-section-title">
            <h3>{editingId ? "Edit orbit item" : "Create orbit item"}</h3>
            <span className="admin-badge">
              <FiShield />
              Safe actions only
            </span>
          </div>

          <form className="admin-form navbar-orbit-manager__form" onSubmit={handleSubmit}>
            <div className="field-grid">
              <div className="admin-field">
                <label htmlFor="orbit-group">Group</label>
                <select
                  id="orbit-group"
                  value={selectedGroup}
                  onChange={(event) => setSelectedGroup(event.target.value)}
                >
                  {GROUPS.map((group) => (
                    <option key={group.key} value={group.key}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="orbit-order">Display order</label>
                <input
                  id="orbit-order"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(event) =>
                    handleFieldChange("displayOrder", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label htmlFor="orbit-label">Label</label>
                <input
                  id="orbit-label"
                  value={formData.label}
                  onChange={(event) => handleFieldChange("label", event.target.value)}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="orbit-icon-search">Icon search</label>
                <input
                  id="orbit-icon-search"
                  value={iconSearch}
                  onChange={(event) => setIconSearch(event.target.value)}
                  placeholder="Search icon key"
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Icon selection</label>
              <div className="navbar-orbit-manager__icon-grid">
                {iconOptions.map((option) => {
                  const active = formData.iconKey === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`navbar-orbit-manager__icon-chip ${active ? "is-active" : ""}`}
                      onClick={() => handleFieldChange("iconKey", option.key)}
                      aria-pressed={active}
                    >
                      {option.icon}
                      <span>{option.key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label htmlFor="orbit-action">Action type</label>
                <select
                  id="orbit-action"
                  value={formData.actionType}
                  onChange={(event) =>
                    handleFieldChange("actionType", event.target.value)
                  }
                  disabled={selectedGroup === NAVBAR_ORBIT_GROUPS.THEME || selectedGroup === NAVBAR_ORBIT_GROUPS.SOCIAL}
                >
                  {selectedGroup === NAVBAR_ORBIT_GROUPS.THEME ? (
                    <option value={NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE}>
                      Theme Mode
                    </option>
                  ) : selectedGroup === NAVBAR_ORBIT_GROUPS.SOCIAL ? (
                    <option value={NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL}>
                      External URL
                    </option>
                  ) : (
                    <>
                      <option value={NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION}>
                        System Action
                      </option>
                      <option value={NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE}>
                        Internal Route
                      </option>
                      <option value={NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL}>
                        External URL
                      </option>
                    </>
                  )}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="orbit-system-action">System action</label>
                <select
                  id="orbit-system-action"
                  value={formData.systemActionKey}
                  onChange={(event) =>
                    handleFieldChange("systemActionKey", event.target.value)
                  }
                >
                  <option value="">Custom item</option>
                  {(selectedGroup === NAVBAR_ORBIT_GROUPS.THEME
                    ? NAVBAR_ORBIT_THEME_MODES
                    : selectedGroup === NAVBAR_ORBIT_GROUPS.PROFILE
                      ? PROFILE_ACTIONS
                      : SOCIAL_ACTIONS
                  ).map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label htmlFor="orbit-visibility">Visibility</label>
                <select
                  id="orbit-visibility"
                  value={formData.visibility}
                  onChange={(event) =>
                    handleFieldChange("visibility", event.target.value)
                  }
                >
                  {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="orbit-status">Status</label>
                <select
                  id="orbit-status"
                  value={String(formData.isActive)}
                  onChange={(event) =>
                    handleFieldChange("isActive", event.target.value === "true")
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {(formData.actionType === NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL ||
              (selectedGroup === NAVBAR_ORBIT_GROUPS.SOCIAL &&
                formData.actionType !== NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE)) && (
              <div className="field-grid">
                <div className="admin-field">
                  <label htmlFor="orbit-url">External URL</label>
                  <input
                    id="orbit-url"
                    value={formData.externalUrl}
                    onChange={(event) =>
                      handleFieldChange("externalUrl", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="orbit-new-tab">Open in new tab</label>
                  <select
                    id="orbit-new-tab"
                    value={String(formData.openInNewTab)}
                    onChange={(event) =>
                      handleFieldChange(
                        "openInNewTab",
                        event.target.value === "true"
                      )
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            )}

            {formData.actionType === NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE && (
              <div className="admin-field">
                <label htmlFor="orbit-path">Internal path</label>
                <input
                  id="orbit-path"
                  value={formData.internalPath}
                  onChange={(event) =>
                    handleFieldChange("internalPath", event.target.value)
                  }
                  placeholder="/dashboard"
                />
              </div>
            )}

            <div className="admin-field">
              <label htmlFor="orbit-tooltip">Tooltip</label>
              <input
                id="orbit-tooltip"
                value={formData.tooltip}
                onChange={(event) => handleFieldChange("tooltip", event.target.value)}
                placeholder="Optional helper text"
              />
            </div>

            <div className="admin-note">
              {selectedGroup === NAVBAR_ORBIT_GROUPS.THEME
                ? "Theme actions remain tied to the existing theme system."
                : selectedGroup === NAVBAR_ORBIT_GROUPS.PROFILE
                  ? "Profile actions still respect auth and role rules in code."
                  : "Social items are validated as safe HTTP(S) links."}
            </div>

            <div className="admin-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                <FiCheckCircle />
                {saving ? "Saving..." : editingId ? "Update orbit item" : "Create orbit item"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                <FiPlus />
                Reset form
              </button>
            </div>
          </form>
        </section>

        <section className="admin-preview-panel">
          <div className="admin-section-title">
            <h3>Orbit preview</h3>
            <span className="admin-note">
              {selectedGroup} group
            </span>
          </div>
          <OrbitItemPreview items={groupItems} groupKey={selectedGroup} />
          <div className="navbar-orbit-manager__preview-meta">
            <strong>{groupItems[0]?.label || "Stored orbit items"}</strong>
            <span>
              {groupItems.length > 0
                ? `${groupItems.length} stored item${groupItems.length === 1 ? "" : "s"}`
                : "No stored items"}
            </span>
            <p className="admin-note">
              {groupItems[0]?.tooltip || "Preview copy comes from stored records only."}
            </p>
          </div>
        </section>
      </div>

      <section className="admin-table-panel">
        <div className="admin-section-title">
          <div>
            <h3>{GROUPS.find((group) => group.key === selectedGroup)?.label} orbit items</h3>
            <p className="admin-note">
              Use move controls to reorder items. Deletes remove the record from the database.
            </p>
          </div>
          <span className="admin-note">
            {loading ? "Loading..." : `${visibleItems.length} active / ${groupItems.length} total`}
          </span>
        </div>

        {loading ? (
          <div className="admin-loading">Loading orbit items...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : groupItems.length === 0 ? (
          <div className="admin-empty">No orbit items found for this group.</div>
        ) : (
          <table className="admin-table navbar-orbit-manager__table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Action</th>
                <th>Visibility</th>
                <th>Order</th>
                <th>Status</th>
                <th>Move</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupItems.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-inline">
                      <span className="admin-badge">
                        {renderIcon(item.iconKey, 14)}
                        {item.label}
                      </span>
                      {item.isSystem ? (
                        <span className="admin-chip" title="System item">
                          System
                        </span>
                      ) : null}
                    </div>
                    <p className="admin-note">
                      {item.tooltip || "No tooltip configured."}
                    </p>
                    <p className="admin-note">
                      {item.actionType === NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL
                        ? item.externalUrl
                        : item.actionType === NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE
                          ? item.internalPath
                          : item.systemActionKey || "Configured action"}
                    </p>
                  </td>
                  <td>{ACTION_LABELS[item.actionType] || item.actionType}</td>
                  <td>{VISIBILITY_LABELS[item.visibility] || item.visibility}</td>
                  <td>{item.displayOrder}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-chip"
                      onClick={() => handleToggleActive(item)}
                    >
                      {item.isActive ? <FiEye /> : <FiEyeOff />}
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleMove(item.id, -1)}
                        disabled={index === 0}
                      >
                        <FiArrowUp />
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleMove(item.id, 1)}
                        disabled={index === groupItems.length - 1}
                      >
                        <FiArrowDown />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default NavbarOrbitPage;
