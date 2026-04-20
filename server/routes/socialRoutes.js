const express = require("express");
const router = express.Router();
const { saveSocial, getSocial, deleteSocial } = require("../controllers/socialController");

router.post("/social", saveSocial);
router.get("/social", getSocial);
router.delete("/social/:id", deleteSocial);

module.exports = router;