const express = require("express");
const router = express.Router();
const {
  getBusinessVerticals,
} = require("../controllers/businessVerticalController");

router.get("/", getBusinessVerticals);

module.exports = router;
