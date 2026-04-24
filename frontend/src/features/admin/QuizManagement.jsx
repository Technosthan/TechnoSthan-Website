import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Plus,
  Edit,
  Trash2,
  Brain,
  Save,
  X,
  Search,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "./adminApi";
import { getAllContent } from "../content/contentApi";

const QuizManagement = () => {
  const { theme } = useTheme();
  const [contents, setContents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openContentRows, setOpenContentRows] = useState({});
  const [selectedContentId, setSelectedContentId] = useState("");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contentRes, questionRes] = await Promise.all([
        getAllContent(),
        getAllQuestions(),
      ]);
      setContents(contentRes.data.data || []);
      setQuestions(questionRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    setSelectedContentId("");
    setEditingQuestion(null);
    setShowForm(false);
  };

  const toggleContentRow = (contentId) => {
    setOpenContentRows((prev) => ({
      ...prev,
      [contentId]: !prev[contentId],
    }));
  };

  // QUIZ CREATION AT CONTENT LEVEL ONLY
  const handleAddQuestion = (contentId) => {
    setSelectedContentId(contentId);
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEditQuestion = (question) => {
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
    });
    setSelectedContentId(question.contentId);
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await deleteQuestion(questionId);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!selectedContentId) {
      setError("Please select a content for the question");
      return;
    }

    if (!formData.question.trim()) {
      setError("Question is required");
      return;
    }

    if (formData.options.some((option) => !option.trim())) {
      setError("All options must be filled");
      return;
    }

    try {
      const questionData = {
        contentId: selectedContentId,
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
      };
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, questionData);
      } else {
        await createQuestion(questionData);
      }
      await fetchData();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    }
  };

  // Filter contents based on search
  const filteredContents = contents.filter((content) => {
    const matchesTitle = content.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTitle;
  });

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading questions...</p>
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
            Quiz Management
          </h1>
          <p className={`${theme.textSecondary}`}>
            Create and manage quiz questions for your content
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-linear-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingQuestion ? "Edit Question" : "Create New Question"}
                </h2>
                <div className="text-sm text-green-600 font-medium">
                  Content-Level Quiz
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Quiz questions belong directly to content.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selected Content
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl">
                    {contents.find((c) => c._id === selectedContentId)?.title ||
                      "No content selected"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none"
                  placeholder="Enter the quiz question..."
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Answer Options
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                          Option {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                        placeholder={`Enter option ${String.fromCharCode(65 + index)}...`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correct Answer
                </label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      correctAnswer: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  required
                >
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                  <option value={2}>C</option>
                  <option value={3}>D</option>
                </select>
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
                  className="px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingQuestion ? "Update Question" : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Quiz Overview - SIMPLIFIED: Content → Questions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div
          onClick={() => setIsQuizOpen(!isQuizOpen)}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-lg">
              {isQuizOpen ? "▼" : "▶"}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Quiz</h2>
              <p className="text-sm text-gray-500">
                {filteredContents.length} of {contents.length} items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 w-64"
              />
            </div>
          </div>
        </div>

        {isQuizOpen && (
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No content found
                        </h3>
                        <p className="text-gray-600">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "Create content first to add quiz questions."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredContents.map((content, contentIndex) => {
                      const contentQuestions = questions.filter(
                        (q) => q.contentId === content._id,
                      );
                      return (
                        <React.Fragment key={content._id}>
                          {/* Content Row */}
                          <tr
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleContentRow(content._id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {openContentRows[content._id] ? (
                                  <ChevronDown className="h-4 w-4 text-gray-600 mr-2" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-600 mr-2" />
                                )}
                                <div className="w-8 h-8 bg-linear-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {contentIndex + 1}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {content.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {contentQuestions.length} questions
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(content.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddQuestion(content._id);
                                  }}
                                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center text-xs"
                                  title="Add quiz question to this content"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Question
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Questions Table */}
                          {openContentRows[content._id] && (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                {contentQuestions.length === 0 ? (
                                  <div className="text-center py-8">
                                    <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                      No questions for this content
                                    </h3>
                                    <p className="text-gray-600">
                                      Add the first question for "
                                      {content.title}"
                                    </p>
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-200 rounded-lg">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            #
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Question
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Options (A/B/C/D)
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Correct Answer
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {contentQuestions.map(
                                          (question, qIndex) => (
                                            <tr
                                              key={question._id}
                                              className="hover:bg-gray-50"
                                            >
                                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {qIndex + 1}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                                                {question.question}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-500">
                                                <div className="flex flex-wrap gap-1">
                                                  {question.options.map(
                                                    (opt, i) => (
                                                      <span
                                                        key={i}
                                                        className={`px-2 py-1 rounded text-xs ${
                                                          i ===
                                                          question.correctAnswer
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-600"
                                                        }`}
                                                      >
                                                        {String.fromCharCode(
                                                          65 + i,
                                                        )}
                                                      </span>
                                                    ),
                                                  )}
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-sm text-green-600 font-medium">
                                                {String.fromCharCode(
                                                  65 + question.correctAnswer,
                                                )}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                  <button
                                                    onClick={() =>
                                                      handleEditQuestion(
                                                        question,
                                                      )
                                                    }
                                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                  >
                                                    <Edit className="h-4 w-4" />
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      handleDeleteQuestion(
                                                        question._id,
                                                      )
                                                    }
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManagement;
