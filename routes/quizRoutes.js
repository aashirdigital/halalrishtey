const express = require("express");
const {
  addQuizController,
  getQuizController,
  deleteQuizController,
  getQuizByNameController,
  updateQuizController,
  getAllUsersQuizRankingController,
} = require("../controllers/quizCtrl");

// router object
const router = express.Router();

// routes
// Add Quiz || post
router.post("/add-quiz", addQuizController);
// Get Quiz || post
router.get("/get-quiz", getQuizController);
// Get Single Quiz || post
router.post("/get-quiz-name", getQuizByNameController);
// Delete Quiz || post
router.post("/delete-quiz", deleteQuizController);
// Update Quiz || post
router.post("/update-quiz", updateQuizController);
// Quiz Ranking
router.post("/get-users-ranking", getAllUsersQuizRankingController);

module.exports = router;
