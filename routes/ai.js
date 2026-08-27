const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

/**
 * @route   POST /ask-ai
 * @desc    Handles AI chat requests via the AI Controller
 * @access  Internal
 */
router.post("/ask-ai", aiController.askAI);
router.post("/generate-questions", aiController.generateQuestions);
router.post("/test-api-key", aiController.testAPIKey);
router.post("/text-to-speech", aiController.textToSpeech);

module.exports = router;


