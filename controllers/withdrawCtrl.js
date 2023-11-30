const withdrawModel = require("../models/withdrawModel");
const userModel = require("../models/userModel");

// ADMIN
// get all withdrawals for admin
const getAllWithdrawalsController = async (req, res) => {
  try {
    const withdrawals = await withdrawModel.find({});
    if (!withdrawals) {
      return res.status(200).send({ success: false, message: "No data Found" });
    }
    res.status(201).send({
      success: true,
      message: "Withdrawal Data Fetched",
      data: withdrawals,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add Withdraw ${error.message}`,
    });
  }
};

const approveWithdrawController = async (req, res) => {
  try {
    const withdrawal = await withdrawModel.findOneAndUpdate(
      {
        _id: req.body.id,
      },
      {
        $set: { status: "approved" },
      },
      { new: true }
    );
    if (!withdrawal) {
      return res
        .status(200)
        .send({ success: false, message: "Withdrawal Not Found" });
    }
    res
      .status(201)
      .send({ success: true, message: "Withdrwal Marked as Successful" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add Withdraw ${error.message}`,
    });
  }
};

// USER

// add withdraw of a user
const withdrawController = async (req, res) => {
  try {
    const newWithdraw = new withdrawModel(req.body);
    const withdrawAdded = await newWithdraw.save();
    if (!withdrawAdded) {
      return res
        .status(200)
        .send({ success: false, message: "Failed to withdraw" });
    }
    // Finding user and deducting withdraw amount
    const existingUser = await userModel.findOne({ email: req.body.email });
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          amount: parseInt(existingUser.amount) - req.body.amount,
        },
      },
      {
        new: true,
      }
    );
    res.status(201).send({
      success: true,
      message: "Withdraw Successfull",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add Withdraw ${error.message}`,
    });
  }
};

module.exports = {
  withdrawController,
  getAllWithdrawalsController,
  approveWithdrawController,
};
