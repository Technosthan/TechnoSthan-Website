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
    if (!window.confirm("Delete this question?")) return;

    try {
      await deleteQuestion(questionId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        contentId: selectedContentId,
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
      };

      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, payload);
      } else {
        await createQuestion(payload);
      }

      fetchData();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const filteredContents = contents.filter((content) =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 w-full ${theme.text}`}>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className={`text-5xl font-black ${theme.text}`}>
          Quiz Management
        </h1>

        <p className={`mt-3 text-lg ${theme.textSecondary}`}>
          Create and manage quiz questions for your content
        </p>
      </div>

      {/* SEARCH */}
      <div
        className={`${theme.card} border ${theme.border} rounded-3xl p-6 shadow-2xl mb-8`}
      >
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${theme.textSecondary}`}
          />

          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${theme.input} w-full pl-12 pr-4 py-4 rounded-2xl border ${theme.border} focus:ring-2 focus:ring-green-500 outline-none text-white`}
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${theme.card} border ${theme.border} rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto`}
          >
            {/* MODAL HEADER */}
            <div
              className={`flex justify-between items-center p-6 border-b ${theme.border}`}
            >
              <div>
                <h2 className={`text-3xl font-black ${theme.text}`}>
                  {editingQuestion
                    ? "Edit Question"
                    : "Create New Question"}
                </h2>

                <p className={`mt-2 ${theme.textSecondary}`}>
                  Quiz questions belong directly to content
                </p>
              </div>

              <button
                onClick={resetForm}
                className="p-2 rounded-xl hover:bg-white/10 transition"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* SELECTED CONTENT */}
              <div>
                <label
                  className={`block mb-3 font-semibold ${theme.text}`}
                >
                  Selected Content
                </label>

                <div
                  className={`${theme.input} border ${theme.border} rounded-2xl px-5 py-4 text-white bg-slate-800`}
                >
                  {contents.find((c) => c._id === selectedContentId)?.title ||
                    "No content selected"}
                </div>
              </div>

              {/* QUESTION */}
              <div>
                <label
                  className={`block mb-3 font-semibold ${theme.text}`}
                >
                  Question
                </label>

                <textarea
                  rows={4}
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      question: e.target.value,
                    })
                  }
                  placeholder="Enter question..."
                  className={`${theme.input} w-full rounded-2xl border ${theme.border} px-5 py-4 outline-none resize-none text-white`}
                />
              </div>

              {/* OPTIONS */}
              <div>
                <label
                  className={`block mb-4 font-semibold ${theme.text}`}
                >
                  Answer Options
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className={`${theme.card} border ${theme.border} rounded-2xl p-5`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>

                        <span className={`${theme.text}`}>
                          Option {String.fromCharCode(65 + index)}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const updated = [...formData.options];
                          updated[index] = e.target.value;

                          setFormData({
                            ...formData,
                            options: updated,
                          });
                        }}
                        placeholder={`Enter option ${String.fromCharCode(
                          65 + index
                        )}`}
                        className={`${theme.input} w-full rounded-xl border ${theme.border} px-4 py-3 text-white outline-none`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CORRECT ANSWER */}
              <div>
                <label
                  className={`block mb-3 font-semibold ${theme.text}`}
                >
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
                  className={`${theme.input} w-full rounded-2xl border ${theme.border} px-4 py-4 text-white outline-none`}
                >
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                  <option value={2}>C</option>
                  <option value={3}>D</option>
                </select>
              </div>

              {/* ACTIONS */}
              <div
                className={`flex justify-end gap-4 pt-6 border-t ${theme.border}`}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-2xl border border-slate-600 text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition"
                >
                  <Save className="h-5 w-5" />

                  {editingQuestion ? "Update Question" : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUIZ TABLE */}
      <div
        className={`${theme.card} border ${theme.border} rounded-3xl overflow-hidden shadow-2xl`}
      >
        {/* TOP */}
        <div
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => setIsQuizOpen(!isQuizOpen)}
        >
          <div className="flex items-center gap-4">
            {isQuizOpen ? (
              <ChevronDown className="text-slate-400" />
            ) : (
              <ChevronRight className="text-slate-400" />
            )}

            <div>
              <h2 className={`text-3xl font-black ${theme.text}`}>
                All Quiz
              </h2>

              <p className={`${theme.textSecondary}`}>
                {filteredContents.length} of {contents.length} items
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${theme.input} rounded-2xl border ${theme.border} pl-12 pr-4 py-3 text-white w-72 outline-none`}
            />
          </div>
        </div>

        {/* TABLE */}
        {isQuizOpen && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/70 border-y border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-400">#</th>

                  <th className="px-6 py-4 text-left text-slate-400">
                    Content Title
                  </th>

                  <th className="px-6 py-4 text-left text-slate-400">
                    Total Questions
                  </th>

                  <th className="px-6 py-4 text-left text-slate-400">
                    Created Date
                  </th>

                  <th className="px-6 py-4 text-left text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredContents.map((content, contentIndex) => {
                  const contentQuestions = questions.filter(
                    (q) => q.contentId === content._id
                  );

                  return (
                    <React.Fragment key={content._id}>
                      {/* CONTENT ROW */}
                      <tr
                        onClick={() => toggleContentRow(content._id)}
                        className="border-b border-slate-800 hover:bg-white/5 transition cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {openContentRows[content._id] ? (
                              <ChevronDown className="text-slate-400 h-4 w-4" />
                            ) : (
                              <ChevronRight className="text-slate-400 h-4 w-4" />
                            )}

                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold">
                              {contentIndex + 1}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className={`font-semibold ${theme.text}`}>
                            {content.title}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-slate-400">
                          {contentQuestions.length} questions
                        </td>

                        <td className="px-6 py-5 text-slate-400">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddQuestion(content._id);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
                          >
                            <Plus className="h-4 w-4" />
                            Add Question
                          </button>
                        </td>
                      </tr>

                      {/* QUESTIONS */}
                      {openContentRows[content._id] && (
                        <tr>
                          <td
                            colSpan="5"
                            className="bg-slate-950 border-t border-slate-800"
                          >
                            {contentQuestions.length === 0 ? (
                              <div className="text-center py-10">
                                <Brain className="mx-auto h-12 w-12 text-slate-600 mb-4" />

                                <h3 className="text-white text-xl font-semibold">
                                  No questions
                                </h3>

                                <p className="text-slate-400 mt-2">
                                  Add first question for this content
                                </p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto p-6">
                                <table className="w-full border border-slate-800 rounded-2xl overflow-hidden">
                                  <thead className="bg-slate-900">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-slate-400">
                                        #
                                      </th>

                                      <th className="px-4 py-3 text-left text-slate-400">
                                        Question
                                      </th>

                                      <th className="px-4 py-3 text-left text-slate-400">
                                        Options
                                      </th>

                                      <th className="px-4 py-3 text-left text-slate-400">
                                        Correct
                                      </th>

                                      <th className="px-4 py-3 text-left text-slate-400">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {contentQuestions.map((question, qIndex) => (
                                      <tr
                                        key={question._id}
                                        className="border-t border-slate-800 hover:bg-white/5 transition"
                                      >
                                        <td className="px-4 py-4 text-white">
                                          {qIndex + 1}
                                        </td>

                                        <td className="px-4 py-4 text-white">
                                          {question.question}
                                        </td>

                                        <td className="px-4 py-4">
                                          <div className="flex gap-2 flex-wrap">
                                            {question.options.map((opt, i) => (
                                              <span
                                                key={i}
                                                className={`px-2 py-1 rounded-lg text-xs border ${
                                                  i === question.correctAnswer
                                                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                                                    : "bg-slate-800 text-slate-300 border-slate-700"
                                                }`}
                                              >
                                                {String.fromCharCode(65 + i)}
                                              </span>
                                            ))}
                                          </div>
                                        </td>

                                        <td className="px-4 py-4 text-green-400 font-semibold">
                                          {String.fromCharCode(
                                            65 + question.correctAnswer
                                          )}
                                        </td>

                                        <td className="px-4 py-4">
                                          <div className="flex gap-3">
                                            <button
                                              onClick={() =>
                                                handleEditQuestion(question)
                                              }
                                              className="text-blue-400 hover:text-blue-300"
                                            >
                                              <Edit className="h-5 w-5" />
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleDeleteQuestion(
                                                  question._id
                                                )
                                              }
                                              className="text-red-400 hover:text-red-300"
                                            >
                                              <Trash2 className="h-5 w-5" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
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
    </div>
  );
};

export default QuizManagement;