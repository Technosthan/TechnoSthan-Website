import { useState, useEffect } from "react";
import { Users, BookOpen, Brain, Target, TrendingUp } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getMonitoringStats } from "./adminApi";

const MonitoringPage = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMonitoringStats();
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load monitoring data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div
        className={`p-6 ${theme.bg} min-h-screen flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-6 ${theme.bg} min-h-screen flex items-center justify-center`}
      >
        <div className={`text-center p-8 ${theme.card} rounded-2xl shadow-lg`}>
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className={`text-xl font-bold mb-2 ${theme.text}`}>
            Error Loading Data
          </h2>
          <p className={`${theme.textSecondary}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme.bg} min-h-screen`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>Monitoring</h1>
        <p className={`${theme.textSecondary}`}>
          Real-time analytics and system overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className={`${theme.card} p-5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-4">
            <Users className={`h-8 w-8 ${theme.accent}`} />
            <span className="text-sm text-green-500 font-medium">+12%</span>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${theme.textSecondary}`}>
            Total Users
          </h3>
          <p className={`text-3xl font-bold ${theme.text}`}>
            {stats?.totalUsers?.toLocaleString() || 0}
          </p>
        </div>

        <div
          className={`${theme.card} p-5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen className={`h-8 w-8 ${theme.accent}`} />
            <span className="text-sm text-blue-500 font-medium">+8%</span>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${theme.textSecondary}`}>
            Total Content
          </h3>
          <p className={`text-3xl font-bold ${theme.text}`}>
            {stats?.totalContent?.toLocaleString() || 0}
          </p>
        </div>

        <div
          className={`${theme.card} p-5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-4">
            <Brain className={`h-8 w-8 ${theme.accent}`} />
            <span className="text-sm text-purple-500 font-medium">+15%</span>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${theme.textSecondary}`}>
            Total Quizzes
          </h3>
          <p className={`text-3xl font-bold ${theme.text}`}>
            {stats?.totalQuizzes?.toLocaleString() || 0}
          </p>
        </div>

        <div
          className={`${theme.card} p-5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-4">
            <Target className={`h-8 w-8 ${theme.accent}`} />
            <span className="text-sm text-orange-500 font-medium">+20%</span>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${theme.textSecondary}`}>
            Quiz Attempts
          </h3>
          <p className={`text-3xl font-bold ${theme.text}`}>
            {stats?.totalQuizAttempts?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className={`${theme.card} p-6 rounded-2xl shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${theme.text}`}>Recent Activity</h2>
          <TrendingUp className={`h-6 w-6 ${theme.accent}`} />
        </div>

        <div className="space-y-4">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${theme.text}`}>
                      Quiz completed by {activity.userName}
                    </p>
                    <p className={`text-sm ${theme.textSecondary}`}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-blue-500 text-sm font-medium">
                  {activity.score}% Score
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className={`${theme.textSecondary}`}>No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
