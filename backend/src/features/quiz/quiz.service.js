import QuizResult from "./quizResult.model.js";
import Question from "./question.model.js";

export const getQuestions = async () => {
  return await Question.find();
};

export const submitQuiz = async (userId, answers) => {
  const questions = await Question.find();
  let score = 0;

  const evaluatedAnswers = answers.map((ans) => {
    const question = questions.find((q) => q._id.toString() === ans.questionId);

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
