const express = require("express");
const router = express.Router();
const { Platform } = require("../models/Platform");

// GET all platforms
router.get("/", async (req, res) => {
  const data = await Platform.find();
  res.json(data);
});

// ADD / UPDATE platform
router.post("/", async (req, res) => {
  const { name, followers, engagement, posts } = req.body;

  let platform = await Platform.findOne({ name });

  if (platform) {
    platform.followers = followers;
    platform.engagement = engagement;
    platform.posts = posts;
    await platform.save();
  } else {
    platform = await Platform.create(req.body);
  }

  res.json(platform);
});

module.exports = router;