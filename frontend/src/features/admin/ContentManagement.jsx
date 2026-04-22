import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [resourcesCollapsed, setResourcesCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [openRows, setOpenRows] = useState({});
  const [showContent, setShowContent] = useState(false);
  const [searchContent, setSearchContent] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subtopics: [{ heading: "", body: "" }],
    resources: [{ label: "", url: "", type: "video" }],
    quizzes: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
  });

  useEffect(() => {
    fetchContents();
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
      resources: [{ label: "", url: "", type: "video" }],
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
              type: resource.type || "video", // Default to video if type is missing
            }))
          : [{ label: "", url: "", type: "video" }],
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
    try {
      const contentData = {
        title: formData.title,
        description: formData.description,
        subtopics: formData.subtopics,
        resources: formData.resources,
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

  const addResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, { label: "", url: "", type: "video" }],
    });
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...formData.resources];
    updatedResources[index][field] = value;
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

  // Filter resources based on search query and filter type
  const filteredResources = formData.resources.filter((resource, index) => {
    // Search filter: check label and url (case-insensitive)
    const matchesSearch =
      !searchQuery ||
      resource.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.url?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter: check resource type
    const matchesFilter = filterType === "all" || resource.type === filterType;

    return matchesSearch && matchesFilter;
  });

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Content Management
          </h1>
          <p className="text-gray-600">
            Create and manage learning materials for your students
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Content
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingContent ? "Edit Content" : "Create New Content"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-800"
                    placeholder="Enter content title..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none placeholder-gray-400 dark:placeholder-gray-800"
                    placeholder="Enter content description..."
                    required
                  />
                </div>
              </div>

              {/* Subtopics */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">
                    Subtopics
                  </label>
                  <button
                    type="button"
                    onClick={addSubtopic}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subtopic
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.subtopics.map((subtopic, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full">
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
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-800"
                        />
                        <textarea
                          placeholder="Subtopic content..."
                          value={subtopic.body}
                          onChange={(e) =>
                            updateSubtopic(index, "body", e.target.value)
                          }
                          rows={3}
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none placeholder-gray-400 dark:placeholder-gray-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setResourcesCollapsed(!resourcesCollapsed)}
                      className="flex items-center hover:bg-gray-50 rounded px-2 py-1 transition-colors duration-200"
                    >
                      {resourcesCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-gray-600 mr-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-600 mr-2" />
                      )}
                      <span className="text-lg font-semibold text-gray-700">
                        Resources ({formData.resources.length})
                      </span>
                    </button>
                    {!resourcesCollapsed && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                              type="text"
                              placeholder="Search by label or URL..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 w-64"
                            />
                          </div>
                          <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <select
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 w-48"
                            >
                              <option value="all">All Types</option>
                              <option value="video">🎥 Video</option>
                              <option value="pdf">📄 PDF</option>
                              <option value="link">🔗 Link</option>
                              <option value="image">🖼️ Image</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addResource}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center font-medium"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!resourcesCollapsed && (
                  <div className="p-4">
                    {filteredResources.length === 0 ? (
                      <div className="text-center py-8">
                        <LinkIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No resources found
                        </h3>
                        <p className="text-gray-600">
                          {searchQuery || filterType !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Add your first resource to get started."}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resource
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Label
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                URL
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredResources.map((resource) => {
                              const actualIndex = formData.resources.findIndex(
                                (r) => r === resource,
                              );
                              return (
                                <React.Fragment key={actualIndex}>
                                  {/* Resource Header Row - Always Visible */}
                                  <tr
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => toggleRow(actualIndex)}
                                  >
                                    <td colSpan="5" className="px-4 py-3">
                                      <div className="flex items-center">
                                        {openRows[actualIndex] ? (
                                          <ChevronDown className="h-4 w-4 text-gray-600 mr-2" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-gray-600 mr-2" />
                                        )}
                                        <span className="text-sm font-medium text-gray-900">
                                          Resource {actualIndex + 1}
                                        </span>
                                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                          {resource.type
                                            ? resource.type
                                                .charAt(0)
                                                .toUpperCase() +
                                              resource.type.slice(1)
                                            : "Video"}
                                        </span>
                                        {resource.label &&
                                          !openRows[actualIndex] && (
                                            <span className="ml-2 text-xs text-gray-600 truncate max-w-xs">
                                              - {resource.label}
                                            </span>
                                          )}
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Resource Details Row - Only when open */}
                                  {openRows[actualIndex] && (
                                    <tr className="bg-gray-50">
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {actualIndex + 1}
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
                                          className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                        >
                                          <option value="video">
                                            🎥 Video
                                          </option>
                                          <option value="pdf">📄 PDF</option>
                                          <option value="link">🔗 Link</option>
                                          <option value="image">
                                            🖼️ Image
                                          </option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <input
                                          type="text"
                                          value={resource.label}
                                          onChange={(e) =>
                                            updateResource(
                                              actualIndex,
                                              "label",
                                              e.target.value,
                                            )
                                          }
                                          className="text-black w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                          placeholder="Resource label..."
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
                                          className="text-black w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                          placeholder="Resource URL..."
                                        />
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                          {resource.url && (
                                            <a
                                              href={resource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                                              title="View resource"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                            </a>
                                          )}
                                          {formData.resources.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeResource(actualIndex);
                                              }}
                                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                              title="Delete resource"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quizzes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">
                    Attach Quiz
                  </label>
                  <button
                    type="button"
                    onClick={addQuiz}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </button>
                </div>
                <div className="space-y-4">
                  {(formData.quizzes || []).map((quiz, index) => (
                    <div
                      key={index}
                      className="bg-indigo-50 rounded-xl p-4 border border-indigo-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full">
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
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400"
                        />
                        {(quiz.options || []).map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-sm font-medium text-gray-600 w-8">
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
                              className="text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400"
                            />
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-600">
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
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
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

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingContent ? "Update Content" : "Create Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowContent(!showContent)}
              className="flex items-center hover:bg-gray-50 rounded px-2 py-1 transition-colors duration-200"
            >
              {showContent ? (
                <ChevronDown className="h-5 w-5 text-gray-600 mr-2" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600 mr-2" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Content</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredContent.length} of {contents.length} items
                </p>
              </div>
            </button>
            {showContent && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchContent}
                    onChange={(e) => setSearchContent(e.target.value)}
                    className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 w-64"
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
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No content found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchContent || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first learning content."}
                </p>
                {!searchContent && filterStatus === "all" && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Content
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        S.No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContent.map((content, index) => (
                      <React.Fragment key={content._id}>
                        {/* Main Row */}
                        <tr className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => toggleRow(content._id)}
                              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
                                <BookOpen className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {content.title}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
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
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(content)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                                title="Edit content"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(content._id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                                title="Delete content"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {openRows[content._id] && (
                          <tr className="bg-gray-50">
                            <td colSpan="3" className="px-4 py-4">
                              <div className="space-y-4">
                                {/* Description */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    Description
                                  </h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {content.description}
                                  </p>
                                </div>

                                {/* Subtopics */}
                                {content.subtopics &&
                                  content.subtopics.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">
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
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">
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
