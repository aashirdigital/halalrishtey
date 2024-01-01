const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const UserModel = require("../models/userModel");
const PaymentModel = require("../models/paymentModel");
const userModel = require("../models/userModel");
const fs = require("fs");

// router object
const router = express.Router();

//! Change failure & success url for production
// payment route
router.post("/get-hashkey", async (req, res) => {
  try {
    const data = {
      key: "Rlram3",
      salt: "nS8MxUzcG4A7ziRJBBuURvvDpEAsGRCx",
      txnid: req.body.txnid,
      amount: req.body.amount,
      productinfo: req.body.productinfo,
      firstname: req.body.firstname,
      email: req.body.email,
      phone: req.body.phone,
      udf1: req.body.contacts,
      udf2: req.body.validity,
    };
    const cryp = crypto.createHash("sha512");
    // const string = key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const text =
      data.key +
      "|" +
      data.txnid +
      "|" +
      data.amount +
      "|" +
      data.productinfo +
      "|" +
      data.firstname +
      "|" +
      data.email +
      "|" +
      data.udf1 +
      "|" +
      data.udf2 +
      "|||||||||" +
      data.salt;
    cryp.update(text);
    const hash = cryp.digest("hex");
    res.status(200).send({
      hash: hash,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// if payment failed
router.post("/failure", async (req, res) => {
  if (req.body.status === "failure") {
    const name = req.body.firstname;
    const email = req.body.email;
    const number = req.body.phone;
    const hash = req.body.hash;
    const plan = req.body.productinfo;
    const amount = req.body.amount;
    const myTxnId = req.body.txnid;
    const payDate = req.body.addedon;
    const payTxnId = req.body.mihpayid;
    const contacts = req.body.udf1;
    const premiumValidityMonths = req.body.udf2;
    const status = "failed";

    const payment = await PaymentModel.findOne({ myTxnId: req.body.txnid });
    if (!payment) {
      const newPayment = new PaymentModel({
        name,
        email,
        number,
        amount,
        plan,
        hash,
        myTxnId,
        payDate,
        payTxnId,
        contacts,
        status,
        premiumValidityMonths,
      });
      await newPayment.save();
    }
  }
  res.redirect("https://halalrishtey.com/user-dashboard");
});

// if payment success
router.post("/success", async (req, res) => {
  if (req.body.status === "success") {
    const name = req.body.firstname;
    const email = req.body.email;
    const number = req.body.phone;
    const hash = req.body.hash;
    const plan = req.body.productinfo;
    const amount = req.body.amount;
    const myTxnId = req.body.txnid;
    const payDate = req.body.addedon;
    const payTxnId = req.body.mihpayid;
    const contacts = req.body.udf1;
    const premiumValidityMonths = req.body.udf2;
    const status = "success";

    const currentDate = new Date();
    const premiumStart = currentDate;
    const premiumExpiry = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + parseInt(premiumValidityMonths),
      currentDate.getDate()
    );

    const payment = await PaymentModel.findOne({ myTxnId: req.body.txnid });
    if (!payment) {
      const newPayment = new PaymentModel({
        name,
        email,
        number,
        amount,
        plan,
        hash,
        myTxnId,
        payDate,
        payTxnId,
        contacts,
        status,
        premiumValidityMonths,
      });
      await newPayment.save();
    }

    //! Sending Contacts to premium user
    const existUser = await userModel.findOne({ email: req.body.email });
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          contacts: parseInt(req.body.udf1) + parseInt(existUser.contacts),
          premiumValidityMonths: premiumValidityMonths,
          premiumStart: premiumStart,
          premiumExpiry: premiumExpiry,
          isPremium: true,
          contactsWarningEmailSent: false,
          premiumExpiryWarning: false,
          premiumExpiredMail: false,
        },
      },
      { new: true }
    );

    //nodemailer
    setTimeout(async () => {
      //!send mail
      try {
        const dynamicData = {
          username: `${req.body.firstname}`,
          planname: `${req.body.productinfo}`,
          premiumStarts: `${premiumStart}`,
          expiryDate: `${premiumExpiry}`,
          mytxnId: `${req.body.txnid}`,
        };
        let htmlContent = fs.readFileSync("premiumMail.html", "utf8");
        Object.keys(dynamicData).forEach((key) => {
          const placeholder = new RegExp(`{${key}}`, "g");
          htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
        });
        // Send mail
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "halalrishtey@gmail.com",
            pass: "wnoeqfpstetrysxm",
          },
        });
        let mailDetails = {
          from: "halalrishtey@gmail.com",
          to: `${req.body.email}`,
          subject: "Premium Plan Successfull",
          html: htmlContent,
        };
        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log(err);
          }
        });
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }, 1000);
    //end nodemailer
  }
  res.redirect("https://halarishtey.com/user-dashboard");
});

module.exports = router;
