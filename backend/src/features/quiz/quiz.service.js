import QuizResult from "./quizResult.model.js";
import Question from "./question.model.js";

const sampleQuestions = [
  {
    _id: "sample1",
    question: "What is the primary purpose of irrigation in agriculture?",
    options: [
      "To increase soil temperature",
      "To provide water to crops",
      "To control pests",
      "To improve soil texture",
    ],
    correctAnswer: "To provide water to crops",
  },
  {
    _id: "sample2",
    question:
      "Which nutrient is essential for chlorophyll production in plants?",
    options: ["Nitrogen", "Phosphorus", "Potassium", "Calcium"],
    correctAnswer: "Nitrogen",
  },
  {
    _id: "sample3",
    question: "What is the ideal pH range for most agricultural crops?",
    options: ["3.0-4.0", "5.5-7.0", "8.0-9.0", "10.0-11.0"],
    correctAnswer: "5.5-7.0",
  },
  {
    _id: "sample4",
    question: "Which farming practice helps prevent soil erosion?",
    options: ["Monoculture", "Contour plowing", "Overgrazing", "Deforestation"],
    correctAnswer: "Contour plowing",
  },
  {
    _id: "sample5",
    question: "What is the main benefit of crop rotation?",
    options: [
      "Increased water usage",
      "Improved soil fertility",
      "Higher pesticide needs",
      "Reduced crop yield",
    ],
    correctAnswer: "Improved soil fertility",
  },
];

export const getQuestions = async () => {
  try {
    const questions = await Question.find();
    if (questions.length === 0) {
      return sampleQuestions;
    }
    return questions;
  } catch (error) {
    console.error("Error fetching questions from database:", error);
    // Return sample questions as fallback
    return sampleQuestions;
  }
};

export const submitQuiz = async (userId, answers) => {
  const dbQuestions = await Question.find();
  const questions = dbQuestions.length > 0 ? dbQuestions : sampleQuestions;

  let score = 0;

  const evaluatedAnswers = answers.map((ans) => {
    const question = questions.find(
      (q) => q._id.toString() === ans.questionId || q._id === ans.questionId,
    );

    const isCorrect = question.correctAnswer === ans.selected;

    if (isCorrect) score++;

    return {
      questionId: ans.questionId,
      selected: ans.selected,
      correct: question.correctAnswer,
    };
  });

  const result = await QuizResult.create({
    userId,
    quizId: "quiz1", // This could be dynamic if you have multiple quizzes
    score,
    total: questions.length,
    answers: evaluatedAnswers,
  });

  return result;
};

export const getResults = async (userId) => {
  return await QuizResult.find({ userId });
};

export const addQuestion = async (data) => {
  return await Question.create(data);
};

export const updateQuestion = async (id, data) => {
  return await Question.findByIdAndUpdate(id, data, { new: true });
};

export const deleteQuestion = async (id) => {
  return await Question.findByIdAndDelete(id);
};
