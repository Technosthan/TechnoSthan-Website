import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createHeroVisualFeature,
  deleteHeroVisualFeature,
  getAdminHeroVisual,
  saveHeroVisualSetting,
  updateHeroVisualFeature,
  updateHeroVisualFeatureStatus,
} from "../../../api/hero-visual.api";
import {
  DEFAULT_ICON_KEY,
  HERO_POSITION_OPTIONS,
  ICON_LIBRARY,
} from "../../../shared/constants";
import {
  getIconComponent,
  getSafeImageUrl,
} from "../../../shared/utils";

const featureFormDefaults = {
  title: "",
  iconKey: DEFAULT_ICON_KEY,
  iconPosition: "top-left",
  displayOrder: 0,
  transitionDuration: 4000,
  isActive: true,
};

const CUSTOM_ICON_KEY = "custom";
const MAX_FEATURE_IMAGE_SIZE = 5 * 1024 * 1024;

const defaultHeadingLines = [
  "Transforming Businesses",
  "Through Modern",
  "Technology",
];

const normalizeHeadingLine = (line) =>
  String(line || "")
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const parseHeadingLines = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeHeadingLine);
  }

  return String(value || "")
    .split(/\r?\n/)
    .map(normalizeHeadingLine);
};

const getHeadingValueFromLines = (lines) =>
  (Array.isArray(lines) && lines.length > 0
    ? lines
    : defaultHeadingLines
  ).join("\n");

const getValidHeadingLines = (value) => {
  const headingLines = parseHeadingLines(value).filter(Boolean);

  if (headingLines.length === 0) {
    return defaultHeadingLines;
  }

  return headingLines.slice(0, 3);
};

const validateHeadingLines = (value) => {
  const rawLines = parseHeadingLines(value).filter(Boolean);

  if (rawLines.length === 0) {
    return "";
  }

  if (rawLines.length > 3) {
    return "Hero heading can contain at most 3 lines.";
  }

  for (const line of rawLines) {
    if (line.length > 45) {
      return "Each hero heading line must be 45 characters or fewer.";
    }

    if (/<\s*\/?\s*[a-z][^>]*>/i.test(line) || /<\/?script/i.test(line)) {
      return "Hero heading must be plain text without HTML or script tags.";
    }
  }

  return "";
};

const formatBytes = (size) => {
  const mb = size / (1024 * 1024);
  return `${mb.toFixed(mb >= 1 ? 1 : 2)} MB`;
};

