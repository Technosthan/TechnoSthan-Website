import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Monitor,
  Mail,
  MailCheck,
} from "lucide-react";

import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./adminApi";

const AnnouncementManager = () => {
  const { theme, isDark } = useTheme();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterChannel, setFilterChannel] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    targetAudience: "all",
    deliveryChannel: "dashboard",
    isActive: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncements();
      setAnnouncements(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      targetAudience: "all",
      deliveryChannel: "dashboard",
      isActive: true,
    });

    setEditingAnnouncement(null);
    setShowForm(false);
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      deliveryChannel: announcement.deliveryChannel || "dashboard",
      isActive: announcement.isActive,
    });

    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement._id, formData);
      } else {
        await createAnnouncement(formData);
      }

      await fetchAnnouncements();
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save announcement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;

      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;

      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;

      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500/15 text-green-400 border border-green-500/30";

      case "warning":
        return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";

      case "error":
        return "bg-red-500/15 text-red-400 border border-red-500/30";

      default:
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/15 text-red-400 border border-red-500/30";

      case "high":
        return "bg-orange-500/15 text-orange-400 border border-orange-500/30";

      case "low":
        return "bg-gray-500/15 text-gray-300 border border-gray-500/20";

      default:
        return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
    }
  };

  const getDeliveryIcon = (channel) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4 text-blue-400" />;

      case "both":
        return <MailCheck className="h-4 w-4 text-green-400" />;

      default:
        return <Monitor className="h-4 w-4 text-purple-400" />;
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || item.type === filterType;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && item.isActive) ||
      (filterStatus === "inactive" && !item.isActive);

    const matchesChannel =
      filterChannel === "all" ||
      (item.deliveryChannel || "dashboard") === filterChannel;

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesChannel
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className={`${theme.textSecondary}`}>
            Loading announcements...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${theme.text}`}>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-4xl font-bold ${theme.text}`}>
            Announcement Management
          </h1>

          <p className={`${theme.textSecondary} mt-2`}>
            Create and manage platform announcements.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transition-all text-white font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* FILTER SECTION */}
      <div
        className={`${theme.card} border ${theme.border} rounded-3xl p-6 shadow-xl`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* SEARCH */}
          <div className="lg:col-span-2 relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${theme.textSecondary}`}
            />

            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${theme.input} w-full pl-12 pr-4 py-3 rounded-2xl`}
            />
          </div>

          {/* TYPE */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`${theme.input} rounded-2xl px-4 py-3`}
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* STATUS */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${theme.input} rounded-2xl px-4 py-3`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Filter className={`${theme.textSecondary} h-5 w-5`} />

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className={`${theme.input} rounded-2xl px-4 py-3 max-w-xs`}
          >
            <option value="all">All Channels</option>
            <option value="dashboard">Dashboard</option>
            <option value="email">Email</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`${theme.card} border ${theme.border} rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl`}
          >
            {/* HEADER */}
            <div
              className={`flex items-center justify-between p-6 border-b ${theme.border}`}
            >
              <div>
                <h2 className={`text-2xl font-bold ${theme.text}`}>
                  {editingAnnouncement
                    ? "Edit Announcement"
                    : "Create Announcement"}
                </h2>

                <p className={`${theme.textSecondary} mt-1`}>
                  Manage dashboard and email announcements.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* TITLE */}
                <div>
                  <label className={`block mb-2 font-semibold ${theme.text}`}>
                    Title
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    placeholder="Announcement title"
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                  />
                </div>

                {/* TYPE */}
                <div>
                  <label className={`block mb-2 font-semibold ${theme.text}`}>
                    Type
                  </label>

                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                {/* PRIORITY */}
                <div>
                  <label className={`block mb-2 font-semibold ${theme.text}`}>
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* TARGET */}
                <div>
                  <label className={`block mb-2 font-semibold ${theme.text}`}>
                    Audience
                  </label>

                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students</option>
                    <option value="admins">Admins</option>
                  </select>
                </div>

                {/* CHANNEL */}
                <div className="md:col-span-2">
                  <label className={`block mb-2 font-semibold ${theme.text}`}>
                    Delivery Channel
                  </label>

                  <select
                    value={formData.deliveryChannel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryChannel: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-2xl`}
                  >
                    <option value="dashboard">Dashboard Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">Dashboard + Email</option>
                  </select>
                </div>
              </div>

              {/* MESSAGE */}
              <div>
                <label className={`block mb-2 font-semibold ${theme.text}`}>
                  Message
                </label>

                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                  placeholder="Write announcement message..."
                  className={`${theme.input} w-full px-4 py-3 rounded-2xl resize-none`}
                />
              </div>

              {/* ACTIVE */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />

                <span className={`${theme.text}`}>
                  Active announcement
                </span>
              </div>

              {/* ACTIONS */}
              <div
                className={`flex justify-end gap-4 pt-6 border-t ${theme.border}`}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className={`${theme.input} px-6 py-3 rounded-2xl`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />

                  {editingAnnouncement ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIST */}
      <div
        className={`${theme.card} border ${theme.border} rounded-3xl overflow-hidden shadow-xl`}
      >
        {/* TOP */}
        <div
          className={`p-6 border-b ${theme.border} flex items-center justify-between`}
        >
          <div>
            <h2 className={`text-2xl font-bold ${theme.text}`}>
              All Announcements
            </h2>

            <p className={`${theme.textSecondary} mt-1`}>
              {filteredAnnouncements.length} total announcements
            </p>
          </div>

          <Bell className={`${theme.textSecondary} w-6 h-6`} />
        </div>

        {/* EMPTY */}
        {filteredAnnouncements.length === 0 ? (
          <div className="p-16 text-center">
            <Bell
              className={`w-16 h-16 mx-auto mb-4 ${theme.textSecondary}`}
            />

            <h3 className={`text-xl font-semibold ${theme.text}`}>
              No announcements found
            </h3>

            <p className={`${theme.textSecondary} mt-2`}>
              Create your first announcement.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement._id}
                className="p-6 hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* LEFT */}
                  <div className="flex gap-4 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(announcement.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3
                          className={`text-xl font-semibold ${theme.text}`}
                        >
                          {announcement.title}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadge(
                            announcement.type,
                          )}`}
                        >
                          {announcement.type}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(
                            announcement.priority,
                          )}`}
                        >
                          {announcement.priority}
                        </span>

                        <span className="px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-xs flex items-center gap-2">
                          {getDeliveryIcon(
                            announcement.deliveryChannel || "dashboard",
                          )}

                          {announcement.deliveryChannel || "dashboard"}
                        </span>
                      </div>

                      <p
                        className={`${theme.textSecondary} leading-relaxed mb-4`}
                      >
                        {announcement.message}
                      </p>

                      <div
                        className={`flex flex-wrap items-center gap-4 text-sm ${theme.textSecondary}`}
                      >
                        <span>
                          Audience: {announcement.targetAudience}
                        </span>

                        <span>
                          Created:{" "}
                          {new Date(
                            announcement.createdAt,
                          ).toLocaleDateString()}
                        </span>

                        {!announcement.isActive && (
                          <span className="text-red-400">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(announcement._id)
                      }
                      className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManager;