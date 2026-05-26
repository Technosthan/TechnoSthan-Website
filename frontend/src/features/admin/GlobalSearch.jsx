import React, { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";

import { globalSearch } from "./adminApi";

const GlobalSearch = () => {
  const { theme, isDark } = useTheme();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setError("");
      return;
    }

    const delayDebounce = setTimeout(async () => {
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
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

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

  const tabActiveClass = isDark
    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
    : "bg-blue-100 text-blue-700 border border-blue-200";

  const cardHover = isDark
    ? "hover:bg-white/[0.03]"
    : "hover:bg-gray-50";

  const renderUserResults = () => (
    <div className="space-y-4">
      {results.users?.map((user) => (
        <div
          key={user._id}
          className={`
            ${theme.card}
            border
            ${theme.border}
            rounded-2xl
            p-5
            transition-all
            duration-300
            ${cardHover}
          `}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                {user.name}
              </h3>

              <div
                className={`flex items-center gap-2 mt-2 text-sm ${theme.textSecondary}`}
              >
                <Mail className="w-4 h-4" />
                {user.email}
              </div>

              <div
                className={`flex items-center gap-2 mt-1 text-sm ${theme.textSecondary}`}
              >
                <User className="w-4 h-4" />
                {user.role} • {user.status}
              </div>
            </div>
          </div>
        </div>
      ))}

      {(!results.users || results.users.length === 0) && (
        <div className="text-center py-10">
          <Users
            className={`w-14 h-14 mx-auto mb-4 ${theme.textSecondary}`}
          />

          <p className={`${theme.textSecondary}`}>
            No users found
          </p>
        </div>
      )}
    </div>
  );

  const renderContentResults = () => (
    <div className="space-y-4">
      {results.content?.map((content) => (
        <div
          key={content._id}
          className={`
            ${theme.card}
            border
            ${theme.border}
            rounded-2xl
            p-5
            transition-all
            duration-300
            ${cardHover}
          `}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                {content.title}
              </h3>

              <p
                className={`mt-2 text-sm leading-relaxed ${theme.textSecondary}`}
              >
                {content.description}
              </p>

              <div
                className={`flex items-center gap-2 mt-3 text-sm ${theme.textSecondary}`}
              >
                <Calendar className="w-4 h-4" />

                {new Date(content.createdAt).toLocaleDateString()}
              </div>
            </div>

            <button
              className="
                p-3
                rounded-xl
                border
                border-cyan-500/20
                bg-cyan-500/10
                text-cyan-400
                hover:bg-cyan-500/20
                transition-all
              "
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {(!results.content || results.content.length === 0) && (
        <div className="text-center py-10">
          <BookOpen
            className={`w-14 h-14 mx-auto mb-4 ${theme.textSecondary}`}
          />

          <p className={`${theme.textSecondary}`}>
            No content found
          </p>
        </div>
      )}
    </div>
  );

  const renderQuizResults = () => (
    <div className="space-y-4">
      {results.quizzes?.map((quiz) => (
        <div
          key={quiz._id}
          className={`
            ${theme.card}
            border
            ${theme.border}
            rounded-2xl
            p-5
            transition-all
            duration-300
            ${cardHover}
          `}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                {quiz.question}
              </h3>

              <div
                className={`flex items-center gap-2 mt-2 text-sm ${theme.textSecondary}`}
              >
                <FileText className="w-4 h-4" />
                Content ID: {quiz.contentId}
              </div>

              <div
                className={`flex items-center gap-2 mt-2 text-sm ${theme.textSecondary}`}
              >
                <Calendar className="w-4 h-4" />

                {new Date(quiz.createdAt).toLocaleDateString()}
              </div>
            </div>

            <button
              className="
                p-3
                rounded-xl
                border
                border-purple-500/20
                bg-purple-500/10
                text-purple-400
                hover:bg-purple-500/20
                transition-all
              "
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {(!results.quizzes || results.quizzes.length === 0) && (
        <div className="text-center py-10">
          <Brain
            className={`w-14 h-14 mx-auto mb-4 ${theme.textSecondary}`}
          />

          <p className={`${theme.textSecondary}`}>
            No quizzes found
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`p-6 space-y-8 ${theme.text}`}>
      {/* HEADER */}
      <div>
        <h1 className={`text-4xl font-bold ${theme.text}`}>
          Global Search
        </h1>

        <p className={`mt-2 ${theme.textSecondary}`}>
          Search across users, content, and quizzes
        </p>
      </div>

      {/* SEARCH BOX */}
      <div
        className={`
          ${theme.card}
          border
          ${theme.border}
          rounded-3xl
          p-6
          shadow-xl
        `}
      >
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className={`
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                w-5
                h-5
                ${theme.textSecondary}
              `}
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, content, quizzes..."
              className={`
                ${theme.input}
                w-full
                pl-12
                pr-4
                py-4
                rounded-2xl
                text-lg
              `}
            />
          </div>

          <button
            disabled={loading}
            className="
              px-8
              rounded-2xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              hover:from-cyan-600
              hover:to-blue-700
              text-white
              font-semibold
              flex
              items-center
              gap-2
              transition-all
              shadow-lg
            "
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-5 h-5" />
            )}

            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="border border-red-500/20 bg-red-500/10 text-red-400 rounded-2xl p-5">
          {error}
        </div>
      )}

      {/* RESULTS */}
      {results && (
        <div
          className={`
            ${theme.card}
            border
            ${theme.border}
            rounded-3xl
            overflow-hidden
            shadow-xl
          `}
        >
          {/* TABS */}
          <div
            className={`
              p-6
              border-b
              ${theme.border}
              flex
              flex-wrap
              gap-3
            `}
          >
            {[
              {
                id: "all",
                label: "All Results",
                icon: Sparkles,
              },
              {
                id: "users",
                label: "Users",
                icon: Users,
              },
              {
                id: "content",
                label: "Content",
                icon: BookOpen,
              },
              {
                id: "quizzes",
                label: "Quizzes",
                icon: Brain,
              },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-5
                    py-3
                    rounded-2xl
                    border
                    flex
                    items-center
                    gap-2
                    transition-all
                    ${
                      activeTab === tab.id
                        ? tabActiveClass
                        : `${theme.border} ${theme.textSecondary}`
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />

                  {tab.label}

                  <span
                    className="
                      px-2
                      py-1
                      rounded-full
                      text-xs
                      bg-white/10
                    "
                  >
                    {getResultCount(tab.id)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CONTENT */}
          <div className="p-6">
            {activeTab === "all" && (
              <div className="space-y-10">
                {getResultCount("users") > 0 && (
                  <div>
                    <h2
                      className={`
                        text-2xl
                        font-bold
                        mb-5
                        flex
                        items-center
                        gap-2
                        ${theme.text}
                      `}
                    >
                      <Users className="w-6 h-6 text-cyan-400" />
                      Users
                    </h2>

                    {renderUserResults()}
                  </div>
                )}

                {getResultCount("content") > 0 && (
                  <div>
                    <h2
                      className={`
                        text-2xl
                        font-bold
                        mb-5
                        flex
                        items-center
                        gap-2
                        ${theme.text}
                      `}
                    >
                      <BookOpen className="w-6 h-6 text-green-400" />
                      Content
                    </h2>

                    {renderContentResults()}
                  </div>
                )}

                {getResultCount("quizzes") > 0 && (
                  <div>
                    <h2
                      className={`
                        text-2xl
                        font-bold
                        mb-5
                        flex
                        items-center
                        gap-2
                        ${theme.text}
                      `}
                    >
                      <Brain className="w-6 h-6 text-purple-400" />
                      Quizzes
                    </h2>

                    {renderQuizResults()}
                  </div>
                )}

                {getResultCount("all") === 0 && (
                  <div className="text-center py-20">
                    <Search
                      className={`
                        w-16
                        h-16
                        mx-auto
                        mb-4
                        ${theme.textSecondary}
                      `}
                    />

                    <h3
                      className={`text-2xl font-bold ${theme.text}`}
                    >
                      No Results Found
                    </h3>

                    <p className={`mt-2 ${theme.textSecondary}`}>
                      Try searching with different keywords
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