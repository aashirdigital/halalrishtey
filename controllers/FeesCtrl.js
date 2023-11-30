const feesModel = require("../models/feesModel");

// Get fee callback
const getFeesController = async (req, res) => {
  try {
    const fees = await feesModel.find();
    if (!fees) {
      return res.status(404).send({
        success: false,
        message: "No fees found",
      });
    }
    res.status(200).send({
      success: true,
      data: fees,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get Fees Controller ${error.message}`,
    });
  }
};
// Add Fees callback
const addFeesController = async (req, res) => {
  try {
    const newFee = new feesModel({
      activationFees: req.body.fees,
      referAmount: req.body.referAmount,
    });
    // save
    const savedFee = await newFee.save();
    // sending res
    res.status(201).send({
      success: true,
      message: "Data added successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add Fees Controller ${error.message}`,
    });
  }
};

// update fee callback
const updateFeesController = async (req, res) => {
  try {
    const updatedFee = await feesModel.findOneAndUpdate(
      {},
      {
        $set: {
          activationFees: req.body.fees,
          referAmount: req.body.referAmount,
        },
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedFee) {
      return res.status(404).send({
        success: false,
        message: "Fee not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "data updated successfully",
      fee: updatedFee,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add Fees Controller ${error.message}`,
    });
  }
};

module.exports = {
  addFeesController,
  getFeesController,
  updateFeesController,
};
