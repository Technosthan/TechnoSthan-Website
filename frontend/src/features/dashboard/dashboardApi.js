import axiosInstance from "../../shared/lib/axiosInstance";

export const getProfile = () => axiosInstance.get("/api/auth/me");

export const getQuizHistory = () => axiosInstance.get("/api/quiz/results");

export const getAllContent = () => axiosInstance.get("/api/content");

export const getDashboardStats = async () => {
  const [profile, quizResults, content] = await Promise.all([
    getProfile(),
    getQuizHistory(),
    getAllContent(),
  ]);

  // Calculate stats
  const totalQuizzes = quizResults.data.data?.length || 0;
  const averageScore =
    totalQuizzes > 0
      ? quizResults.data.data.reduce(
          (sum, result) => sum + (result.score / result.total) * 100,
          0,
        ) / totalQuizzes
      : 0;

  const totalContent = content.data.data?.length || 0;

  // Recent activity (last 5 quiz results)
  const recentQuizzes = quizResults.data.data?.slice(-5).reverse() || [];

  // Learning progress (mock for now - could be based on viewed content)
  const learningProgress = Math.min(totalQuizzes * 10, 100); // Simple calculation

  return {
    profile: profile.data.data,
    stats: {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      totalContent,
      learningProgress,
    },
    recentActivity: recentQuizzes,
    contentCount: totalContent,
  };
};
