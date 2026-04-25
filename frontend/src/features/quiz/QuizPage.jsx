import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getQuestionsByContentId, submitQuiz } from "./quizApi";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Brain,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  RotateCcw,
} from "lucide-react";

const QuizPage = () => {
  const { theme } = useTheme();
  const { contentId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestionsByContentId(contentId);
        setQuestions(response.data.data);
        // Initialize answers object with null (not empty string)
        const initialAnswers = {};
        response.data.data.forEach((q) => {
          initialAnswers[q._id] = null; // Use null instead of "" to distinguish from index 0
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error("Quiz Error:", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load quiz questions";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (contentId) {
      fetchQuestions();
    }
  }, [contentId]);

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered - FIX: Use proper null/undefined check
    const unanswered = questions.filter(
      (q) =>
        answers[q._id] === undefined ||
        answers[q._id] === null ||
        answers[q._id] === "",
    );
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(
        ([questionId, selected]) => ({
          questionId,
          selected,
        }),
      );
      const response = await submitQuiz(answersArray);
      setResults(response.data.data);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit Error:", err);
      setError("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSubmitted(false);
    setResults(null);
    // Reset answers to null (not empty string)
    const resetAnswers = {};
    questions.forEach((q) => {
      resetAnswers[q._id] = null;
    });
    setAnswers(resetAnswers);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl text-blue-500"
        >
          🧠
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <div className="text-xl text-red-600 dark:text-red-400 text-center">
          <XCircle className="mx-auto mb-4" size={48} />
          {error}
        </div>
      </div>
    );
  }

  if (submitted && results) {
    const score = results.score;
    const total = results.total;
    const percentage = Math.round((score / total) * 100);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen ${theme.bgGradient} ${theme.darkBgGradient} ${theme.text}`}
      >
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <Trophy className="mx-auto mb-4 text-yellow-500" size={64} />
            <h1 className={`text-4xl font-bold ${theme.accent}`}>
              Quiz Results
            </h1>
            <div className="mt-6">
              <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                {percentage}%
              </div>
              <p className="text-xl">
                You scored {score} out of {total} questions correctly!
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className={`${theme.card} p-6 rounded-xl shadow-lg`}>
              <h2 className={`text-2xl font-semibold mb-4 ${theme.accent}`}>
                Question Review
              </h2>
              <div className="space-y-4">
                {results.answers.map((answer, idx) => {
                  const question = questions.find(
                    (q) => q._id === answer.questionId,
                  );
                  const isCorrect = answer.selected === answer.correct;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className={`p-4 rounded-lg border-l-4 ${
                        isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {isCorrect ? (
                          <CheckCircle
                            className="text-green-500 mr-2"
                            size={20}
                          />
                        ) : (
                          <XCircle className="text-red-500 mr-2" size={20} />
                        )}
                        <h3 className="font-semibold">{question.question}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your answer:{" "}
                        <span className="font-medium">{answer.selected}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Correct answer:{" "}
                          <span className="font-medium text-green-600">
                            {answer.correct}
                          </span>
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleRetake}
              className={`mt-6 w-full ${theme.button} font-semibold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center`}
            >
              <RotateCcw className="mr-2" size={20} />
              Take Quiz Again
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${theme.bgGradient} ${theme.darkBgGradient} ${theme.text}`}
    >
      <div className="container mx-auto p-6">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-4xl font-bold mb-6 ${theme.accent} flex items-center justify-center`}
        >
          <Brain className="mr-3" size={40} />
          Knowledge Quiz
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="ml-2"
          >
            🧠
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className={`${theme.card} p-6 rounded-xl shadow-lg`}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  Questions ({questions.length})
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Answer all questions to submit
                </div>
              </div>

              <div className="space-y-6">
                {questions.map((question, idx) => (
                  <motion.div
                    key={question._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
                  >
                    <h3 className="font-semibold mb-4 text-lg">
                      {idx + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center p-3 ${theme.card} rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            value={optIdx}
                            checked={answers[question._id] === optIdx}
                            onChange={() =>
                              handleAnswerChange(question._id, optIdx)
                            }
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-semibold mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full ${theme.button} disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center`}
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mr-2"
                  >
                    ⟳
                  </motion.div>
                  Submitting...
                </>
              ) : (
                <>
                  <Target className="mr-2" size={20} />
                  Submit Quiz
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuizPage;
