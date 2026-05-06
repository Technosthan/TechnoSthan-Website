import axiosInstance from "../../shared/lib/axiosInstance";

export const getProfile = () => axiosInstance.get("/api/auth/me");

export const getQuizHistory = () => axiosInstance.get("/api/quiz/results");

export const getAllContent = () => axiosInstance.get("/api/content");

export const getChatHistory = () => axiosInstance.get("/api/chat/history");

export const updateProfile = async (data) => {
  return await axiosInstance.put("/api/auth/update", data);
};

export const sendEmailUpdateOTP = async (newEmail) => {
  return await axiosInstance.post("/api/auth/send-email-update-otp", {
    newEmail,
  });
};

export const verifyEmailUpdateOTP = async (otp) => {
  return await axiosInstance.post("/api/auth/verify-email-update-otp", { otp });
};

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

  // AgriTech Wiki progress (mock for now - could be based on viewed content)
  const agriTechWikiProgress = Math.min(totalQuizzes * 10, 100); // Simple calculation

  return {
    profile: profile.data.data,
    stats: {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      totalContent,
      agriTechWikiProgress,
    },
    recentActivity: recentQuizzes,
    contentCount: totalContent,
  };
};
