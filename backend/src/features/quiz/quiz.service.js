import QuizResult from "./quizResult.model.js";
import Question from "./question.model.js";
import Content from "../content/content.model.js";

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
    correctAnswer: 1, // "To provide water to crops"
  },
  {
    _id: "sample2",
    question:
      "Which nutrient is essential for chlorophyll production in plants?",
    options: ["Nitrogen", "Phosphorus", "Potassium", "Calcium"],
    correctAnswer: 0, // "Nitrogen"
  },
  {
    _id: "sample3",
    question: "What is the ideal pH range for most agricultural crops?",
    options: ["3.0-4.0", "5.5-7.0", "8.0-9.0", "10.0-11.0"],
    correctAnswer: 1, // "5.5-7.0"
  },
  {
    _id: "sample4",
    question: "Which farming practice helps prevent soil erosion?",
    options: ["Monoculture", "Contour plowing", "Overgrazing", "Deforestation"],
    correctAnswer: 1, // "Contour plowing"
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
    correctAnswer: 1, // "Improved soil fertility"
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

    if (!question) {
      console.error(`Question not found for ID: ${ans.questionId}`);
      return {
        questionId: ans.questionId,
        selected: ans.selected,
        correct: null,
        error: "Question not found",
      };
    }

    // SAFE COMPARISON: Convert both to numbers for index-based comparison
    const correctAnswerNum = Number(question.correctAnswer);
    const selectedAnswerNum = Number(ans.selected);

    // Validate ranges (0-3 for 4 options)
    const isValidCorrect = correctAnswerNum >= 0 && correctAnswerNum <= 3;
    const isValidSelected = selectedAnswerNum >= 0 && selectedAnswerNum <= 3;

    if (!isValidCorrect || !isValidSelected) {
      console.error(
        `Invalid answer range - Correct: ${correctAnswerNum}, Selected: ${selectedAnswerNum}`,
      );
    }

    const isCorrect =
      isValidCorrect &&
      isValidSelected &&
      correctAnswerNum === selectedAnswerNum;

    if (isCorrect) score++;

    return {
      questionId: ans.questionId,
      selected: selectedAnswerNum,
      correct: correctAnswerNum,
      isCorrect,
    };
  });

  const resultPayload = {
    userId: userId || null,
    quizId: "quiz1", // This could be dynamic if you have multiple quizzes
    score,
    total: questions.length,
    answers: evaluatedAnswers,
  };

  if (!userId) {
    return resultPayload;
  }

  const result = await QuizResult.create(resultPayload);
  return result;
};

export const getResults = async (userId) => {
  if (!userId) {
    return [];
  }

  return await QuizResult.find({ userId });
};

export const getQuestionsByContentId = async (contentId) => {
  try {
    const questions = await Question.find({ contentId });
    return questions;
  } catch (error) {
    console.error("Error fetching questions by contentId:", error);
    return [];
  }
};

export const deleteQuestionsByContentId = async (contentId) => {
  return await Question.deleteMany({ contentId });
};

export const addQuestion = async (data) => {
  console.log("addQuestion called with data:", data);
  try {
    // VALIDATION: Quiz questions are ONLY created at content level
    console.log("Looking for content with ID:", data.contentId);
    const content = await Content.findById(data.contentId);
    console.log("Content found:", !!content, content?._id);

    if (!content) {
      console.log("Content not found, throwing error");
      throw new Error("Invalid content ID");
    }

    // VALIDATE: Ensure correctAnswer is a valid index (0-3)
    const correctAnswerNum = Number(data.correctAnswer);
    if (
      isNaN(correctAnswerNum) ||
      correctAnswerNum < 0 ||
      correctAnswerNum > 3
    ) {
      throw new Error(
        "correctAnswer must be a number between 0 and 3 (inclusive)",
      );
    }

    // VALIDATE: Ensure options array has exactly 4 items
    if (!Array.isArray(data.options) || data.options.length !== 4) {
      throw new Error("Options must be an array with exactly 4 items");
    }

    console.log("Creating question...");
    // No topic validation needed - quizzes are content-level only
    const question = await Question.create({
      contentId: data.contentId,
      question: data.question,
      options: data.options,
      correctAnswer: correctAnswerNum, // Store as number
    });
    console.log("Question created successfully:", question._id);
    return question;
  } catch (error) {
    console.error("Error in addQuestion:", error);
    throw error; // Re-throw to be caught by controller
  }
};

export const updateQuestion = async (id, data) => {
  // VALIDATION: Ensure content exists if contentId is being updated
  if (data.contentId) {
    const content = await Content.findById(data.contentId);
    if (!content) {
      throw new Error("Invalid content ID");
    }
  }

  // VALIDATE: Ensure correctAnswer is a valid index (0-3) if provided
  if (data.correctAnswer !== undefined) {
    const correctAnswerNum = Number(data.correctAnswer);
    if (
      isNaN(correctAnswerNum) ||
      correctAnswerNum < 0 ||
      correctAnswerNum > 3
    ) {
      throw new Error(
        "correctAnswer must be a number between 0 and 3 (inclusive)",
      );
    }
    data.correctAnswer = correctAnswerNum; // Ensure it's stored as number
  }

  // VALIDATE: Ensure options array has exactly 4 items if provided
  if (
    data.options &&
    (!Array.isArray(data.options) || data.options.length !== 4)
  ) {
    throw new Error("Options must be an array with exactly 4 items");
  }

  // No topic validation needed - quizzes are content-level only
  const updatedQuestion = await Question.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!updatedQuestion) {
    throw new Error("Question not found");
  }

  return updatedQuestion;
};

export const deleteQuestion = async (id) => {
  return await Question.findByIdAndDelete(id);
};
