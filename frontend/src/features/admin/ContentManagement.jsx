import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  ExternalLink,
  Save,
  X,
  Search,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Link as LinkIcon,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getAllContent,
  createContent,
  updateContent,
  deleteContent,
  getQuestionsByContentId,
  deleteQuestionsByContentId,
  createQuestion,
} from "./adminApi";

const ContentManagement = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [resourcesCollapsed, setResourcesCollapsed] = useState(true);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [openRows, setOpenRows] = useState({});
  const [showContent, setShowContent] = useState(false);
  const [searchContent, setSearchContent] = useState("");
  const [activeSearchColumn, setActiveSearchColumn] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subtopics: [{ heading: "", body: "" }],
    resources: [{ name: "", url: "", type: "video" }],
    quizzes: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
  });
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".menu-container")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await getAllContent();
      setContents(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subtopics: [{ heading: "", body: "" }],
      resources: [{ name: "", url: "", type: "video" }],
      quizzes: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
    });
    setEditingContent(null);
    setShowForm(false);
  };

  const handleEdit = (content) => {
    setFormData({
      title: content.title,
      description: content.description,
      subtopics:
        content.subtopics.length > 0
          ? content.subtopics
          : [{ heading: "", body: "" }],
      resources:
        content.resources.length > 0
          ? content.resources.map((resource) => ({
              ...resource,
              name: resource.name || resource.label || "", // Backward compatibility
              type: resource.type || "video", // Default to video if type is missing
            }))
          : [{ name: "", url: "", type: "video" }],
      quizzes: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }], // Initialize with default quiz
    });
    setEditingContent(content);
    // Fetch quizzes for this content
    getQuestionsByContentId(content._id)
      .then((res) => {
        const quizzes = res.data.data.map((q) => ({
          question: q.question,
          options: [...q.options],
          correctAnswer: q.correctAnswer,
        }));
        setFormData((prev) => ({
          ...prev,
          quizzes:
            quizzes.length > 0
              ? quizzes
              : [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
        }));
      })
      .catch(() => {
        setFormData((prev) => ({
          ...prev,
          quizzes: [
            { question: "", options: ["", "", "", ""], correctAnswer: 0 },
          ],
        }));
      });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate resources
    for (const resource of formData.resources) {
      // Skip validation for completely empty resources (user added but didn't fill)
      if (!resource.name.trim() && !resource.url.trim()) {
        continue;
      }
      const error = validateResource(resource);
      if (error) {
        setError(error);
        return;
      }
    }

    try {
      const contentData = {
        title: formData.title,
        description: formData.description,
        subtopics: formData.subtopics,
        resources: formData.resources.filter(
          (r) => r.name.trim() && r.url.trim(),
        ),
      };
      const content = editingContent
        ? await updateContent(editingContent._id, contentData)
        : await createContent(contentData);

      // Handle quizzes
      await deleteQuestionsByContentId(content.data.data._id);
      for (const quiz of formData.quizzes) {
        if (quiz.question.trim()) {
          await createQuestion({
            ...quiz,
            contentId: content.data.data._id,
          });
        }
      }

      await fetchContents();
      resetForm();
      // Navigate to admin content page after successful creation
      if (!editingContent) {
        navigate("/admin/dashboard/content");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save content");
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm("Are you sure you want to delete this content?"))
      return;

    try {
      await deleteContent(contentId);
      await fetchContents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete content");
    }
  };

  const addSubtopic = () => {
    setFormData({
      ...formData,
      subtopics: [...formData.subtopics, { heading: "", body: "" }],
    });
  };

  const updateSubtopic = (index, field, value) => {
    const updatedSubtopics = [...formData.subtopics];
    updatedSubtopics[index][field] = value;
    setFormData({ ...formData, subtopics: updatedSubtopics });
  };

  const removeSubtopic = (index) => {
    if (formData.subtopics.length > 1) {
      setFormData({
        ...formData,
        subtopics: formData.subtopics.filter((_, i) => i !== index),
      });
    }
  };

  const validateResource = (resource) => {
    if (!resource.name || !resource.name.trim()) {
      return "Resource name is required";
    }
    if (!resource.url || !resource.url.trim()) {
      return "URL is required";
    }
    try {
      new URL(resource.url);
    } catch {
      return "Please enter a valid URL";
    }
    // Check for duplicate URLs
    const duplicate = formData.resources.find(
      (r, idx) =>
        idx !== formData.resources.indexOf(resource) &&
        r.url.toLowerCase() === resource.url.toLowerCase(),
    );
    if (duplicate) {
      return "This URL already exists";
    }
    return null;
  };

  const addResource = () => {
    const newResource = { name: "", url: "", type: "video" };
    setFormData({
      ...formData,
      resources: [...formData.resources, newResource],
    });
    setError("");
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...formData.resources];
    updatedResources[index][field] = value;

    // Auto-detect type from URL
    if (field === "url" && value) {
      let detectedType = "link";
      const url = value.toLowerCase();
      if (
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("vimeo.com")
      ) {
        detectedType = "video";
      } else if (url.endsWith(".pdf")) {
        detectedType = "pdf";
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        detectedType = "image";
      }
      updatedResources[index].type = detectedType;
    }

    setFormData({ ...formData, resources: updatedResources });
  };

  const removeResource = (index) => {
    if (formData.resources.length > 1) {
      setFormData({
        ...formData,
        resources: formData.resources.filter((_, i) => i !== index),
      });
    }
  };

  const addQuiz = () => {
    setFormData({
      ...formData,
      quizzes: [
        ...formData.quizzes,
        { question: "", options: ["", "", "", ""], correctAnswer: 0 },
      ],
    });
  };

  const updateQuiz = (index, field, value) => {
    const updatedQuizzes = [...formData.quizzes];
    if (field === "options") {
      updatedQuizzes[index].options = value;
    } else {
      updatedQuizzes[index][field] = value;
    }
    setFormData({ ...formData, quizzes: updatedQuizzes });
  };

  const removeQuiz = (index) => {
    if (formData.quizzes.length > 1) {
      setFormData({
        ...formData,
        quizzes: formData.quizzes.filter((_, i) => i !== index),
      });
    }
  };

  const toggleRow = (index) => {
    setOpenRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Filter resources based on search and filter
  const filteredResources = useMemo(() => {
    let filtered = formData.resources.filter((resource) => {
      // Name search filter
      const matchesName =
        !searchName ||
        resource.name?.toLowerCase().includes(searchName.toLowerCase());

      // URL search filter
      const matchesUrl =
        !searchUrl ||
        resource.url?.toLowerCase().includes(searchUrl.toLowerCase());

      // Type filter
      const matchesType = filterType === "all" || resource.type === filterType;

      return matchesName && matchesUrl && matchesType;
    });

    return filtered;
  }, [formData.resources, searchName, searchUrl, filterType]);

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchUrl, filterType]);

  // Filter content based on search and filter status
  const filteredContent = contents.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchContent.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "with-resources" &&
        item.resources &&
        item.resources.length > 0) ||
      (filterStatus === "no-resources" &&
        (!item.resources || item.resources.length === 0));
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className={`${theme.textSecondary} font-medium`}>
            Loading content...
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
            Content Management
          </h1>
          <p className={`${theme.textSecondary}`}>
            Create and manage AgriTech Wiki materials for your students
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className={`mt-4 lg:mt-0 px-6 py-3 ${theme.button} rounded-xl hover:scale-105 transition-all duration-200 flex items-center cursor-pointer  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Content
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
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border ${theme.border} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-600 ${theme.input}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className={`${theme.textSecondary} h-5 w-5`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 border ${theme.border} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 cursor-pointer`}
            >
              <option value="all">All Content</option>
              <option value="with-resources">With Resources</option>
              <option value="no-resources">No Resources</option>
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

      {/* Content Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${theme.card} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className={`p-6 border-b ${theme.border}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${theme.text}`}>
                  {editingContent ? "Edit Content" : "Create New Content"}
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
                <div className="md:col-span-2">
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
                    className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200`}
                    placeholder="Enter content title..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-semibold ${theme.text} mb-2`}
                  >
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none`}
                    placeholder="Enter content description..."
                    required
                  />
                </div>
              </div>

              {/* Subtopics */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label
                    className={`block text-lg font-semibold ${theme.text}`}
                  >
                    Subtopics
                  </label>
                  <button
                    type="button"
                    onClick={addSubtopic}
                    className={`px-4 py-2 ${theme.button} rounded-lg hover:scale-105 transition-colors duration-200 cursor-pointer  flex items-center font-medium`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subtopic
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.subtopics.map((subtopic, index) => (
                    <div
                      key={index}
                      className={`${theme.card} rounded-xl p-4 border ${theme.border}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span
                          className={`text-sm font-semibold ${theme.textSecondary} ${theme.card} px-3 py-1 rounded-full`}
                        >
                          Subtopic {index + 1}
                        </span>
                        {formData.subtopics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubtopic(index)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Subtopic heading..."
                          value={subtopic.heading}
                          onChange={(e) =>
                            updateSubtopic(index, "heading", e.target.value)
                          }
                          className={`${theme.input} w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200`}
                        />
                        <textarea
                          placeholder="Subtopic content..."
                          value={subtopic.body}
                          onChange={(e) =>
                            updateSubtopic(index, "body", e.target.value)
                          }
                          rows={3}
                          className={`${theme.input} w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className={`border ${theme.border} rounded-lg`}>
                <div className={`px-4 py-3 border-b ${theme.border}`}>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setResourcesCollapsed(!resourcesCollapsed)}
                      className={`flex items-center cursor-pointer hover:${theme.card} rounded px-2 py-1 transition-colors duration-200`}
                    >
                      {resourcesCollapsed ? (
                        <ChevronRight
                          className={`h-4 w-4 ${theme.textSecondary} mr-2`}
                        />
                      ) : (
                        <ChevronDown
                          className={`h-4 w-4 ${theme.textSecondary} mr-2`}
                        />
                      )}
                      <span className={`text-lg font-semibold ${theme.text}`}>
                        Resources ({formData.resources.length})
                      </span>
                    </button>
                    {!resourcesCollapsed && (
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={addResource}
                          className={`px-3 py-2 ${theme.button} rounded-lg hover:scale-105 transition-colors duration-200 cursor-pointer  flex items-center font-medium`}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Resource
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!resourcesCollapsed && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead
                          className={`${theme.card} ${theme.textSecondary}`}
                        >
                          <tr>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}
                            >
                              S.No
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}
                            >
                              <div className="flex items-center justify-between">
                                <span>Type</span>
                                <select
                                  value={filterType}
                                  onChange={(e) =>
                                    setFilterType(e.target.value)
                                  }
                                  className={`text-xs px-2 py-1 border ${theme.border} rounded focus:ring-1 focus:ring-green-500 focus:border-transparent ${theme.card}`}
                                >
                                  <option value="all">All</option>
                                  <option value="video">Video</option>
                                  <option value="pdf">PDF</option>
                                  <option value="link">Link</option>
                                  <option value="image">Image</option>
                                </select>
                              </div>
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}
                            >
                              <div className="flex items-center justify-between">
                                <span>Resource Name</span>
                                <Search
                                  className={`h-4 w-4 ${theme.textSecondary} cursor-pointer hover:text-green-600`}
                                  onClick={() =>
                                    setActiveSearchColumn(
                                      activeSearchColumn === "name"
                                        ? null
                                        : "name",
                                    )
                                  }
                                />
                              </div>
                              {activeSearchColumn === "name" && (
                                <div className="mt-2 transition-all duration-300 ease-in-out">
                                  <input
                                    type="text"
                                    placeholder="Search names..."
                                    value={searchName}
                                    onChange={(e) =>
                                      setSearchName(e.target.value)
                                    }
                                    className={`w-full px-2 py-1 text-xs border ${theme.border} rounded focus:ring-1 focus:ring-green-500 focus:border-transparent ${theme.input}`}
                                    autoFocus
                                  />
                                </div>
                              )}
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}
                            >
                              <div className="flex items-center justify-between">
                                <span>URL</span>
                                <Search
                                  className={`h-4 w-4 ${theme.textSecondary} cursor-pointer hover:text-green-600`}
                                  onClick={() =>
                                    setActiveSearchColumn(
                                      activeSearchColumn === "url"
                                        ? null
                                        : "url",
                                    )
                                  }
                                />
                              </div>
                              {activeSearchColumn === "url" && (
                                <div className="mt-2 transition-all duration-300 ease-in-out">
                                  <input
                                    type="text"
                                    placeholder="Search URLs..."
                                    value={searchUrl}
                                    onChange={(e) =>
                                      setSearchUrl(e.target.value)
                                    }
                                    className={`w-full px-2 py-1 text-xs border ${theme.border} rounded focus:ring-1 focus:ring-green-500 focus:border-transparent ${theme.input}`}
                                    autoFocus
                                  />
                                </div>
                              )}
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`${theme.card} divide-y ${theme.border.replace("border-", "divide-")}`}
                        >
                          {paginatedResources.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-4 py-8 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                  <LinkIcon
                                    className={`h-12 w-12 ${theme.textSecondary}`}
                                  />
                                  <div>
                                    <h3
                                      className={`text-lg font-medium ${theme.text} mb-1`}
                                    >
                                      {filteredResources.length === 0
                                        ? "No resources found"
                                        : "No resources on this page"}
                                    </h3>
                                    <p
                                      className={`text-sm ${theme.textSecondary} mb-4`}
                                    >
                                      {filteredResources.length === 0
                                        ? searchName ||
                                          searchUrl ||
                                          filterType !== "all"
                                          ? "No resources match your current search and filter criteria."
                                          : "Get started by adding your first resource above."
                                        : "Try navigating to a different page or adjusting your filters."}
                                    </p>
                                    {(searchName ||
                                      searchUrl ||
                                      filterType !== "all") && (
                                      <button
                                        onClick={() => {
                                          setSearchName("");
                                          setSearchUrl("");
                                          setFilterType("all");
                                          setActiveSearchColumn(null);
                                          setCurrentPage(1);
                                        }}
                                        className={`px-4 py-2 ${theme.buttonSecondary} text-sm rounded-lg hover:scale-105 transition-colors duration-200 flex items-center font-medium`}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Clear Filters
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedResources.map((resource, displayIndex) => {
                              const actualIndex = formData.resources.findIndex(
                                (r) => r === resource,
                              );
                              return (
                                <tr
                                  key={actualIndex}
                                  className={`hover:${theme.card}`}
                                >
                                  <td
                                    className={`px-4 py-3 whitespace-nowrap text-sm ${theme.text}`}
                                  >
                                    {(currentPage - 1) * itemsPerPage +
                                      displayIndex +
                                      1}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <select
                                      value={resource.type}
                                      onChange={(e) =>
                                        updateResource(
                                          actualIndex,
                                          "type",
                                          e.target.value,
                                        )
                                      }
                                      className={`text-sm px-2 py-1 border ${theme.border} rounded focus:ring-1 focus:ring-green-500 focus:border-transparent`}
                                    >
                                      <option value="video">🎥 Video</option>
                                      <option value="pdf">📄 PDF</option>
                                      <option value="link">🔗 Link</option>
                                      <option value="image">🖼️ Image</option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={resource.name}
                                      onChange={(e) =>
                                        updateResource(
                                          actualIndex,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className={`${theme.input} w-full px-2 py-1 border ${theme.border} rounded focus:ring-1 focus:ring-green-500 focus:border-transparent`}
                                      placeholder="Resource name..."
                                    />
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <input
                                      type="url"
                                      value={resource.url}
                                      onChange={(e) =>
                                        updateResource(
                                          actualIndex,
                                          "url",
                                          e.target.value,
                                        )
                                      }
                                      className={`${theme.input} w-full px-2 py-1 border ${theme.border} rounded focus:ring-1 focus:ring-green-500 focus:border-transparent`}
                                      placeholder="Resource URL..."
                                    />
                                  </td>
                                  <td
                                    className={`px-4 py-3 whitespace-nowrap text-sm ${theme.textSecondary}`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {resource.url && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            window.open(resource.url, "_blank")
                                          }
                                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                          title="Preview resource"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </button>
                                      )}
                                      {formData.resources.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeResource(actualIndex)
                                          }
                                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                          title="Delete resource"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {totalPages > 1 && paginatedResources.length > 0 && (
                        <div
                          className={`flex items-center justify-between px-4 py-3 ${theme.card} border-t ${theme.border}`}
                        >
                          <div className={`text-sm ${theme.textSecondary}`}>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(
                              currentPage * itemsPerPage,
                              filteredResources.length,
                            )}{" "}
                            of {filteredResources.length} resources
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className={`px-3 py-1 text-sm border ${theme.border} rounded-md ${theme.card} hover:${theme.card} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              Previous
                            </button>
                            <span className={`text-sm ${theme.text}`}>
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages),
                                )
                              }
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 text-sm border ${theme.border} rounded-md ${theme.card} hover:${theme.card} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quizzes */}
              <div className={`border ${theme.border} rounded-lg`}>
                <div className={`px-4 py-3 border-b ${theme.border}`}>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setIsQuizOpen(!isQuizOpen)}
                      className={`flex items-center hover:${theme.card} cursor-pointer rounded px-2 py-1 transition-colors duration-200`}
                    >
                      {isQuizOpen ? (
                        <ChevronDown
                          className={`h-4 w-4 ${theme.textSecondary} mr-2`}
                        />
                      ) : (
                        <ChevronRight
                          className={`h-4 w-4 ${theme.textSecondary} mr-2`}
                        />
                      )}
                      <span className={`text-lg font-semibold ${theme.text}`}>
                        Attach Quiz ({formData.quizzes.length})
                      </span>
                    </button>
                    {isQuizOpen && (
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={addQuiz}
                          className={`px-3 py-2 ${theme.button} rounded-lg hover:scale-105 transition-colors duration-200 flex items-center font-medium`}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Question
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isQuizOpen && (
                  <div className="p-4 transition-all duration-300 ease-in-out">
                    <div className="space-y-4">
                      {(formData.quizzes || []).map((quiz, index) => (
                        <div
                          key={index}
                          className="bg-indigo-50 rounded-xl p-4 border border-indigo-200"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span
                              className={`text-sm font-semibold ${theme.textSecondary} ${theme.card} px-3 py-1 rounded-full`}
                            >
                              Question {index + 1}
                            </span>
                            {formData.quizzes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuiz(index)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Question..."
                              value={quiz.question}
                              onChange={(e) =>
                                updateQuiz(index, "question", e.target.value)
                              }
                              className={`${theme.input} w-full px-3 py-2 border ${theme.border} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400`}
                            />
                            {(quiz.options || []).map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className="flex items-center space-x-2"
                              >
                                <span
                                  className={`text-sm font-medium ${theme.textSecondary} w-8`}
                                >
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}...`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...quiz.options];
                                    newOptions[optIndex] = e.target.value;
                                    updateQuiz(index, "options", newOptions);
                                  }}
                                  className={`${theme.input} flex-1 px-3 py-2 border ${theme.border} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400`}
                                />
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <label
                                className={`text-sm font-medium ${theme.textSecondary}`}
                              >
                                Correct Answer:
                              </label>
                              <select
                                value={quiz.correctAnswer}
                                onChange={(e) =>
                                  updateQuiz(
                                    index,
                                    "correctAnswer",
                                    parseInt(e.target.value),
                                  )
                                }
                                className={`px-3 py-2 border ${theme.border} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200`}
                              >
                                <option value={0}>A</option>
                                <option value={1}>B</option>
                                <option value={2}>C</option>
                                <option value={3}>D</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`flex justify-end space-x-4 pt-6 border-t ${theme.border}`}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-6 py-3 border cursor-pointer ${theme.border} rounded-xl ${theme.text} hover:${theme.card} transition-colors duration-200 font-medium`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="h-5 w-5  mr-2" />
                  {editingContent ? "Update Content" : "Create Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content List */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg overflow-hidden border ${theme.border}`}
      >
        <div className={`px-6 py-5 border-b ${theme.border}`}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowContent(!showContent)}
              className={`flex items-center hover:${theme.card} rounded px-2 py-1 transition-colors duration-200`}
            >
              {showContent ? (
                <ChevronDown
                  className={`h-5 w-5 ${theme.textSecondary} mr-2`}
                />
              ) : (
                <ChevronRight
                  className={`h-5 w-5 ${theme.textSecondary} mr-2`}
                />
              )}
              <div>
                <h2 className={`text-xl cursor-pointer  font-bold ${theme.text}`}>
                  All Content
                </h2>
                <p className={`text-sm ${theme.textSecondary} mt-1`}>
                  {filteredContent.length} of {contents.length} items
                </p>
              </div>
            </button>
            {showContent && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} h-4 w-4`}
                  />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchContent}
                    onChange={(e) => setSearchContent(e.target.value)}
                    className={`${theme.input} pl-10 pr-4 py-2 border ${theme.border} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 w-64`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {showContent && (
          <div className="divide-y divide-gray-200">
            {filteredContent.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen
                  className={`h-16 w-16 ${theme.textSecondary} mx-auto mb-4`}
                />
                <h3 className={`text-lg font-medium ${theme.text} mb-2`}>
                  No content found
                </h3>
                <p className={`${theme.textSecondary} mb-6`}>
                  {searchContent || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first AgriTech Wiki content."}
                </p>
                {!searchContent && filterStatus === "all" && (
                  <button
                    onClick={() => setShowForm(true)}
                    className={`px-6 py-3 ${theme.button} rounded-xl hover:scale-105 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Content
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`w-full border ${theme.border} rounded-lg`}>
                  <thead className={`${theme.card}`}>
                    <tr>
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider w-16`}
                      >
                        S.No
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}
                      >
                        Title
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider w-24`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${theme.card} divide-y ${theme.border}`}>
                    {filteredContent.map((content, index) => (
                      <React.Fragment key={content._id}>
                        {/* Main Row */}
                        <tr
                          className={`hover:${theme.card} transition-colors duration-200`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => toggleRow(content._id)}
                              className={`flex items-center ${theme.textSecondary} hover:${theme.text} transition-colors duration-200`}
                            >
                              {openRows[content._id] ? (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-1" />
                              )}
                              <span className="text-sm font-medium">
                                {index + 1}
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div
                                  className={`text-sm font-medium ${theme.text} truncate`}
                                >
                                  {content.title}
                                </div>
                                <div
                                  className={`flex items-center text-xs ${theme.textSecondary} mt-1`}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(
                                    content.createdAt,
                                  ).toLocaleDateString()}
                                  <User className="h-3 w-3 ml-3 mr-1" />
                                  {content.authorId?.name || "Admin"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            className={`px-4 py-3 whitespace-nowrap text-sm ${theme.textSecondary}`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="relative menu-container">
                                <button
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setMenuPosition({
                                      top: rect.bottom + window.scrollY,
                                      left: rect.right - 192 + window.scrollX,
                                    });
                                    setOpenMenu(
                                      openMenu === content._id
                                        ? null
                                        : content._id,
                                    );
                                  }}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors duration-200"
                                  title="More options"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {openMenu === content._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          handleEdit(content);
                                          setOpenMenu(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Content
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDelete(content._id);
                                          setOpenMenu(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Content
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {openRows[content._id] && (
                          <tr className={`${theme.card}`}>
                            <td colSpan="3" className="px-4 py-4">
                              <div className="space-y-4">
                                {/* Description */}
                                <div>
                                  <h4
                                    className={`text-sm font-medium ${theme.text} mb-2`}
                                  >
                                    Description
                                  </h4>
                                  <p
                                    className={`text-sm ${theme.textSecondary} leading-relaxed`}
                                  >
                                    {content.description}
                                  </p>
                                </div>

                                {/* Subtopics */}
                                {content.subtopics &&
                                  content.subtopics.length > 0 && (
                                    <div>
                                      <h4
                                        className={`text-sm font-medium ${theme.text} mb-2`}
                                      >
                                        Subtopics ({content.subtopics.length})
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {content.subtopics.map(
                                          (subtopic, idx) => (
                                            <span
                                              key={idx}
                                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                                            >
                                              {subtopic.heading}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Resources */}
                                {content.resources &&
                                  content.resources.length > 0 && (
                                    <div>
                                      <h4
                                        className={`text-sm  font-medium ${theme.text} mb-2`}
                                      >
                                        Resources ({content.resources.length})
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {content.resources.map(
                                          (resource, idx) => (
                                            <a
                                              key={idx}
                                              href={resource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full hover:bg-purple-200 transition-colors duration-200 font-medium"
                                            >
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              {resource.label}
                                            </a>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;
