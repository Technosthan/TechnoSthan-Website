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
  UserCheck,
  GraduationCap,
  Crown,
  RefreshCw,
  Calendar,
  Clock,
  Zap,
} from "lucide-react";
import { getAdminStats } from "./adminApi";

const AdminDashboardHome = () => {
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
      setError(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-red-100 rounded-lg mr-3">
            <Activity className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800">
            Error Loading Dashboard
          </h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center font-medium"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      change: stats?.userRoles
        ? `${stats.userRoles.admin || 0} admins, ${stats.userRoles.student || 0} students`
        : "",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Learning Content",
      value: stats?.totalContent || 0,
      icon: BookOpen,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100",
      textColor: "text-emerald-600",
      change: "Available topics",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Quiz Questions",
      value: stats?.totalQuestions || 0,
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      change: "Total questions",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Quiz Attempts",
      value: stats?.totalQuizAttempts || 0,
      icon: Target,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      textColor: "text-orange-600",
      change: "Total submissions",
      trend: "+25%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your AgriTech platform.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div
                  className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    card.trendUp
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <TrendingUp
                    className={`h-3 w-3 mr-1 ${!card.trendUp && "rotate-180"}`}
                  />
                  {card.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {card.value}
                </p>
                <p className={`text-xs font-medium ${card.textColor}`}>
                  {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz Performance */}
        {stats?.quizPerformance && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mr-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Quiz Performance
                </h2>
                <p className="text-sm text-gray-600">
                  Student learning analytics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    Average
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {Math.round(stats.quizPerformance.averageScore || 0)}%
                </p>
                <p className="text-xs text-green-600">Score</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">
                    Attempts
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.quizPerformance.totalAttempts || 0}
                </p>
                <p className="text-xs text-blue-600">Total</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">
                    Highest
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {Math.round(stats.quizPerformance.highestScore || 0)}%
                </p>
                <p className="text-xs text-purple-600">Score</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-100 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-700">
                    Lowest
                  </span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {Math.round(stats.quizPerformance.lowestScore || 0)}%
                </p>
                <p className="text-xs text-orange-600">Score</p>
              </div>
            </div>
          </div>
        )}

        {/* User Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                User Distribution
              </h2>
              <p className="text-sm text-gray-600">Platform user breakdown</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <Crown className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">Administrators</p>
                  <p className="text-sm text-gray-600">Platform managers</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-700">
                {stats?.userRoles?.admin || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">Students</p>
                  <p className="text-sm text-gray-600">Learning users</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-700">
                {stats?.userRoles?.student || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg mr-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Quiz Activity
              </h2>
              <p className="text-sm text-gray-600">
                Latest student quiz attempts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-sm">
                      {activity.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {activity.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.userEmail}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center mb-1">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        activity.percentage >= 80
                          ? "bg-gray-100 text-gray-700"
                          : activity.percentage >= 60
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {activity.score}/{activity.totalQuestions} (
                      {activity.percentage}%)
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(activity.date).toLocaleDateString()}
                    <Clock className="h-3 w-3 ml-3 mr-1" />
                    {new Date(activity.date).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardHome;
