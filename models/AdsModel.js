const mongoose = require("mongoose");

const adsSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalname: String,
});

const adsModel = mongoose.model("ads", adsSchema);
module.exports = adsModel;
