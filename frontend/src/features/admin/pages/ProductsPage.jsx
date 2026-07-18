import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createProject,
  deleteProject,
  getAdminProjects,
  updateProject,
  updateProjectStatus,
} from "../../../api/projects.api";
import { getSafeImageUrl } from "../../../shared/utils";

const emptyForm = {
  title: "",
  description: "",
  displayOrder: 0,
  isActive: true,
};

const ProductsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }

    const current = items.find((item) => item.id === editingId);
    return getSafeImageUrl(current?.imageUrl);
  }, [editingId, items, selectedFile]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminProjects();
        setItems(response.data?.data || []);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to load products"
        );
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedFile && previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setSelectedFile(null);
    setError("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      displayOrder: item.displayOrder || 0,
      isActive: Boolean(item.isActive),
    });
    setSelectedFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("displayOrder", String(formData.displayOrder));
      payload.append("isActive", String(formData.isActive));
      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      const response = editingId
        ? await updateProject(editingId, payload)
        : await createProject(payload);

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
          ? "Product updated successfully"
          : "Product created successfully"
      );
      resetForm();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to save product";
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
      await deleteProject(item.id);
      setItems((current) =>
        current.filter((currentItem) => currentItem.id !== item.id)
      );
      toast.success("Product deleted successfully");
      if (editingId === item.id) {
        resetForm();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      const response = await updateProjectStatus(
        item.id,
        !item.isActive
      );
      const updated = response.data?.data;
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );
      toast.success("Product status updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Product CMS
        </span>
        <div className="admin-section-title">
          <div>
            <h2>Manage enterprise products</h2>
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
          These records power the public products page and can be activated,
          reordered, edited, or removed here.
        </p>
      </section>

      <div className="admin-grid">
        <section className="admin-form-panel">
          <div className="admin-section-title">
            <h3>{editingId ? "Edit product" : "Create product"}</h3>
            {/* <span className="admin-badge">
              {editingId ? "Editing" : "New record"}
            </span> */}
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

            <div className="admin-field">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="admin-inline">
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
                <label>Image</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) =>
                    setSelectedFile(
                      event.target.files?.[0] || null
                    )
                  }
                />
              </div>
            </div>

            <p className="admin-upload-help">
              PNG, JPG, WEBP or GIF up to 5MB.
            </p>

            {error ? (
              <div className="admin-error">{error}</div>
            ) : null}

            <div className="admin-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update product"
                  : "Create product"}
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
            <span className="admin-note">Live image preview</span>
          </div>
          <div className="admin-image-preview">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={formData.title || "Product preview"}
              />
            ) : (
              <p className="admin-note">No image selected</p>
            )}
          </div>
        </section>
      </div>

      <section className="admin-table-panel">
        <div className="admin-section-title">
          <h3>Stored products</h3>
          <span className="admin-note">{items.length} items</span>
        </div>

        {loading ? (
          <div className="admin-loading">Loading products...</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">No products found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <p className="admin-note">{item.description}</p>
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
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ProductsPage;
