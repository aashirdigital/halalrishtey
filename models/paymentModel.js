const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
  {
    sequence: {
      type: Number,
      required: true,
      default: 1,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    myTxnId: {
      type: Number,
      required: true,
    },
    payDate: {
      type: String,
      required: true,
    },
    payTxnId: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre("save", async function (next) {
  const doc = this;
  const last = await mongoose
    .model("payments", paymentSchema)
    .findOne({}, {}, { sort: { sequence: -1 } })
    .select("sequence")
    .exec();
  if (last) {
    doc.sequence = last.sequence + 1;
  } else {
    doc.sequence = 1;
  }
  next();
});

paymentSchema.set("autoIndex", true);

const paymentModel = mongoose.model("payments", paymentSchema);
module.exports = paymentModel;
