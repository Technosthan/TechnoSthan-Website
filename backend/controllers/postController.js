const Post = require("../models/Post");

// CREATE
exports.createPost = async (req, res) => {
  try {
    const data = new Post(req.body);
    await data.save();

    res.json({ msg: "Post Saved", data });
  } catch (err) {
    res.status(500).json({ msg: "Error", err });
  }
};

// GET
exports.getPosts = async (req, res) => {
  const data = await Post.find().sort({ createdAt: -1 });
  res.json(data);
};

// DELETE
exports.deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};