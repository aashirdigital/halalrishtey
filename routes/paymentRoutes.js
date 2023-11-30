const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const UserModel = require("../models/userModel");
const PaymentModel = require("../models/paymentModel");
const userModel = require("../models/userModel");

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
      "||||||||||" +
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
      });
      await newPayment.save();
    }
  }
  res.redirect("https://mymuslimsaathi.com/user-dashboard");
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
    const status = "success";

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
        },
      },
      { new: true }
    );

    //nodemailer
    setTimeout(async () => {
      //!send mail
      let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "muslimsaathiofficial@gmail.com",
          pass: "qengynbbvilixdqb",
        },
      });

      let mailDetails = {
        from: "muslimsaathiofficial@gmail.com",
        to: `${req.body.email},`,
        subject: "Payment Recipt",
        // text: 'Node.js testing mail 3 from ashir ',
        html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Details</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <div>
                        <p>Dear ${req.body.firstname} ,</p>
                        <p>Your transaction with Muslimsaathi was <b>successfull</b></p>
                        <br/>
                          <table>
                          <thead>
                            <tr style="border:1px solid #000;">
                              <th style="text-align: start; padding: 5px;">Merchant</th>
                              <td style="text-align: start; padding: 5px;">Muslimsaathi</td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style="border:1px solid #000;">
                              <th style="text-align: start; padding: 5px;">Name</th>
                              <td style="text-align: start; padding: 5px;">${req.body.firstname}</td>
                            </tr>
                            <tr style="border:1px solid #000;">
                              <th style="text-align: start; padding: 5px;">Plan Name</th>
                              <td style="text-align: start; padding: 5px;">${req.body.productinfo}</td>
                            </tr>
                            <tr style="border:1px solid #000;">
                              <th style="text-align: start; padding: 5px;">Amount</th>
                              <td style="text-align: start; padding: 5px;">${req.body.amount}</td>
                            </tr>
                            <tr style="border:1px solid #000;">
                              <th style="text-align: start; padding: 5px;">Mobile Number</th>
                              <td style="text-align: start; padding: 5px;">${req.body.phone}</td>
                            </tr>
                            <tr style="border:1px solid #000;">
                              <th style="text-align: start; padding: 5px;">Transaction ID</th>
                              <td style="text-align: start; padding: 5px;">${req.body.txnid}</td>
                            </tr>
                            <tr style="border:1px solid #000;">
                              <th style="text-align: start; padding: 5px;">Order Date</th>
                              <td style="text-align: start; padding: 5px;">${req.body.addedon}</td>
                            </tr>
                          </tbody>
                        </table>
                        <br/>
                        <p>For any information pertaining to the status of your payment, please contact us on https://mymuslimsaathi.com/contact</p>
                        <br/>
                        <p>Thanks and Regards, Muslimsaathi</p>
                    </div>
                </body>
                </html>
                `,
        // html: fs.readFileSync('emailHTML.txt','utf8')
      };

      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log(err);
        }
      });
    }, 4000);
    //end nodemailer
  }
  res.redirect("https://mymuslimsaathi.com/user-dashboard");
});

module.exports = router;
