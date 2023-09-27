const express = require("express");
const controller = require("../controller/flashcards-controller");
const checkAuth = require("../middlewear/check-auth");

const router = express.Router();

router.post("/", checkAuth, controller.createFlashcards);

module.exports = router;