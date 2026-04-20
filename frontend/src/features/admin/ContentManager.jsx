import { useState, useEffect } from "react";
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
} from "./adminApi";

const ContentManager = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [resourcesCollapsed, setResourcesCollapsed] = useState(false);
  const [resourceSearch, setResourceSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subtopics: [{ heading: "", body: "" }],
    resources: [{ label: "", url: "" }],
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
      resources: [{ label: "", url: "" }],
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
          ? content.resources
          : [{ label: "", url: "" }],
    });
    setEditingContent(content);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContent) {
        await updateContent(editingContent._id, formData);
      } else {
        await createContent(formData);
      }
      await fetchContents();
      resetForm();
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
      resources: [...formData.resources, { label: "", url: "" }],
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

  // Filter and search contents
  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "with-resources" && content.resources.length > 0) ||
      (filterStatus === "no-resources" && content.resources.length === 0);
    return matchesSearch && matchesFilter;
  });

  // Filter resources based on search
  const filteredResources = formData.resources.filter((_, index) =>
    (index + 1).toString().includes(resourceSearch),
  );

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
              className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
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
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
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
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none"
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
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                        />
                        <textarea
                          placeholder="Subtopic content..."
                          value={subtopic.body}
                          onChange={(e) =>
                            updateSubtopic(index, "body", e.target.value)
                          }
                          rows={3}
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 resize-none"
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
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            type="text"
                            placeholder="Search by resource number..."
                            value={resourceSearch}
                            onChange={(e) => setResourceSearch(e.target.value)}
                            className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 w-64"
                          />
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
                          {resourceSearch
                            ? "Try adjusting your search criteria."
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
                                <tr
                                  key={actualIndex}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {actualIndex + 1}
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
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
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
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
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
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Content</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredContents.length} of {contents.length} items
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Learning Materials
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredContents.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No content found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first learning content."}
              </p>
              {!searchTerm && filterStatus === "all" && (
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
            filteredContents.map((content) => (
              <div
                key={content._id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {content.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(content.createdAt).toLocaleDateString()}
                          <User className="h-4 w-4 ml-4 mr-1" />
                          {content.authorId?.name || "Admin"}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {content.description}
                    </p>

                    {content.subtopics && content.subtopics.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Subtopics ({content.subtopics.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {content.subtopics
                            .slice(0, 3)
                            .map((subtopic, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                              >
                                {subtopic.heading}
                              </span>
                            ))}
                          {content.subtopics.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                              +{content.subtopics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {content.resources && content.resources.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Resources ({content.resources.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {content.resources.map((resource, index) => (
                            <a
                              key={index}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full hover:bg-purple-200 transition-colors duration-200 font-medium"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {resource.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleEdit(content)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit content"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(content._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete content"
                    >
                      <Trash2 className="h-5 w-5" />
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

export default ContentManager;