const HeroVisualPage = () => {
  const [loading, setLoading] = useState(true);
  const [settingSaving, setSettingSaving] = useState(false);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [setting, setSetting] = useState(null);
  const [features, setFeatures] = useState([]);
  const [settingForm, setSettingForm] = useState({
    mainImageAlt: "",
    autoTransitionInterval: 4000,
    isActive: true,
    heroHeading: getHeadingValueFromLines(),
  });
  const [selectedMainImage, setSelectedMainImage] = useState(null);
  const [featureForm, setFeatureForm] = useState(
    featureFormDefaults
  );
  const [selectedIconFile, setSelectedIconFile] = useState(null);
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [settingError, setSettingError] = useState("");
  const [settingSuccess, setSettingSuccess] = useState("");
  const [error, setError] = useState("");

  const mainPreviewUrl = useMemo(() => {
    if (selectedMainImage) {
      return URL.createObjectURL(selectedMainImage);
    }

    return getSafeImageUrl(setting?.mainImageUrl);
  }, [selectedMainImage, setting]);

  const featurePreviewUrl = useMemo(() => {
    if (selectedIconFile) {
      return URL.createObjectURL(selectedIconFile);
    }

    const current = features.find(
      (item) => item.id === editingFeatureId
    );
    return getSafeImageUrl(current?.iconImageUrl);
  }, [editingFeatureId, features, selectedIconFile]);

  const selectedFeatureImageLabel = selectedIconFile
    ? `${selectedIconFile.name} (${formatBytes(selectedIconFile.size)})`
    : "";

  const refreshHeroData = async ({
    silent = false,
    withLoading = true,
  } = {}) => {
    if (withLoading) {
      setLoading(true);
    }
    try {
      const response = await getAdminHeroVisual();
      const payload = response.data?.data || {};
      setSetting(payload.setting || null);
      setFeatures(payload.features || []);
      setSettingForm({
        mainImageAlt: payload.setting?.mainImageAlt || "",
        autoTransitionInterval:
          payload.setting?.autoTransitionInterval || 4000,
        isActive: Boolean(payload.setting?.isActive ?? true),
        heroHeading: getHeadingValueFromLines(
          payload.setting?.heroHeadingLines
        ),
      });
      setSettingError("");
      setSettingSuccess("");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to load hero visual settings";
      if (!silent) {
        toast.error(message);
      }
      setSettingError(message);
      setSettingSuccess("");
      setSetting(null);
      setFeatures([]);
    } finally {
      if (withLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    getAdminHeroVisual()
      .then((response) => {
        if (!active) {
          return;
        }

        const payload = response.data?.data || {};
        setSetting(payload.setting || null);
        setFeatures(payload.features || []);
        setSettingForm({
          mainImageAlt: payload.setting?.mainImageAlt || "",
          autoTransitionInterval:
            payload.setting?.autoTransitionInterval || 4000,
          isActive: Boolean(payload.setting?.isActive ?? true),
          heroHeading: getHeadingValueFromLines(
            payload.setting?.heroHeadingLines
          ),
        });
        setSettingError("");
        setSettingSuccess("");
      })
      .catch((err) => {
        if (!active) {
          return;
        }

        const message =
          err?.response?.data?.message ||
          "Failed to load hero visual settings";
        toast.error(
          message
        );
        setSettingError(message);
        setSettingSuccess("");
        setSetting(null);
        setFeatures([]);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (selectedMainImage && mainPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(mainPreviewUrl);
      }
      if (selectedIconFile && featurePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(featurePreviewUrl);
      }
    };
  }, [featurePreviewUrl, mainPreviewUrl, selectedIconFile, selectedMainImage]);

  const resetFeatureForm = () => {
    setEditingFeatureId(null);
    setFeatureForm(featureFormDefaults);
    setSelectedIconFile(null);
    setError("");
  };

  const submitSetting = async (event) => {
    event.preventDefault();
    if (settingSaving) {
      return;
    }

    const headingError = validateHeadingLines(
      settingForm.heroHeading
    );

    if (headingError) {
      setSettingError(headingError);
      setSettingSuccess("");
      toast.error(headingError);
      return;
    }

    setSettingSaving(true);
    setSettingError("");
    setSettingSuccess("");

    try {
      const payload = new FormData();
      payload.append("mainImageAlt", settingForm.mainImageAlt);
      payload.append("heroHeading", settingForm.heroHeading);
      payload.append(
        "autoTransitionInterval",
        String(settingForm.autoTransitionInterval)
      );
      payload.append("isActive", String(settingForm.isActive));
      if (selectedMainImage) {
        payload.append("mainImage", selectedMainImage);
      }

      const response = await saveHeroVisualSetting(payload);
      const nextSetting = response.data?.data;
      setSetting(nextSetting);
      setSettingForm({
        mainImageAlt: nextSetting?.mainImageAlt || "",
        autoTransitionInterval:
          nextSetting?.autoTransitionInterval || 4000,
        isActive: Boolean(nextSetting?.isActive ?? true),
        heroHeading: getHeadingValueFromLines(
          nextSetting?.heroHeadingLines
        ),
      });
      setSettingError("");
      setSettingSuccess("Hero heading saved successfully.");
      toast.success("Hero visual setting saved");
      setSelectedMainImage(null);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to save hero settings";
      setSettingError(message);
      setSettingSuccess("");
      toast.error(message);
    } finally {
      setSettingSaving(false);
    }
  };

  const submitFeature = async (event) => {
    event.preventDefault();
    setFeatureSaving(true);
    setError("");

    const currentFeature = features.find(
      (item) => item.id === editingFeatureId
    );

    if (
      featureForm.iconKey === CUSTOM_ICON_KEY &&
      !selectedIconFile &&
      !(editingFeatureId && currentFeature?.iconImageUrl)
    ) {
      const message =
        "Please upload a custom icon image when Custom is selected.";
      setError(message);
      toast.error(message);
      setFeatureSaving(false);
      return;
    }

    if (
      featureForm.iconKey === CUSTOM_ICON_KEY &&
      selectedIconFile &&
      selectedIconFile.size > MAX_FEATURE_IMAGE_SIZE
    ) {
      const message = `Custom icon image must be 5 MB or smaller. You selected ${formatBytes(selectedIconFile.size)}.`;
      setError(message);
      toast.error(message);
      setFeatureSaving(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("title", featureForm.title);
      if (featureForm.iconKey !== CUSTOM_ICON_KEY) {
        payload.append("iconKey", featureForm.iconKey);
      }
      payload.append("iconPosition", featureForm.iconPosition);
      payload.append("displayOrder", String(featureForm.displayOrder));
      payload.append(
        "transitionDuration",
        String(featureForm.transitionDuration)
      );
      payload.append("isActive", String(featureForm.isActive));
      if (featureForm.iconKey === CUSTOM_ICON_KEY && selectedIconFile) {
        payload.append("iconImage", selectedIconFile);
      }

      const response = editingFeatureId
        ? await updateHeroVisualFeature(editingFeatureId, payload)
        : await createHeroVisualFeature(payload);

      const nextFeature = response.data?.data;
      setFeatures((current) => {
        if (editingFeatureId) {
          return current.map((item) =>
            item.id === editingFeatureId ? nextFeature : item
          );
        }
        return [nextFeature, ...current];
      });
      toast.success(
        editingFeatureId
          ? "Hero feature updated"
          : "Hero feature created"
      );
      resetFeatureForm();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to save hero feature";
      setError(message);
      toast.error(message);
    } finally {
      setFeatureSaving(false);
    }
  };

  const handleEditFeature = (feature) => {
    setEditingFeatureId(feature.id);
    setFeatureForm({
      title: feature.title || "",
      iconKey: feature.iconImageUrl
        ? CUSTOM_ICON_KEY
        : feature.iconKey || DEFAULT_ICON_KEY,
      iconPosition: feature.iconPosition || "top-left",
      displayOrder: feature.displayOrder || 0,
      transitionDuration: feature.transitionDuration || 4000,
      isActive: Boolean(feature.isActive),
    });
    setSelectedIconFile(null);
  };

  const handleDeleteFeature = async (feature) => {
    if (
      !window.confirm(
        `Delete "${feature.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteHeroVisualFeature(feature.id);
      setFeatures((current) =>
        current.filter((item) => item.id !== feature.id)
      );
      if (editingFeatureId === feature.id) {
        resetFeatureForm();
      }
      toast.success("Hero feature deleted");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete feature"
      );
    }
  };

  const handleStatusToggle = async (feature) => {
    try {
      const response = await updateHeroVisualFeatureStatus(
        feature.id,
        !feature.isActive
      );
      const updated = response.data?.data;
      setFeatures((current) =>
        current.map((item) =>
          item.id === feature.id ? updated : item
        )
      );
      toast.success("Hero feature status updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update feature status"
      );
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-card">
        <div className="admin-section-title">
          <div>
            {/* <span className="section-badge">Hero Visual</span> */}
            <h2>Manage the main hero composition</h2>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => refreshHeroData()}
          >
            Refresh
          </button>
        </div>
        <p className="admin-note">
          Update the hero image, alt text, feature cards, positions, status,
          and transition timing from here.
        </p>
      </section>

      <div className="admin-grid">
        <section className="admin-form-panel">
          <div className="admin-section-title">
            <h3>Main hero setting</h3>
            {/* <span className="admin-badge">
              {setting ? "Configured" : "Not configured"}
            </span> */}
          </div>

          <form className="admin-form" onSubmit={submitSetting}>
            <div className="admin-field">
              <label>Main image alt text</label>
              <input
                value={settingForm.mainImageAlt}
                onChange={(event) =>
                  setSettingForm((current) => ({
                    ...current,
                    mainImageAlt: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="admin-field">
              <label>Hero Heading</label>
              <textarea
                value={settingForm.heroHeading}
                onChange={(event) =>
                  setSettingForm((current) => ({
                    ...current,
                    heroHeading: event.target.value,
                  }))
                }
                placeholder={defaultHeadingLines.join("\n")}
              />
              <p className="admin-upload-help">
                Use a new line to control where each heading line appears.
              </p>
            </div>
            <div className="field-grid">
              <div className="admin-field">
                <label>Auto transition interval (ms)</label>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={settingForm.autoTransitionInterval}
                  onChange={(event) =>
                    setSettingForm((current) => ({
                      ...current,
                      autoTransitionInterval: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="admin-field">
                <label>Status</label>
                <select
                  value={String(settingForm.isActive)}
                  onChange={(event) =>
                    setSettingForm((current) => ({
                      ...current,
                      isActive: event.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="admin-field">
              <label>Main image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) =>
                  setSelectedMainImage(
                    event.target.files?.[0] || null
                  )
                }
              />
            </div>

            <p className="admin-upload-help">
              PNG, JPG, WEBP or GIF up to 5MB.
            </p>

            {settingError ? (
              <div className="admin-error">{settingError}</div>
            ) : null}

            {settingSuccess ? (
              <div className="admin-success">{settingSuccess}</div>
            ) : null}

            <div className="admin-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={settingSaving}
              >
                {settingSaving ? "Saving..." : "Save setting"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-preview-panel">
          <div className="admin-section-title">
            <h3>Main image preview</h3>
            <span className="admin-note">
              {settingForm.mainImageAlt || "No alt text yet"}
            </span>
          </div>
          <div className="admin-image-preview">
            {mainPreviewUrl ? (
              <img
                src={mainPreviewUrl}
                alt={settingForm.mainImageAlt || "Hero preview"}
              />
            ) : (
                <p className="admin-note">No main image selected</p>
              )}
          </div>
          <div className="admin-section-title">
            <h3>Heading preview</h3>
            <span className="admin-note">Live line break preview</span>
          </div>
          <div className="admin-heading-preview">
            {getValidHeadingLines(settingForm.heroHeading).map(
              (line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={`admin-heading-line ${
                    index === 0 ? "admin-heading-line-first" : ""
                  }`}
                >
                  {line}
                </span>
              )
            )}
          </div>
        </section>
      </div>

      <div className="admin-grid">
        <section className="admin-form-panel">
          <div className="admin-section-title">
            <h3>{editingFeatureId ? "Edit feature" : "Create feature"}</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetFeatureForm}
            >
              Reset
            </button>
          </div>

          <form className="admin-form" onSubmit={submitFeature}>
            <div className="field-grid">
              <div className="admin-field">
                <label>Title</label>
                <input
                  value={featureForm.title}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="admin-field">
                <label>Icon key</label>
                <select
                  value={featureForm.iconKey}
                  onChange={(event) =>
                    setFeatureForm((current) => {
                      const nextIconKey = event.target.value;
                      if (nextIconKey !== CUSTOM_ICON_KEY) {
                        setSelectedIconFile(null);
                      }

                      return {
                        ...current,
                        iconKey: nextIconKey,
                      };
                    })
                  }
                >
                  <option value={CUSTOM_ICON_KEY}>Custom</option>
                  {Object.keys(ICON_LIBRARY).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <p className="admin-upload-help">
                  Choose Custom to upload an icon image, or pick a built-in
                  icon key.
                </p>
              </div>
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label>Icon position</label>
                <select
                  value={featureForm.iconPosition}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      iconPosition: event.target.value,
                    }))
                  }
                  required
                >
                  {HERO_POSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Display order</label>
                <input
                  type="number"
                  min="0"
                  value={featureForm.displayOrder}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      displayOrder: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label>Transition duration (ms)</label>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={featureForm.transitionDuration}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      transitionDuration: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="admin-field">
                <label>Status</label>
                <select
                  value={String(featureForm.isActive)}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      isActive: event.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {featureForm.iconKey === CUSTOM_ICON_KEY ? (
              <div className="admin-field">
                <label>Custom icon image</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) =>
                    setSelectedIconFile(
                      event.target.files?.[0] || null
                    )
                  }
                />
                <p className="admin-upload-help">
                  Upload PNG, JPG, WEBP or GIF up to 5 MB.
                </p>
                {selectedFeatureImageLabel ? (
                  <p className="admin-upload-help">
                    Selected file: {selectedFeatureImageLabel}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="admin-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={featureSaving}
              >
                {featureSaving
                  ? "Saving..."
                  : editingFeatureId
                  ? "Update feature"
                  : "Create feature"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-preview-panel">
          <div className="admin-section-title">
            <h3>Feature preview</h3>
            <span className="admin-note">Selected icon / image</span>
          </div>
          <div className="admin-image-preview">
            {featurePreviewUrl ? (
              <img
                src={featurePreviewUrl}
                alt={featureForm.title || "Hero feature preview"}
              />
            ) : (
              <p className="admin-note">No feature image selected</p>
            )}
          </div>
        </section>
      </div>

      <section className="admin-table-panel">
        <div className="admin-section-title">
          <h3>Stored hero features</h3>
          <span className="admin-note">{features.length} items</span>
        </div>

        {loading ? (
          <div className="admin-loading">Loading hero visual data...</div>
        ) : features.length === 0 ? (
          <div className="admin-empty">No hero features found.</div>
        ) : (
          <div className="admin-feature-list">
            {features.map((feature) => {
              const Icon = getIconComponent(feature.iconKey);

              return (
                <div key={feature.id} className="admin-feature-item">
                  <div>
                    <div className="admin-inline">
                      <span className="admin-badge">{feature.title}</span>
                      <span className="admin-note">
                        {feature.iconPosition}
                      </span>
                    </div>
                    <p className="admin-note">
                      Order {feature.displayOrder} · {feature.transitionDuration} ms
                    </p>
                    <div className="admin-inline">
                      <Icon size={24} />
                      {feature.iconImageUrl ? (
                        <img
                          src={getSafeImageUrl(feature.iconImageUrl)}
                          alt={feature.title}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleStatusToggle(feature)}
                    >
                      {feature.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleEditFeature(feature)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleDeleteFeature(feature)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HeroVisualPage;
