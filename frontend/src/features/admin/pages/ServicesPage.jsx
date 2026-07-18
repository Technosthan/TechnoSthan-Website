import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiStar,
  FiList,
  FiCheckCircle,
  FiMenu,
  FiLayers,
} from "react-icons/fi";

import {
  createService,
  deleteService,
  getAdminServices,
  updateService,
  updateServiceStatus,
} from "../../../api/services.api";
import {
  DEFAULT_ICON_KEY,
  ICON_LIBRARY,
} from "../../../shared/constants";
import { getIconComponent } from "../../../shared/utils";
import {
  SERVICE_MENU_CATEGORIES,
} from "../../services/data/serviceCatalog";

const emptyForm = {
  title: "",
  slug: "",
  shortDescription: "",
  iconKey: DEFAULT_ICON_KEY,
  category: SERVICE_MENU_CATEGORIES[0]?.label || "Development",
  route: "/services",
  displayOrder: 0,
  isActive: true,
  showInNavbar: true,
  featured: false,
};

const iconOptions = Object.keys(ICON_LIBRARY)
  .sort()
  .map((key) => ({
    value: key,
    label: key,
  }));

const ServicesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  const PreviewIcon = useMemo(() => {
    const Icon = getIconComponent(formData.iconKey);
    return Icon;
  }, [formData.iconKey]);

  const summary = useMemo(() => {
    const activeCount = items.filter((item) => item.isActive).length;
    const navbarCount = items.filter((item) => item.showInNavbar).length;
    const featuredCount = items.filter((item) => item.featured).length;

    return {
      total: items.length,
      activeCount,
      navbarCount,
      featuredCount,
    };
  }, [items]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminServices();
        setItems(response.data?.data || []);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to load services"
        );
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      slug: item.slug || "",
      shortDescription:
        item.shortDescription || item.description || "",
      iconKey: item.iconKey || DEFAULT_ICON_KEY,
      category: item.category || emptyForm.category,
      route: item.route || "/services",
      displayOrder: item.displayOrder || 0,
      isActive: Boolean(item.isActive),
      showInNavbar: Boolean(item.showInNavbar),
      featured: Boolean(item.featured),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        shortDescription: formData.shortDescription,
        iconKey: formData.iconKey,
        category: formData.category,
        route: formData.route,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
        showInNavbar: formData.showInNavbar,
        featured: formData.featured,
      };

      const response = editingId
        ? await updateService(editingId, payload)
        : await createService(payload);

      const nextItem = response.data?.data;
      setItems((current) => {
        if (editingId) {
          return current.map((item) =>
            item.id === editingId ? nextItem : item
          );
        }

        return [nextItem, ...current];
      });

      toast.success(
        editingId
          ? "Service updated successfully"
          : "Service created successfully"
      );
      resetForm();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to save service";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Delete "${item.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteService(item.id);
      setItems((current) =>
        current.filter((currentItem) => currentItem.id !== item.id)
      );
      toast.success("Service deleted successfully");
      if (editingId === item.id) {
        resetForm();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete service"
      );
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      const response = await updateServiceStatus(
        item.id,
        !item.isActive
      );
      const updated = response.data?.data;
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );
      toast.success("Service status updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update service status"
      );
    }
  };

  const handleNavbarToggle = async (item) => {
    try {
      const response = await updateService(item.id, {
        showInNavbar: !item.showInNavbar,
      });
      const updated = response.data?.data;
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );
      toast.success("Navbar visibility updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update navbar visibility"
      );
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Service CMS
        </span>
        <div className="admin-section-title">
          <div>
            <h2>Manage enterprise services</h2>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={resetForm}
          >
            Add new
          </button>
        </div>
        <p className="admin-note">
          These records power the public services page, the navbar mega menu,
          and the inquiry flow.
        </p>
        <div className="admin-trust-grid" style={{ marginTop: "22px" }}>
          <div className="admin-trust-card">
            <FiList />
            <strong>Total Services</strong>
            <span>{summary.total}</span>
          </div>
          <div className="admin-trust-card">
            <FiCheckCircle />
            <strong>Active</strong>
            <span>{summary.activeCount}</span>
          </div>
          <div className="admin-trust-card">
            <FiMenu />
            <strong>Navbar Visible</strong>
            <span>{summary.navbarCount}</span>
          </div>
          <div className="admin-trust-card">
            <FiLayers />
            <strong>Featured</strong>
            <span>{summary.featuredCount}</span>
          </div>
        </div>
      </section>

      <div className="admin-grid">
        <section className="admin-form-panel">
          <div className="admin-section-title">
            <h3>{editingId ? "Edit service" : "Create service"}</h3>
            <span className="admin-badge">
              <FiStar />
              Navbar ready
            </span>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field-grid">
              <div className="admin-field">
                <label>Title</label>
                <input
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="admin-field">
                <label>Slug</label>
                <input
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="web-development"
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Short description</label>
              <textarea
                value={formData.shortDescription}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    shortDescription: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                >
                  {SERVICE_MENU_CATEGORIES.map((category) => (
                    <option key={category.label} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Route</label>
                <input
                  value={formData.route}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      route: event.target.value,
                    }))
                  }
                  placeholder="/services"
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label>Icon</label>
                <select
                  value={formData.iconKey}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      iconKey: event.target.value,
                    }))
                  }
                >
                  {iconOptions.map((option) => (
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
                  value={formData.displayOrder}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      displayOrder: event.target.value,
                    }))
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="admin-field">
                <label>Status</label>
                <select
                  value={String(formData.isActive)}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      isActive: event.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Show in navbar</label>
                <select
                  value={String(formData.showInNavbar)}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      showInNavbar: event.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="admin-field">
              <label>Featured</label>
              <select
                value={String(formData.featured)}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    featured: event.target.value === "true",
                  }))
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {error ? <div className="admin-error">{error}</div> : null}

            <div className="admin-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update service"
                  : "Create service"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="admin-preview-panel">
          <div className="admin-section-title">
            <h3>Preview</h3>
            <span className="admin-note">Icon and content preview</span>
          </div>
          <div className="admin-heading-preview">
            <div className="admin-inline">
              <span className="admin-badge">
                <PreviewIcon size={18} />
                {formData.category}
              </span>
              {formData.featured ? (
                <span className="admin-badge">Featured</span>
              ) : null}
            </div>
            <h4>{formData.title || "Service title"}</h4>
            <p className="admin-note">
              {formData.shortDescription ||
                "A short description will appear here."}
            </p>
            <p className="admin-note">Route: {formData.route || "/services"}</p>
            <p className="admin-note">
              Slug: {formData.slug || "auto-generated from title"}
            </p>
          </div>
        </section>
      </div>

      <section className="admin-table-panel">
        <div className="admin-section-title">
          <h3>Stored services</h3>
          <span className="admin-note">{items.length} items</span>
        </div>

        {loading ? (
          <div className="admin-loading">Loading services...</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">No services found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Route</th>
                <th>Navbar</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const Icon = getIconComponent(item.iconKey);

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-inline">
                        <span className="admin-badge">
                          <Icon size={14} />
                          {item.title}
                        </span>
                      </div>
                      <p className="admin-note">{item.shortDescription}</p>
                      <p className="admin-note">
                        Slug: {item.slug}
                      </p>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.route || "/services"}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-chip"
                        onClick={() => handleNavbarToggle(item)}
                      >
                        {item.showInNavbar ? "Shown" : "Hidden"}
                      </button>
                    </td>
                    <td>{item.displayOrder}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-chip"
                        onClick={() => handleStatusToggle(item)}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
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
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ServicesPage;
