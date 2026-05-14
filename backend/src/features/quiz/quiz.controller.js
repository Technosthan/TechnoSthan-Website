import {
  getQuestions,
  submitQuiz,
  getResults,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByContentId,
  deleteQuestionsByContentId,
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
    const userId = req.user?._id || null;
    const result = await submitQuiz(userId, req.body.answers);

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
  if (!req.user) {
    return res.json({
      success: true,
      data: [],
    });
  }

  const data = await getResults(req.user._id);

  res.json({
    success: true,
    data,
  });
};

export const createQuestion = async (req, res) => {
  try {
    console.log("Creating question with data:", req.body);
    const question = await addQuestion(req.body);
    console.log("Question created:", question);
    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    // In Express 5, make sure to handle async errors properly
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      // If headers already sent, we can't send another response
      console.error("Headers already sent, cannot send error response");
    }
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

export const fetchQuestionsByContentId = async (req, res) => {
  const { contentId } = req.params;
  const questions = await getQuestionsByContentId(contentId);
  res.json({
    success: true,
    data: questions,
  });
};

export const removeQuestionsByContentId = async (req, res) => {
  try {
    const { contentId } = req.params;
    await deleteQuestionsByContentId(contentId);
    res.json({
      success: true,
      message: "Questions deleted",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
