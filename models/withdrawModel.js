const mongoose = require("mongoose");

const WithdrawSchema = new mongoose.Schema({
  amount: {
    type: String,
    required: [true, "amount is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  paymentDetails: {
    type: Object,
    required: [true, "paymentMethod is required"],
  },
  method: {
    type: String,
    required: [true, "method is required"],
  },
  status: {
    type: String,
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const withdrawModel = mongoose.model("withdrawal", WithdrawSchema);
module.exports = withdrawModel;
