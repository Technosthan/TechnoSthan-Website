import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getDashboardStats, getChatHistory } from "./dashboardApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTheme } from "../../contexts/ThemeContext";
import {
  User,
  BookOpen,
  HelpCircle,
  MessageCircle,
  LogOut,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Activity,
  Clock,
  Star,
  Bot,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardStats, chatData] = await Promise.all([
          getDashboardStats(),
          getChatHistory().catch(() => ({ data: { data: [] } })), // Handle if chat API fails
        ]);
        setDashboardData(dashboardStats);
        setChatHistory(chatData.data.data || []);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(err.message);
        // Mock data for demonstration
        setDashboardData({
          profile: {
            name: "John Farmer",
            email: "john@example.com",
            role: "student",
            createdAt: new Date(),
          },
          stats: {
            totalQuizzes: 12,
            averageScore: 78,
            totalContent: 25,
            AgriTech WikiProgress: 65,
          },
          recentActivity: [
            { score: 8, total: 10, createdAt: new Date(Date.now() - 86400000) },
            {
              score: 7,
              total: 10,
              createdAt: new Date(Date.now() - 172800000),
            },
            {
              score: 9,
              total: 10,
              createdAt: new Date(Date.now() - 259200000),
            },
            {
              score: 6,
              total: 10,
              createdAt: new Date(Date.now() - 345600000),
            },
            {
              score: 8,
              total: 10,
              createdAt: new Date(Date.now() - 432000000),
            },
          ],
          contentCount: 25,
        });
        setChatHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Prepare chart data
  const quizChartData =
    dashboardData?.recentActivity?.map((quiz, index) => ({
      name: `Quiz ${index + 1}`,
      score: (quiz.score / quiz.total) * 100,
      date: new Date(quiz.createdAt).toLocaleDateString(),
    })) || [];

  const performanceData = [
    { name: "Excellent", value: 20, color: "#10B981" },
    { name: "Good", value: 35, color: "#3B82F6" },
    { name: "Average", value: 30, color: "#F59E0B" },
    { name: "Needs Work", value: 15, color: "#EF4444" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-16 h-16 border-4 ${theme.primary} border-t-transparent rounded-full`}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Oops! Something went wrong
          </h2>
          <p className={`${theme.text}`}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.bgGradient} ${theme.darkBgGradient} transition-colors duration-500`}
    >
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div
            variants={itemVariants}
            className={`${theme.cardOpacity} backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${theme.text}`}>
                  Welcome back, {dashboardData?.profile?.name || "Farmer"}! 👋
                </h2>
                <p className={`${theme.text} opacity-80`}>
                  Ready to continue your agricultural AgriTech Wiki journey?
                </p>
              </div>
            </div>
          </motion.div>
          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Trophy,
                title: "Total Quizzes",
                value: dashboardData?.stats?.totalQuizzes || 0,
                color: "from-yellow-400 to-orange-500",
                bgColor:
                  "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
              },
              {
                icon: Target,
                title: "Average Score",
                value: `${dashboardData?.stats?.averageScore || 0}%`,
                color: "from-blue-400 to-purple-500",
                bgColor:
                  "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
              },
              {
                icon: BookOpen,
                title: "AgriTech Wiki Content",
                value: dashboardData?.stats?.totalContent || 0,
                color: "from-green-400 to-teal-500",
                bgColor:
                  "from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20",
              },
              {
                icon: TrendingUp,
                title: "Progress",
                value: `${dashboardData?.stats?.AgriTech WikiProgress || 0}%`,
                color: "from-purple-400 to-pink-500",
                bgColor:
                  "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${theme.text} opacity-60`}
                    >
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${theme.text}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center`}
                  >
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quiz Performance Chart */}
            <motion.div
              variants={itemVariants}
              className={`${theme.cardOpacity} backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20`}
            >
              <h3
                className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme.text}`}
              >
                <BarChart3 size={24} />
                Quiz Performance Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={quizChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10B981"
                    fill="url(#colorScore)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Performance Distribution */}
            <motion.div
              variants={itemVariants}
              className={`${theme.cardOpacity} backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20`}
            >
              <h3
                className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme.text}`}
              >
                <Award size={24} />
                Performance Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {performanceData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-2 ${theme.cardOpacity} backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20`}
            >
              <h3
                className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.text}`}
              >
                <Activity size={24} />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: BookOpen,
                    title: "Continue AgriTech Wiki",
                    desc: "Explore new agricultural topics",
                    path: "/AgriTech Wiki",
                    color: "from-green-400 to-emerald-500",
                    hoverColor: "hover:from-green-500 hover:to-emerald-600",
                  },
                  {
                    icon: HelpCircle,
                    title: "Take Quiz",
                    desc: "Test your farming knowledge",
                    path: "/quiz",
                    color: "from-blue-400 to-indigo-500",
                    hoverColor: "hover:from-blue-500 hover:to-indigo-600",
                  },
                  {
                    icon: MessageCircle,
                    title: "Ask AI Assistant",
                    desc: "Get instant farming advice",
                    path: "/chat",
                    color: "from-purple-400 to-pink-500",
                    hoverColor: "hover:from-purple-500 hover:to-pink-600",
                  },
                  {
                    icon: BarChart3,
                    title: "IoT Dashboard",
                    desc: "Monitor your farm sensors",
                    path: "/iot",
                    color: "from-orange-400 to-red-500",
                    hoverColor: "hover:from-orange-500 hover:to-red-600",
                  },
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.path)}
                    className={`bg-gradient-to-r ${action.color} ${action.hoverColor} text-white p-6 rounded-xl shadow-lg transition-all duration-300 text-left group`}
                  >
                    <action.icon
                      size={32}
                      className="mb-3 group-hover:scale-110 transition-transform"
                    />
                    <h4 className="font-bold text-lg mb-2">{action.title}</h4>
                    <p className="text-sm opacity-90">{action.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className={`${theme.cardOpacity} backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20`}
            >
              <h3
                className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.text}`}
              >
                <Clock size={24} />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {dashboardData?.recentActivity?.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 ${theme.card} rounded-lg`}
                  >
                    <div
                      className={`w-10 h-10 ${theme.primary} rounded-full flex items-center justify-center`}
                    >
                      <Star className="text-white" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme.text}`}>
                        Quiz Completed
                      </p>
                      <p className={`text-sm ${theme.text} opacity-60`}>
                        Score: {activity.score}/{activity.total} •{" "}
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                )) || (
                  <div className="text-center py-8">
                    <Calendar
                      className="mx-auto mb-3 text-gray-400"
                      size={32}
                    />
                    <p className={`${theme.text} opacity-60`}>
                      No recent activity
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          {/* Chat History Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                <MessageCircle size={24} />
                Recent AI Conversations
              </h3>
              <button
                onClick={() => navigate("/chat")}
                className={`${theme.link} text-sm font-medium transition-colors`}
              >
                Open Chat →
              </button>
            </div>
            <div className="space-y-4">
              {chatHistory.slice(0, 5).map((chat, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                      You asked:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {chat.message}
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                      AI Response:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {chat.response}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(chat.createdAt).toLocaleDateString()} •{" "}
                      {new Date(chat.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              )) || (
                <div className="text-center py-8">
                  <MessageCircle
                    className="mx-auto mb-3 text-gray-400"
                    size={32}
                  />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No chat history yet
                  </p>
                  <button
                    onClick={() => navigate("/chat")}
                    className={`${theme.link} text-sm font-medium transition-colors`}
                  >
                    Start a conversation →
                  </button>
                </div>
              )}
            </div>
          </motion.div>{" "}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
