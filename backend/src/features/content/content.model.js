import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  subtopics: [
    {
      heading: String,
      body: String
    }
  ],
  resources: [
    {
      label: String,
      url: String
    }
  ],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

const Content = mongoose.model("Content", contentSchema);

export default Content;