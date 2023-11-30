const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  price: {
    type: String,
    required: [true, "price is required"],
  },
  contacts: {
    type: String,
    required: [true, "contacts is required"],
  },
  validity: {
    type: String,
    required: [true, "validity is required"],
  },
});

const planModel = mongoose.model("plan", planSchema);
module.exports = planModel;
