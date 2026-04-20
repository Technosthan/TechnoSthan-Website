import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Brain,
  Save,
  X,
  Search,
  Filter,
  CheckCircle,
  Circle,
  Calendar,
  User,
  Target,
} from "lucide-react";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "./adminApi";

const QuizManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllQuestions();
      setQuestions(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleEdit = (question) => {
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
    });
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.question.trim()) {
      setError("Question is required");
      return;
    }

    if (formData.options.some((option) => !option.trim())) {
      setError("All options must be filled");
      return;
    }

    if (!formData.correctAnswer.trim()) {
      setError("Correct answer is required");
      return;
    }

    if (!formData.options.includes(formData.correctAnswer)) {
      setError("Correct answer must be one of the options");
      return;
    }

    try {
      setError("");
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, formData);
      } else {
        await createQuestion(formData);
      }
      await fetchQuestions();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await deleteQuestion(questionId);
      await fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  const updateOption = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    setFormData({ ...formData, options: updatedOptions });
  };

  // Filter and search questions
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.options.some((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading questions...</p>
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
            Quiz Management
          </h1>
          <p className="text-gray-600">
            Create and manage quiz questions for your students
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Question
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
            />
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

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingQuestion ? "Edit Question" : "Create New Question"}
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
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
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
                        onChange={(e) => updateOption(index, e.target.value)}
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
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  required
                >
                  <option value="">Select the correct answer</option>
                  {formData.options.map(
                    (option, index) =>
                      option.trim() && (
                        <option key={index} value={option}>
                          {String.fromCharCode(65 + index)}. {option}
                        </option>
                      ),
                  )}
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
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingQuestion ? "Update Question" : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Questions</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredQuestions.length} of {questions.length} items
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Quiz Questions
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first quiz question."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Question
                </button>
              )}
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question._id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {question.question}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(question.createdAt).toLocaleDateString()}
                          <User className="h-4 w-4 ml-4 mr-1" />
                          {question.authorId?.name || "Admin"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            option === question.correctAnswer
                              ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-sm"
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            {option === question.correctAnswer ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            )}
                            <div className="flex items-center">
                              <span className="font-bold text-sm mr-2 bg-white px-2 py-1 rounded-full border">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-sm">{option}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                      <Target className="h-4 w-4 mr-1" />
                      Correct Answer: {question.correctAnswer}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit question"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete question"
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

export default QuizManagement;
