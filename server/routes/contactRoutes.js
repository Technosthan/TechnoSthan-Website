const express = require("express");
const router = express.Router();
const { createContact } = require("../controllers/ContactController");

router.post("/contact", createContact);


module.exports = router;