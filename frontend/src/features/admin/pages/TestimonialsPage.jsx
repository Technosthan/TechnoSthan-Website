import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  updateTestimonial,
  updateTestimonialStatus,
} from "../../../api/testimonials.api";
import { getSafeImageUrl } from "../../../shared/utils";

const emptyForm = {
  clientName: "",
  designation: "",
  company: "",
  feedback: "",
  displayOrder: 0,
  isActive: true,
};

const TestimonialsPage = () => {
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
        const response = await getAdminTestimonials();
        setItems(response.data?.data || []);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to load testimonials"
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
      clientName: item.clientName || "",
      designation: item.designation || "",
      company: item.company || "",
      feedback: item.feedback || "",
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
      payload.append("clientName", formData.clientName);
      payload.append("designation", formData.designation);
      payload.append("company", formData.company);
      payload.append("feedback", formData.feedback);
      payload.append("displayOrder", String(formData.displayOrder));
      payload.append("isActive", String(formData.isActive));
      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      const response = editingId
        ? await updateTestimonial(editingId, payload)
        : await createTestimonial(payload);

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
          ? "Testimonial updated successfully"
          : "Testimonial created successfully"
      );
      resetForm();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to save testimonial";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Delete "${item.clientName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteTestimonial(item.id);
      setItems((current) =>
        current.filter((currentItem) => currentItem.id !== item.id)
      );
      toast.success("Testimonial deleted successfully");
      if (editingId === item.id) {
        resetForm();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete testimonial"
      );
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      const response = await updateTestimonialStatus(
        item.id,
        !item.isActive
      );
      const updated = response.data?.data;
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );
      toast.success("Testimonial status updated");
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
        <div className="admin-section-title">
          <div>
            {/* <span className="section-badge">Client Testimonials</span> */}
            <h2>Manage the client wall</h2>
          </div>
          <button className="btn-secondary" onClick={resetForm}>
            Add new
          </button>
        </div>
        <p className="admin-note">
          Add, edit, activate, deactivate, and reorder testimonials that show
          on the homepage.
        </p>
      </section>

      <div className="admin-grid">
        <section className="admin-form-panel">
          <div className="admin-section-title">
            <h3>{editingId ? "Edit testimonial" : "Create testimonial"}</h3>
            {/* <span className="admin-badge">
              {editingId ? "Editing" : "New record"}
            </span> */}
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field-grid">
              <div className="admin-field">
                <label>Client name</label>
                <input
                  value={formData.clientName}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      clientName: event.target.value,
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

            <div className="field-grid">
              <div className="admin-field">
                <label>Designation / role</label>
                <input
                  value={formData.designation}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      designation: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="admin-field">
                <label>Company</label>
                <input
                  value={formData.company}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      company: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Testimonial text</label>
              <textarea
                value={formData.feedback}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    feedback: event.target.value,
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
                  ? "Update testimonial"
                  : "Create testimonial"}
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
                alt={formData.clientName || "Testimonial preview"}
              />
            ) : (
              <p className="admin-note">No image selected</p>
            )}
          </div>
        </section>
      </div>

      <section className="admin-table-panel">
        <div className="admin-section-title">
          <h3>Stored testimonials</h3>
          <span className="admin-note">{items.length} items</span>
        </div>

        {loading ? (
          <div className="admin-loading">
            Loading testimonials...
          </div>
        ) : items.length === 0 ? (
          <div className="admin-empty">No testimonials found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.clientName}</strong>
                    <p className="admin-note">
                      {item.designation}
                      {item.company
                        ? ` • ${item.company}`
                        : ""}
                    </p>
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

export default TestimonialsPage;
