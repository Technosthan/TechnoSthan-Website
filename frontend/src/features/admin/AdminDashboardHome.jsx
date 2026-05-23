import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Brain,
  TrendingUp,
  Activity,
  Award,
  Target,
  BarChart3,
  GraduationCap,
  Crown,
  RefreshCw,
  Calendar,
  Clock,
} from "lucide-react";

import { getAdminStats } from "./adminApi";
import { useTheme } from "../../contexts/ThemeContext";

const AdminDashboardHome = () => {
  const { theme, appSettings } = useTheme();

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await getAdminStats();

      setStats(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load statistics",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p
            className={`${theme.textSecondary} font-medium`}
          >
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 shadow-2xl">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-500/20 rounded-2xl mr-3">
              <Activity className="h-5 w-5 text-red-400" />
            </div>

            <h3 className="text-xl font-bold text-red-300">
              Error Loading Dashboard
            </h3>
          </div>

          <p className="text-red-400 mb-5">
            {error}
          </p>

          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all duration-200 flex items-center font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      key: "stats",

      title: "Total Users",

      value: stats?.totalUsers || 0,

      icon: Users,

      color:
        "from-blue-500 to-cyan-600",

      textColor:
        "text-cyan-400",

      change: stats?.userRoles
        ? `${stats.userRoles.admin || 0} admins, ${
            stats.userRoles.student || 0
          } students`
        : "",

      trend: "+12%",

      trendUp: true,
    },

    {
      key: "content",

      title:
        "AgriTech Wiki Content",

      value:
        stats?.totalContent || 0,

      icon: BookOpen,

      color:
        "from-emerald-500 to-green-600",

      textColor:
        "text-emerald-400",

      change:
        "Available topics",

      trend: "+8%",

      trendUp: true,
    },

    {
      key: "quiz",

      title: "Quiz Questions",

      value:
        stats?.totalQuestions || 0,

      icon: Brain,

      color:
        "from-purple-500 to-violet-600",

      textColor:
        "text-purple-400",

      change:
        "Total questions",

      trend: "+15%",

      trendUp: true,
    },

    {
      key: "activity",

      title: "Quiz Attempts",

      value:
        stats?.totalQuizAttempts ||
        0,

      icon: Target,

      color:
        "from-orange-500 to-red-600",

      textColor:
        "text-orange-400",

      change:
        "Total submissions",

      trend: "+25%",

      trendUp: true,
    },
  ];

  const visibleStatCards =
    statCards;

  return (
    <div className="p-6 w-full space-y-8">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1
            className={`text-5xl font-black ${theme.text} mb-3`}
          >
            {appSettings?.appName ||
              "Admin Dashboard"}
          </h1>

          <p
            className={`${theme.textSecondary} text-lg`}
          >
            Welcome back! Here's
            what's happening with
            your AgriTech platform.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="px-7 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-2xl"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh Data
        </button>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {visibleStatCards.map(
          (card, index) => {
            const Icon =
              card.icon;

            return (
              <div
                key={index}
                className={`${theme.card} rounded-3xl p-6 border ${theme.border} shadow-2xl hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${card.color} shadow-xl`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      card.trendUp
                        ? theme.trendUp
                        : theme.trendDown
                    }`}
                  >
                    <TrendingUp
                      className={`h-3 w-3 mr-1 ${
                        !card.trendUp &&
                        "rotate-180"
                      }`}
                    />

                    {card.trend}
                  </div>
                </div>

                <div>
                  <p
                    className={`text-sm font-medium ${theme.textSecondary} mb-1`}
                  >
                    {card.title}
                  </p>

                  <p
                    className={`text-4xl font-black ${theme.text} mb-2`}
                  >
                    {card.value}
                  </p>

                  <p
                    className={`text-xs font-medium ${card.textColor}`}
                  >
                    {card.change}
                  </p>
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* QUIZ PERFORMANCE */}

        {stats?.quizPerformance && (
          <div
            className={`${theme.card} rounded-3xl border ${theme.border} p-6 shadow-2xl`}
          >
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mr-4 shadow-xl">
                <Award className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2
                  className={`text-2xl font-black ${theme.text}`}
                >
                  Quiz Performance
                </h2>

                <p
                  className={`${theme.textSecondary} mt-1`}
                >
                  Student AgriTech
                  analytics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div
                className={`${theme.statCard1} p-5 rounded-2xl border`}
              >
                <div className="flex items-center justify-between mb-3">
                  <BarChart3
                    className={`h-5 w-5 ${theme.statCard1Icon}`}
                  />

                  <span
                    className={`text-xs font-semibold ${theme.statCard1Text}`}
                  >
                    Average
                  </span>
                </div>

                <p
                  className={`text-3xl font-black ${theme.statCard1Text}`}
                >
                  {Math.round(
                    stats
                      .quizPerformance
                      .averageScore ||
                      0,
                  )}
                  %
                </p>

                <p
                  className={`text-xs mt-1 ${theme.statCard1Icon}`}
                >
                  Score
                </p>
              </div>

              <div
                className={`${theme.statCard2} p-5 rounded-2xl border`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Target
                    className={`h-5 w-5 ${theme.statCard2Icon}`}
                  />

                  <span
                    className={`text-xs font-semibold ${theme.statCard2Text}`}
                  >
                    Attempts
                  </span>
                </div>

                <p
                  className={`text-3xl font-black ${theme.statCard2Text}`}
                >
                  {stats
                    .quizPerformance
                    .totalAttempts ||
                    0}
                </p>

                <p
                  className={`text-xs mt-1 ${theme.statCard2Icon}`}
                >
                  Total
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <Award className="h-5 w-5 text-purple-400" />

                  <span className="text-xs font-semibold text-purple-300">
                    Highest
                  </span>
                </div>

                <p className="text-3xl font-black text-purple-300">
                  {Math.round(
                    stats
                      .quizPerformance
                      .highestScore ||
                      0,
                  )}
                  %
                </p>

                <p className="text-xs text-purple-400 mt-1">
                  Score
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="h-5 w-5 text-orange-400" />

                  <span className="text-xs font-semibold text-orange-300">
                    Lowest
                  </span>
                </div>

                <p className="text-3xl font-black text-orange-300">
                  {Math.round(
                    stats
                      .quizPerformance
                      .lowestScore ||
                      0,
                  )}
                  %
                </p>

                <p className="text-xs text-orange-400 mt-1">
                  Score
                </p>
              </div>
            </div>
          </div>
        )}

        {/* USER DISTRIBUTION */}

        <div
          className={`${theme.card} rounded-3xl border ${theme.border} p-6 shadow-2xl`}
        >
          <div className="flex items-center mb-8">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mr-4 shadow-xl">
              <Users className="h-6 w-6 text-white" />
            </div>

            <div>
              <h2
                className={`text-2xl font-black ${theme.text}`}
              >
                User Distribution
              </h2>

              <p
                className={`${theme.textSecondary} mt-1`}
              >
                Platform user
                breakdown
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-6 w-6 text-yellow-400 mr-4" />

                <div>
                  <p className="font-semibold text-white">
                    Administrators
                  </p>

                  <p className="text-sm text-slate-400">
                    Platform managers
                  </p>
                </div>
              </div>

              <span className="text-3xl font-black text-yellow-300">
                {stats?.userRoles
                  ?.admin || 0}
              </span>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center">
                <GraduationCap className="h-6 w-6 text-blue-400 mr-4" />

                <div>
                  <p className="font-semibold text-white">
                    Students
                  </p>

                  <p className="text-sm text-slate-400">
                    AgriTech users
                  </p>
                </div>
              </div>

              <span className="text-3xl font-black text-blue-300">
                {stats?.userRoles
                  ?.student || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}

      {stats?.recentActivity &&
        stats.recentActivity.length >
          0 && (
          <div
            className={`${theme.card} rounded-3xl border ${theme.border} p-6 shadow-2xl`}
          >
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mr-4 shadow-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2
                  className={`text-2xl font-black ${theme.text}`}
                >
                  Recent Quiz
                  Activity
                </h2>

                <p
                  className={`${theme.textSecondary} mt-1`}
                >
                  Latest student
                  quiz attempts
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {stats.recentActivity
                .slice(0, 5)
                .map(
                  (
                    activity,
                    index,
                  ) => (
                    <div
                      key={index}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold">
                            {activity.userName
                              .charAt(
                                0,
                              )
                              .toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {
                              activity.userName
                            }
                          </p>

                          <p className="text-sm text-slate-400">
                            {
                              activity.userEmail
                            }
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end mb-2">
                          <div
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              activity.percentage >=
                              80
                                ? theme.activityGood
                                : activity.percentage >=
                                    60
                                  ? theme.activityMedium
                                  : theme.activityPoor
                            }`}
                          >
                            {
                              activity.score
                            }
                            /
                            {
                              activity.totalQuestions
                            }{" "}
                            (
                            {
                              activity.percentage
                            }
                            %)
                          </div>
                        </div>

                        <div className="flex items-center justify-end text-xs text-slate-400">
                          <Calendar className="h-3 w-3 mr-1" />

                          {new Date(
                            activity.date,
                          ).toLocaleDateString()}

                          <Clock className="h-3 w-3 ml-3 mr-1" />

                          {new Date(
                            activity.date,
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ),
                )}
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboardHome;