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
  const { theme } = useTheme();
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
      setAnnouncements(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
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
      setError(err.response?.data?.message || "Failed to save announcement");
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    try {
      await deleteAnnouncement(announcementId);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getDeliveryChannelIcon = (channel) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4 text-blue-600" />;
      case "both":
        return <MailCheck className="h-4 w-4 text-green-600" />;
      default:
        return <Monitor className="h-4 w-4 text-purple-600" />;
    }
  };

  const getDeliveryChannelText = (channel) => {
    switch (channel) {
      case "email":
        return "Email Only";
      case "both":
        return "Dashboard & Email";
      default:
        return "Dashboard Only";
    }
  };

  const getEmailStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || announcement.type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && announcement.isActive) ||
      (filterStatus === "inactive" && !announcement.isActive);
    const matchesChannel =
      filterChannel === "all" ||
      (announcement.deliveryChannel || "dashboard") === filterChannel;
    return matchesSearch && matchesType && matchesStatus && matchesChannel;
  });

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={`${theme.textSecondary} font-medium`}>
            Loading announcements...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 w-full space-y-8 ${theme.text}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
            Announcement Management
          </h1>
          <p className={`${theme.textSecondary}`}>
            Create and manage system announcements
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Announcement
        </button>
      </div>

      {/* Search and Filter */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-6 border ${theme.border}`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} h-5 w-5`}
            />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border ${theme.border} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-600 ${theme.input}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className={`${theme.textSecondary} h-5 w-5`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-3 border ${theme.border} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 border ${theme.border} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className={`px-4 py-3 border ${theme.border} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            >
              <option value="all">All Channels</option>
              <option value="dashboard">Dashboard Only</option>
              <option value="email">Email Only</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Announcement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${theme.card} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className={`p-6 border-b ${theme.border}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${theme.text}`}>
                  {editingAnnouncement
                    ? "Edit Announcement"
                    : "Create Announcement"}
                </h2>
                <button
                  onClick={resetForm}
                  className={`p-2 ${theme.textSecondary} hover:text-red-600 hover:${theme.card} rounded-lg transition-colors duration-200`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-semibold ${theme.text} mb-2`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                    placeholder="Announcement title..."
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold ${theme.text} mb-2`}
                  >
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold ${theme.text} mb-2`}
                  >
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold ${theme.text} mb-2`}
                  >
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value,
                      })
                    }
                    className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold ${theme.text} mb-2`}
                  >
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
                    className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                  >
                    <option value="dashboard">Dashboard Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">Both Dashboard & Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold ${theme.text} mb-2`}
                >
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none`}
                  placeholder="Announcement message..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <label htmlFor="isActive" className={`text-sm ${theme.text}`}>
                  Active (visible to users)
                </label>
              </div>

              <div
                className={`flex justify-end space-x-4 pt-6 border-t ${theme.border}`}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-6 py-3 border ${theme.border} rounded-xl ${theme.text} hover:${theme.card} transition-colors duration-200 font-medium`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingAnnouncement ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg overflow-hidden border ${theme.border}`}
      >
        <div className={`px-6 py-5 border-b ${theme.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${theme.text}`}>
                All Announcements
              </h2>
              <p className={`text-sm ${theme.textSecondary} mt-1`}>
                {filteredAnnouncements.length} of {announcements.length}{" "}
                announcements
              </p>
            </div>
            <Bell className={`h-6 w-6 ${theme.textSecondary}`} />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center">
              <Bell
                className={`h-16 w-16 ${theme.textSecondary} mx-auto mb-4`}
              />
              <h3 className={`text-lg font-medium ${theme.text} mb-2`}>
                No announcements found
              </h3>
              <p className={`${theme.textSecondary} mb-6`}>
                {searchTerm ||
                filterType !== "all" ||
                filterStatus !== "all" ||
                filterChannel !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first announcement."}
              </p>
              {!searchTerm &&
                filterType === "all" &&
                filterStatus === "all" &&
                filterChannel === "all" && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Announcement
                  </button>
                )}
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement._id}
                className={`p-6 hover:${theme.card} transition-colors duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <h3
                          className={`text-lg font-semibold ${theme.text} truncate mr-3`}
                        >
                          {announcement.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(announcement.type)}`}
                        >
                          {announcement.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPriorityColor(announcement.priority)}`}
                        >
                          {announcement.priority}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 border`}
                        >
                          {getDeliveryChannelIcon(
                            announcement.deliveryChannel || "dashboard",
                          )}
                          <span className="ml-1">
                            {getDeliveryChannelText(
                              announcement.deliveryChannel || "dashboard",
                            )}
                          </span>
                        </span>
                        {announcement.emailStatus && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getEmailStatusColor(announcement.emailStatus)}`}
                          >
                            Email: {announcement.emailStatus}
                          </span>
                        )}
                        {!announcement.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${theme.textSecondary} mb-3 leading-relaxed`}
                      >
                        {announcement.message}
                      </p>
                      <div
                        className={`flex items-center text-xs ${theme.textSecondary}`}
                      >
                        <span>Target: {announcement.targetAudience}</span>
                        <span className="mx-2">•</span>
                        <span>
                          Created:{" "}
                          {new Date(
                            announcement.createdAt,
                          ).toLocaleDateString()}
                        </span>
                        {announcement.createdBy?.name && (
                          <>
                            <span className="mx-2">•</span>
                            <span>By: {announcement.createdBy.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit announcement"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManager;
