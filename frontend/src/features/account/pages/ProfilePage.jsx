import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
} from "react-icons/fi";

import useAuth from "../../../shared/hooks/useAuth";
import { updateAccountProfile, getCurrentAccount } from "../../../api/account.api";
import { DASHBOARD_ROUTE } from "../../../shared/constants";
import { getSafeImageUrl, getAccountDisplayInitial } from "../../../shared/utils";
import "../styles/account.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const avatarUrl =
    preview ||
    user?.profileImageUrl ||
    user?.profileImage ||
    "";
  const initial = getAccountDisplayInitial(form.name || user?.name);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getCurrentAccount();
        const account = response.data?.data || user;

        if (!mounted) return;

        setForm({
          name: account?.name || "",
          email: account?.email || "",
        });
      } catch {
        if (!mounted) return;

        setForm({
          name: user?.name || "",
          email: user?.email || "",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  const fileLabel = useMemo(() => {
    if (!selectedFile) {
      return "No image selected";
    }

    return selectedFile.name;
  }, [selectedFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setError("");
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await updateAccountProfile({
        name: form.name,
        profileImage: selectedFile,
      });

      const token = response.data?.data?.token;
      const account = response.data?.data?.user;

      if (!token || !account) {
        throw new Error("Profile update failed");
      }

      login(token, account);
      setSelectedFile(null);
      setPreview("");
      setSuccess("Profile updated successfully.");
      toast.success("Profile updated successfully");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update your profile.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="account-page">
        <div className="account-shell">
          <div className="account-card">
            <div className="account-note">Loading profile...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="account-page">
      <div className="account-shell">
        <header className="account-hero">
          <div>
            <span className="section-badge">My Profile</span>
            <h1>Edit your account</h1>
            <p>
              Update your name and profile image. Your email
              remains read-only.
            </p>
          </div>

          <div className="account-actions">
            <Link
              to={DASHBOARD_ROUTE}
              className="btn-secondary account-button-secondary"
            >
              <FiArrowLeft />
              Back to Dashboard
            </Link>
          </div>
        </header>

        <div className="account-grid">
          <section className="account-card">
            <h2>Profile details</h2>
            <form className="account-form" onSubmit={handleSubmit}>
              <div className="account-field">
                <label htmlFor="profile-name">
                  Full name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />
              </div>

              <div className="account-field">
                <label htmlFor="profile-email">
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  readOnly
                  disabled
                />
              </div>

              <div className="account-field">
                <label htmlFor="profile-image">
                  Profile image
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={saving}
                />
                <div className="account-note">
                  {fileLabel} {selectedFile ? "" : "Choose a new image to replace the current one."}
                </div>
              </div>

              {error && (
                <div className="account-message error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="account-message success" role="status">
                  {success}
                </div>
              )}

              <div className="account-actions">
                <button
                  type="submit"
                  className="btn-primary account-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          <section className="account-card">
            <h3>Preview</h3>
            <div className="account-preview">
              {avatarUrl ? (
                <img
                  src={getSafeImageUrl(avatarUrl)}
                  alt={form.name || "Account"}
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="account-note account-note-spaced">
              {selectedFile
                ? "This is the image that will be saved to your account."
                : "Your current profile image is shown here."}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
