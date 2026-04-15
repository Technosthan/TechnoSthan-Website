import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  quizId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  answers: [
    {
      questionId: String,
      selected: String,
      correct: String
    }
  ]
}, { timestamps: true });

const QuizResult = mongoose.model("QuizResult", quizResultSchema);

export default QuizResult;