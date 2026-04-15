import {
  getQuestions,
  submitQuiz,
  getResults,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "./quiz.service.js";

export const fetchQuestions = async (req, res) => {
  const questions = await getQuestions();
  res.json({
    success: true,
    data: questions,
  });
};

export const submit = async (req, res) => {
  try {
    const result = await submitQuiz(req.user._id, req.body.answers);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const results = async (req, res) => {
  const data = await getResults(req.user._id);

  res.json({
    success: true,
    data,
  });
};

export const createQuestion = async (req, res) => {
  try {
    const question = await addQuestion(req.body);
    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const editQuestion = async (req, res) => {
  try {
    const question = await updateQuestion(req.params.id, req.body);
    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeQuestion = async (req, res) => {
  try {
    await deleteQuestion(req.params.id);
    res.json({
      success: true,
      message: "Question deleted",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
