import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Search,
  Users,
  BookOpen,
  Brain,
  ExternalLink,
  Calendar,
  Mail,
  User,
  FileText,
  Eye,
} from "lucide-react";
import { globalSearch } from "./adminApi";

const GlobalSearch = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) {
      setError("Please enter at least 2 characters to search");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await globalSearch(query);
      setResults(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getResultCount = (type) => {
    if (!results) return 0;
    switch (type) {
      case "users":
        return results.users?.length || 0;
      case "content":
        return results.content?.length || 0;
      case "quizzes":
        return results.quizzes?.length || 0;
      default:
        return (
          (results.users?.length || 0) +
          (results.content?.length || 0) +
          (results.quizzes?.length || 0)
        );
    }
  };

  const renderUserResults = () => (
    <div className="space-y-4">
      {results.users?.map((user) => (
        <div
          key={user._id}
          className={`${theme.card} p-4 rounded-xl border ${theme.border} hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${theme.text}`}>{user.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <User className="h-4 w-4 mr-1" />
                {user.role} • {user.status} • Joined{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )) || (
        <div className="text-center py-8">
          <Users className={`h-12 w-12 ${theme.textSecondary} mx-auto mb-4`} />
          <p className={`${theme.textSecondary}`}>No users found</p>
        </div>
      )}
    </div>
  );

  const renderContentResults = () => (
    <div className="space-y-4">
      {results.content?.map((content) => (
        <div
          key={content._id}
          className={`${theme.card} p-4 rounded-xl border ${theme.border} hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${theme.text} truncate`}>
                {content.title}
              </h3>
              <p className={`text-sm ${theme.textSecondary} mt-1 line-clamp-2`}>
                {content.description}
              </p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(content.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )) || (
        <div className="text-center py-8">
          <BookOpen
            className={`h-12 w-12 ${theme.textSecondary} mx-auto mb-4`}
          />
          <p className={`${theme.textSecondary}`}>No content found</p>
        </div>
      )}
    </div>
  );

  const renderQuizResults = () => (
    <div className="space-y-4">
      {results.quizzes?.map((quiz) => (
        <div
          key={quiz._id}
          className={`${theme.card} p-4 rounded-xl border ${theme.border} hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${theme.text}`}>{quiz.question}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <FileText className="h-4 w-4 mr-1" />
                Content ID: {quiz.contentId}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(quiz.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      )) || (
        <div className="text-center py-8">
          <Brain className={`h-12 w-12 ${theme.textSecondary} mx-auto mb-4`} />
          <p className={`${theme.textSecondary}`}>No quizzes found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`p-6 w-full space-y-8 ${theme.text}`}>
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
          Global Search
        </h1>
        <p className={`${theme.textSecondary}`}>
          Search across users, content, and quizzes
        </p>
      </div>

      {/* Search Form */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-6 border ${theme.border}`}
      >
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} h-5 w-5`}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for users, content, quizzes..."
              className={`w-full pl-12 pr-4 py-4 border ${theme.border} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-lg ${theme.input}`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Search className="h-5 w-5 mr-2" />
            )}
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <Search className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Search Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div
          className={`${theme.card} rounded-2xl shadow-lg border ${theme.border}`}
        >
          {/* Tabs */}
          <div className={`px-6 py-4 border-b ${theme.border}`}>
            <div className="flex space-x-6">
              {[
                { id: "all", label: "All Results", icon: Search },
                { id: "users", label: "Users", icon: Users },
                { id: "content", label: "Content", icon: BookOpen },
                { id: "quizzes", label: "Quizzes", icon: Brain },
              ].map((tab) => {
                const Icon = tab.icon;
                const count = getResultCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : `${theme.textSecondary} hover:${theme.card}`
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {count > 0 && (
                      <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Content */}
          <div className="p-6">
            {activeTab === "all" && (
              <div className="space-y-8">
                {getResultCount("users") > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}
                    >
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Users ({getResultCount("users")})
                    </h3>
                    {renderUserResults()}
                  </div>
                )}
                {getResultCount("content") > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}
                    >
                      <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                      Content ({getResultCount("content")})
                    </h3>
                    {renderContentResults()}
                  </div>
                )}
                {getResultCount("quizzes") > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}
                    >
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      Quizzes ({getResultCount("quizzes")})
                    </h3>
                    {renderQuizResults()}
                  </div>
                )}
                {getResultCount("all") === 0 && (
                  <div className="text-center py-12">
                    <Search
                      className={`h-16 w-16 ${theme.textSecondary} mx-auto mb-4`}
                    />
                    <h3 className={`text-lg font-medium ${theme.text} mb-2`}>
                      No results found
                    </h3>
                    <p className={`${theme.textSecondary}`}>
                      Try different keywords or check your spelling
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "users" && renderUserResults()}
            {activeTab === "content" && renderContentResults()}
            {activeTab === "quizzes" && renderQuizResults()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
