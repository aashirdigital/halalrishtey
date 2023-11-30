const quizModel = require("../models/quizModel");
const userModel = require("../models/userModel");

const addQuizController = async (req, res) => {
  try {
    const existingQuiz = await quizModel.findOne({
      quizName: req.body.quizName,
    });
    if (existingQuiz) {
      return res.status(200).send({
        success: false,
        message: "Duplicate Name: Quiz Already Exist",
      });
    }
    const newQuiz = new quizModel(req.body);
    await newQuiz.save();
    res.status(201).send({ success: true, message: "Quiz Added Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Add Quiz Controller ${error.message}`,
    });
  }
};

const getQuizController = async (req, res) => {
  try {
    const allQuiz = await quizModel.find({ isDeleted: false });
    if (allQuiz.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "Quiz not found" });
    }
    res.status(201).send({
      success: true,
      message: "Quiz Fetched Success",
      data: allQuiz,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Get Quiz Controller ${error.message}`,
    });
  }
};

const getQuizByNameController = async (req, res) => {
  try {
    const quiz = await quizModel.findOne({ quizName: req.body.name });
    if (!quiz) {
      return res
        .status(200)
        .send({ success: false, message: "Quiz not found" });
    }
    res.status(201).send({
      success: true,
      message: "Quiz Fetched Success",
      data: quiz,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Get Quiz By Name Controller ${error.message}`,
    });
  }
};

const deleteQuizController = async (req, res) => {
  try {
    const quiz = await quizModel.findOneAndUpdate(
      { _id: req.body.quizId },
      {
        $set: { isDeleted: true },
      },
      { new: true }
    );
    if (!quiz) {
      return res
        .status(200)
        .send({ success: false, message: "Error Deleting Quiz" });
    }
    res.status(201).send({
      success: true,
      message: "Quiz Deleted Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Delete Quiz Controller ${error.message}`,
    });
  }
};

const updateQuizController = async (req, res) => {
  try {
    const quiz = await quizModel.findOneAndUpdate(
      { _id: req.body.quizId },
      {
        $set: { result: true },
      },
      { new: true }
    );
    if (!quiz) {
      return res
        .status(200)
        .send({ success: false, message: "Error Deleting Quiz" });
    }
    res.status(201).send({
      success: true,
      message: "Result Declared Successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Update Quiz Controller ${error.message}`,
    });
  }
};

const getAllUsersQuizRankingController = async (req, res) => {
  // const quizId = req.body.quizId;
  try {
    const allUser = await userModel.find({ "quiz.quizId": req.body.quizId });
    if (allUser) {
      res
        .status(200)
        .send({ success: true, message: "Fetched Data", data: allUser });
    } else {
      res.status(201).send({ success: false, message: "No data Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Get User Ranking Controller ${error.message}`,
    });
  }
};

module.exports = {
  addQuizController,
  getQuizController,
  deleteQuizController,
  getQuizByNameController,
  updateQuizController,
  getAllUsersQuizRankingController,
};
