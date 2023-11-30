const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  quizName: {
    type: String,
    required: [true, "Quiz Name is required"],
  },
  quizPrice: {
    type: String,
    required: [true, "Quiz Price is required"],
  },
  quizTime: {
    type: String,
    required: [true, "Time is required"],
  },
  quizDate: {
    type: String,
    required: [true, "Time is required"],
  },
  result: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  // quizImg: {
  //   type: String,
  //   required: [true, "Quiz Image is required"],
  // },
  questions: {
    type: Array,
  },
});

const quizModel = mongoose.model("quiz", quizSchema);
module.exports = quizModel;
