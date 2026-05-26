import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Link as LinkIcon,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
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
  const [searchContent, setSearchContent] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [resourcesCollapsed, setResourcesCollapsed] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const [openRows, setOpenRows] = useState({});
  const [openMenu, setOpenMenu] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [activeSearchColumn, setActiveSearchColumn] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subtopics: [{ heading: "", body: "" }],
    resources: [{ name: "", url: "", type: "video" }],
    quizzes: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ],
  });

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

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);

      const response = await getAllContent();

      setContents(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load content",
      );
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
      quizzes: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    });

    setEditingContent(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (content) => {
    setFormData({
      title: content.title,
      description: content.description,

      subtopics:
        content.subtopics?.length > 0
          ? content.subtopics
          : [{ heading: "", body: "" }],

      resources:
        content.resources?.length > 0
          ? content.resources.map((resource) => ({
              ...resource,
              name:
                resource.name ||
                resource.label ||
                "",
              type: resource.type || "video",
            }))
          : [{ name: "", url: "", type: "video" }],

      quizzes: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    });

    setEditingContent(content);

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
              : [
                  {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                  },
                ],
        }));
      })
      .catch(() => {
        setFormData((prev) => ({
          ...prev,
          quizzes: [
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
            },
          ],
        }));
      });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const resource of formData.resources) {
      if (
        !resource.name.trim() &&
        !resource.url.trim()
      ) {
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
        ? await updateContent(
            editingContent._id,
            contentData,
          )
        : await createContent(contentData);

      await deleteQuestionsByContentId(
        content.data.data._id,
      );

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

      if (!editingContent) {
        navigate("/admin/dashboard/content");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save content",
      );
    }
  };

  const handleDelete = async (contentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this content?",
      )
    )
      return;

    try {
      await deleteContent(contentId);

      await fetchContents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete content",
      );
    }
  };

  const addSubtopic = () => {
    setFormData({
      ...formData,
      subtopics: [
        ...formData.subtopics,
        {
          heading: "",
          body: "",
        },
      ],
    });
  };

  const updateSubtopic = (
    index,
    field,
    value,
  ) => {
    const updated = [...formData.subtopics];

    updated[index][field] = value;

    setFormData({
      ...formData,
      subtopics: updated,
    });
  };

  const removeSubtopic = (index) => {
    if (formData.subtopics.length > 1) {
      setFormData({
        ...formData,
        subtopics: formData.subtopics.filter(
          (_, i) => i !== index,
        ),
      });
    }
  };

  const validateResource = (resource) => {
    if (!resource.name?.trim()) {
      return "Resource name is required";
    }

    if (!resource.url?.trim()) {
      return "Resource URL is required";
    }

    try {
      new URL(resource.url);
    } catch {
      return "Please enter valid URL";
    }

    return null;
  };

  const addResource = () => {
    setFormData({
      ...formData,
      resources: [
        ...formData.resources,
        {
          name: "",
          url: "",
          type: "video",
        },
      ],
    });
  };

  const updateResource = (
    index,
    field,
    value,
  ) => {
    const updated = [...formData.resources];

    updated[index][field] = value;

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
      } else if (
        url.match(
          /\.(jpg|jpeg|png|gif|webp|svg)$/i,
        )
      ) {
        detectedType = "image";
      }

      updated[index].type = detectedType;
    }

    setFormData({
      ...formData,
      resources: updated,
    });
  };

  const removeResource = (index) => {
    if (formData.resources.length > 1) {
      setFormData({
        ...formData,
        resources: formData.resources.filter(
          (_, i) => i !== index,
        ),
      });
    }
  };

  const addQuiz = () => {
    setFormData({
      ...formData,
      quizzes: [
        ...formData.quizzes,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    });
  };

  const updateQuiz = (
    index,
    field,
    value,
  ) => {
    const updated = [...formData.quizzes];

    if (field === "options") {
      updated[index].options = value;
    } else {
      updated[index][field] = value;
    }

    setFormData({
      ...formData,
      quizzes: updated,
    });
  };

  const removeQuiz = (index) => {
    if (formData.quizzes.length > 1) {
      setFormData({
        ...formData,
        quizzes: formData.quizzes.filter(
          (_, i) => i !== index,
        ),
      });
    }
  };

  const toggleRow = (id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredResources = useMemo(() => {
    return formData.resources.filter((resource) => {
      const matchesName =
        !searchName ||
        resource.name
          ?.toLowerCase()
          .includes(searchName.toLowerCase());

      const matchesUrl =
        !searchUrl ||
        resource.url
          ?.toLowerCase()
          .includes(searchUrl.toLowerCase());

      const matchesType =
        filterType === "all" ||
        resource.type === filterType;

      return (
        matchesName &&
        matchesUrl &&
        matchesType
      );
    });
  }, [
    formData.resources,
    searchName,
    searchUrl,
    filterType,
  ]);

  const totalPages = Math.ceil(
    filteredResources.length / itemsPerPage,
  );

  const paginatedResources =
    filteredResources.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

  const filteredContent = contents.filter((item) => {
    const matchesSearch =
      item.title
        .toLowerCase()
        .includes(searchContent.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(searchContent.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "with-resources" &&
        item.resources?.length > 0) ||
      (filterStatus === "no-resources" &&
        item.resources?.length === 0);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p
            className={`${theme.textSecondary} font-medium`}
          >
            Loading Content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full p-6 space-y-8 ${theme.text}`}
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              Content Management
            </h1>
          </div>

          <p className={theme.textSecondary}>
            Create and manage AgriTech Wiki
            materials
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm(true)}
          className={`${theme.button} px-6 py-3 rounded-2xl flex items-center font-semibold shadow-xl`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Content
        </motion.button>
      </div>

      {/* SEARCH */}
      <div
        className={`${theme.card} border ${theme.border} rounded-3xl p-5 shadow-xl`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textSecondary}`}
              size={20}
            />

            <input
              type="text"
              placeholder="Search content..."
              value={searchContent}
              onChange={(e) =>
                setSearchContent(e.target.value)
              }
              className={`${theme.input} w-full pl-12 pr-4 py-4 rounded-2xl border ${theme.border} focus:ring-2 focus:ring-green-500`}
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter
              className={theme.textSecondary}
              size={20}
            />

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
              className={`${theme.input} w-full py-4 px-4 rounded-2xl border ${theme.border}`}
            >
              <option value="all">
                All Content
              </option>

              <option value="with-resources">
                With Resources
              </option>

              <option value="no-resources">
                No Resources
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
          {error}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              className={`${theme.card} w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border ${theme.border}`}
            >
              {/* MODAL HEADER */}
              <div
                className={`sticky top-0 z-20 backdrop-blur-xl ${theme.card} border-b ${theme.border} p-6 flex items-center justify-between`}
              >
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingContent
                      ? "Edit Content"
                      : "Create New Content"}
                  </h2>

                  <p
                    className={`mt-1 text-sm ${theme.textSecondary}`}
                  >
                    Manage content, resources &
                    quizzes
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-8"
              >
                {/* BASIC INFO */}
                <div
                  className={`${theme.card} border ${theme.border} rounded-3xl p-6`}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <FileText className="text-green-500" />

                    <h3 className="text-xl font-bold">
                      Basic Information
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block mb-2 font-medium">
                        Title
                      </label>

                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title:
                              e.target.value,
                          })
                        }
                        placeholder="Enter content title..."
                        className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border}`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">
                        Description
                      </label>

                      <textarea
                        rows={5}
                        value={
                          formData.description
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description:
                              e.target.value,
                          })
                        }
                        placeholder="Enter content description..."
                        className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} resize-none`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SUBTOPICS */}
                <div
                  className={`${theme.card} border ${theme.border} rounded-3xl p-6`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Layers className="text-blue-500" />

                      <h3 className="text-xl font-bold">
                        Subtopics
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={addSubtopic}
                      className={`${theme.button} px-4 py-2 rounded-xl flex items-center`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>

                  <div className="space-y-5">
                    {formData.subtopics.map(
                      (subtopic, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">
                              Subtopic{" "}
                              {index + 1}
                            </span>

                            {formData.subtopics
                              .length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeSubtopic(
                                    index,
                                  )
                                }
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <input
                              type="text"
                              value={
                                subtopic.heading
                              }
                              onChange={(e) =>
                                updateSubtopic(
                                  index,
                                  "heading",
                                  e.target.value,
                                )
                              }
                              placeholder="Subtopic heading..."
                              className={`${theme.input} w-full px-4 py-3 rounded-xl border ${theme.border}`}
                            />

                            <textarea
                              rows={4}
                              value={
                                subtopic.body
                              }
                              onChange={(e) =>
                                updateSubtopic(
                                  index,
                                  "body",
                                  e.target.value,
                                )
                              }
                              placeholder="Subtopic content..."
                              className={`${theme.input} w-full px-4 py-3 rounded-xl border ${theme.border} resize-none`}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* RESOURCES */}
                <div
                  className={`${theme.card} border ${theme.border} rounded-3xl overflow-hidden`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setResourcesCollapsed(
                        !resourcesCollapsed,
                      )
                    }
                    className="w-full flex items-center justify-between px-6 py-5"
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className="text-purple-500" />

                      <h3 className="text-xl font-bold">
                        Resources (
                        {
                          formData.resources
                            .length
                        }
                        )
                      </h3>
                    </div>

                    {resourcesCollapsed ? (
                      <ChevronRight />
                    ) : (
                      <ChevronDown />
                    )}
                  </button>

                  {!resourcesCollapsed && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={addResource}
                          className={`${theme.button} px-4 py-2 rounded-xl flex items-center`}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Resource
                        </button>
                      </div>

                      {formData.resources.map(
                        (
                          resource,
                          index,
                        ) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
                          >
                            <div className="md:col-span-2">
                              <select
                                value={
                                  resource.type
                                }
                                onChange={(
                                  e,
                                ) =>
                                  updateResource(
                                    index,
                                    "type",
                                    e.target
                                      .value,
                                  )
                                }
                                className={`${theme.input} w-full px-3 py-3 rounded-xl border ${theme.border}`}
                              >
                                <option value="video">
                                  🎥 Video
                                </option>

                                <option value="pdf">
                                  📄 PDF
                                </option>

                                <option value="image">
                                  🖼️ Image
                                </option>

                                <option value="link">
                                  🔗 Link
                                </option>
                              </select>
                            </div>

                            <div className="md:col-span-3">
                              <input
                                type="text"
                                value={
                                  resource.name
                                }
                                onChange={(
                                  e,
                                ) =>
                                  updateResource(
                                    index,
                                    "name",
                                    e.target
                                      .value,
                                  )
                                }
                                placeholder="Resource name..."
                                className={`${theme.input} w-full px-4 py-3 rounded-xl border ${theme.border}`}
                              />
                            </div>

                            <div className="md:col-span-6">
                              <input
                                type="url"
                                value={
                                  resource.url
                                }
                                onChange={(
                                  e,
                                ) =>
                                  updateResource(
                                    index,
                                    "url",
                                    e.target
                                      .value,
                                  )
                                }
                                placeholder="Resource URL..."
                                className={`${theme.input} w-full px-4 py-3 rounded-xl border ${theme.border}`}
                              />
                            </div>

                            <div className="md:col-span-1 flex items-center justify-center">
                              {formData.resources
                                .length >
                                1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeResource(
                                      index,
                                    )
                                  }
                                  className="text-red-500 hover:bg-red-50 p-3 rounded-xl"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                {/* QUIZ */}
                <div
                  className={`${theme.card} border ${theme.border} rounded-3xl overflow-hidden`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setIsQuizOpen(
                        !isQuizOpen,
                      )
                    }
                    className="w-full flex items-center justify-between px-6 py-5"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-indigo-500" />

                      <h3 className="text-xl font-bold">
                        Quiz (
                        {
                          formData.quizzes
                            .length
                        }
                        )
                      </h3>
                    </div>

                    {isQuizOpen ? (
                      <ChevronDown />
                    ) : (
                      <ChevronRight />
                    )}
                  </button>

                  {isQuizOpen && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-end mb-5">
                        <button
                          type="button"
                          onClick={addQuiz}
                          className={`${theme.button} px-4 py-2 rounded-xl flex items-center`}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Question
                        </button>
                      </div>

                      <div className="space-y-5">
                        {formData.quizzes.map(
                          (
                            quiz,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/10 p-5"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <span className="font-semibold">
                                  Question{" "}
                                  {index +
                                    1}
                                </span>

                                {formData
                                  .quizzes
                                  .length >
                                  1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeQuiz(
                                        index,
                                      )
                                    }
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              <div className="space-y-4">
                                <input
                                  type="text"
                                  value={
                                    quiz.question
                                  }
                                  onChange={(
                                    e,
                                  ) =>
                                    updateQuiz(
                                      index,
                                      "question",
                                      e.target
                                        .value,
                                    )
                                  }
                                  placeholder="Question..."
                                  className={`${theme.input} w-full px-4 py-3 rounded-xl border ${theme.border}`}
                                />

                                {quiz.options.map(
                                  (
                                    option,
                                    optIndex,
                                  ) => (
                                    <div
                                      key={
                                        optIndex
                                      }
                                      className="flex items-center gap-3"
                                    >
                                      <span className="font-medium w-6">
                                        {String.fromCharCode(
                                          65 +
                                            optIndex,
                                        )}
                                      </span>

                                      <input
                                        type="text"
                                        value={
                                          option
                                        }
                                        onChange={(
                                          e,
                                        ) => {
                                          const updated =
                                            [
                                              ...quiz.options,
                                            ];

                                          updated[
                                            optIndex
                                          ] =
                                            e
                                              .target
                                              .value;

                                          updateQuiz(
                                            index,
                                            "options",
                                            updated,
                                          );
                                        }}
                                        placeholder={`Option ${
                                          optIndex +
                                          1
                                        }`}
                                        className={`${theme.input} flex-1 px-4 py-3 rounded-xl border ${theme.border}`}
                                      />
                                    </div>
                                  ),
                                )}

                                <select
                                  value={
                                    quiz.correctAnswer
                                  }
                                  onChange={(
                                    e,
                                  ) =>
                                    updateQuiz(
                                      index,
                                      "correctAnswer",
                                      parseInt(
                                        e.target
                                          .value,
                                      ),
                                    )
                                  }
                                  className={`${theme.input} px-4 py-3 rounded-xl border ${theme.border}`}
                                >
                                  <option value={0}>
                                    Correct: A
                                  </option>

                                  <option value={1}>
                                    Correct: B
                                  </option>

                                  <option value={2}>
                                    Correct: C
                                  </option>

                                  <option value={3}>
                                    Correct: D
                                  </option>
                                </select>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 font-medium"
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-xl flex items-center"
                  >
                    <Save className="h-5 w-5 mr-2" />

                    {editingContent
                      ? "Update Content"
                      : "Create Content"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT LIST */}
      <div
        className={`${theme.card} border ${theme.border} rounded-3xl overflow-hidden shadow-xl`}
      >
        <div
          className={`p-6 border-b ${theme.border}`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                setShowContent(
                  !showContent,
                )
              }
              className="flex items-center gap-3"
            >
              {showContent ? (
                <ChevronDown />
              ) : (
                <ChevronRight />
              )}

              <div className="text-left">
                <h2 className="text-2xl font-bold">
                  All Content
                </h2>

                <p
                  className={`text-sm ${theme.textSecondary}`}
                >
                  {
                    filteredContent.length
                  }{" "}
                  items
                </p>
              </div>
            </button>
          </div>
        </div>

        {showContent && (
          <div className="overflow-x-auto">
            {filteredContent.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen
                  className={`mx-auto mb-4 ${theme.textSecondary}`}
                  size={60}
                />

                <h3 className="text-xl font-semibold mb-2">
                  No content found
                </h3>

                <p
                  className={
                    theme.textSecondary
                  }
                >
                  Try changing search or
                  filters
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead
                  className={`${theme.card} border-b ${theme.border}`}
                >
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      #
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Content
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredContent.map(
                    (
                      content,
                      index,
                    ) => (
                      <React.Fragment
                        key={
                          content._id
                        }
                      >
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50/40 dark:hover:bg-gray-800/40 transition-all">
                          <td className="px-6 py-5">
                            <button
                              onClick={() =>
                                toggleRow(
                                  content._id,
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              {openRows[
                                content
                                  ._id
                              ] ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}

                              <span className="font-medium">
                                {index +
                                  1}
                              </span>
                            </button>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                                <BookOpen size={20} />
                              </div>

                              <div>
                                <h3 className="font-semibold text-lg">
                                  {
                                    content.title
                                  }
                                </h3>

                                <div
                                  className={`flex items-center gap-4 text-sm mt-1 ${theme.textSecondary}`}
                                >
                                  <div className="flex items-center">
                                    <Calendar
                                      size={
                                        14
                                      }
                                      className="mr-1"
                                    />

                                    {new Date(
                                      content.createdAt,
                                    ).toLocaleDateString()}
                                  </div>

                                  <div className="flex items-center">
                                    <User
                                      size={
                                        14
                                      }
                                      className="mr-1"
                                    />

                                    {content
                                      .authorId
                                      ?.name ||
                                      "Admin"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="relative menu-container">
                              <button
                                onClick={() =>
                                  setOpenMenu(
                                    openMenu ===
                                      content._id
                                      ? null
                                      : content._id,
                                  )
                                }
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {openMenu ===
                                content._id && (
                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                                  <button
                                    onClick={() => {
                                      handleEdit(
                                        content,
                                      );

                                      setOpenMenu(
                                        null,
                                      );
                                    }}
                                    className="w-full px-5 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 flex items-center"
                                  >
                                    <Edit
                                      size={
                                        16
                                      }
                                      className="mr-2"
                                    />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => {
                                      handleDelete(
                                        content._id,
                                      );

                                      setOpenMenu(
                                        null,
                                      );
                                    }}
                                    className="w-full px-5 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center"
                                  >
                                    <Trash2
                                      size={
                                        16
                                      }
                                      className="mr-2"
                                    />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED */}
                        {openRows[
                          content._id
                        ] && (
                          <tr className="bg-gray-50 dark:bg-gray-900/20">
                            <td
                              colSpan="3"
                              className="px-6 py-6"
                            >
                              <div className="space-y-6">
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Description
                                  </h4>

                                  <p
                                    className={
                                      theme.textSecondary
                                    }
                                  >
                                    {
                                      content.description
                                    }
                                  </p>
                                </div>

                                {content
                                  .subtopics
                                  ?.length >
                                  0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3">
                                      Subtopics
                                    </h4>

                                    <div className="flex flex-wrap gap-2">
                                      {content.subtopics.map(
                                        (
                                          subtopic,
                                          idx,
                                        ) => (
                                          <span
                                            key={
                                              idx
                                            }
                                            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
                                          >
                                            {
                                              subtopic.heading
                                            }
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                                {content
                                  .resources
                                  ?.length >
                                  0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3">
                                      Resources
                                    </h4>

                                    <div className="flex flex-wrap gap-3">
                                      {content.resources.map(
                                        (
                                          resource,
                                          idx,
                                        ) => (
                                          <a
                                            key={
                                              idx
                                            }
                                            href={
                                              resource.url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all text-sm font-medium"
                                          >
                                            <ExternalLink
                                              size={
                                                14
                                              }
                                              className="mr-2"
                                            />

                                            {resource.label ||
                                              resource.name}
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
                    ),
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;