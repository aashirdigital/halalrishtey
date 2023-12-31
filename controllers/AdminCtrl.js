const userModel = require("../models/userModel");
const adsModel = require("../models/AdsModel");
const planModel = require("../models/PlanModel");
const sendMail = require("./sendMail");
const nodemailer = require("nodemailer");
const fs = require("fs");

const getAllUserController = async (req, res) => {
  try {
    const allUser = await userModel.find({
      email: { $ne: "aashirdigital@gmail.com" },
      isDeleted: "No",
    });

    if (!allUser) {
      return res.status(200).send({ success: false, message: "No User Found" });
    }
    return res.status(200).send({
      success: true,
      message: "All Users Fetched Sucesss",
      data: allUser,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Get All User Ctrl ${error.message}` });
  }
};

const getUserController = async (req, res) => {
  try {
    const user = await userModel.find({ msId: req.body.id });
    if (!user) {
      return res.status(200).send({ success: false, message: "No User Found" });
    }
    return res.status(200).send({
      success: true,
      message: "All Users Fetched Sucesss",
      data: user,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Get User Ctrl ${error.message}` });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { msId: req.body.id },
      { $set: { isDeleted: "Yes" } },
      { new: true }
    );
    if (!user) {
      return res.status(200).send({ success: false, message: "No User Found" });
    }
    return res.status(200).send({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Delete User Ctrl ${error.message}` });
  }
};

const editUserController = async (req, res) => {
  try {
    const { msId, isVerified, idVerified } = req.body;
    if (!msId) {
      return res.status(400).send({
        success: false,
        message: "msId is required in the request body",
      });
    }
    const existingUser = await userModel.findOne({ msId: msId });
    if (!existingUser) {
      return res.status(200).send({
        success: false,
        message: "No user found",
      });
    }
    const updateUser = await userModel.findOneAndUpdate(
      { msId },
      { $set: req.body },
      { new: true }
    );
    if (!updateUser) {
      return res.status(201).send({
        success: false,
        message: "Failed to Update User",
      });
    }

    //! User profile verification
    if (existingUser.isVerified === "No") {
      if (isVerified === "Yes") {
        try {
          const dynamicData = {
            username: `${req.body.username}`,
          };
          let htmlContent = fs.readFileSync("profileVerification.html", "utf8");
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
            subject: "Your Halal Rishtey Profile is Now Approved and Live!",
            html: htmlContent,
          };
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log("Mail sent");
            }
          });
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }
    }
    //! User profile verification

    //! user ID verified
    if (
      existingUser.idVerified === "No" ||
      existingUser.idVerified === "reject"
    ) {
      if (idVerified === "approved") {
        console.log("running");
        try {
          const dynamicData = {
            username: `${req.body.username}`,
          };
          let htmlContent = fs.readFileSync("idVerifiedMail.html", "utf8");
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
            subject:
              "Congratulations! Your Halal Rishtey Profile is Now Verified with a Badge 🎉",
            html: htmlContent,
          };
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log("Mail sent");
            }
          });
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }
    }
    //! user ID verified

    //! user ID Reject
    if (
      existingUser.idVerified === "No" ||
      existingUser.idVerified === "approved"
    ) {
      if (idVerified === "reject") {
        try {
          const dynamicData = {
            username: `${req.body.username}`,
          };
          let htmlContent = fs.readFileSync("idRejectMail.html", "utf8");
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
            subject:
              "Important Notice: Rejection of Your ID Proof Submission on Halal Rishtey",
            html: htmlContent,
          };
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log("Mail sent");
            }
          });
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }
    }
    //! user ID Reject

    //! Admin Reject then updating removing photo from database
    if (existingUser.idProof) {
      if (idVerified === "reject") {
        fs.unlinkSync(existingUser.idProof);
        existingUser.idProof = null;
        await existingUser.save();
      }
    }

    return res
      .status(202)
      .send({ success: true, message: "User Updated Successfully" });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Admin Edit User Ctrl ${error.message}`,
    });
  }
};

const getAdsController = async (req, res) => {
  try {
    const ads = await adsModel.find();
    if (!ads || ads.length === 0) {
      return res.status(404).send({ success: false, message: "No data found" });
    }
    return res
      .status(200)
      .send({ success: true, message: "Data Fetched", data: ads });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Get Ads Ctrl ${error.message}` });
  }
};

const postAdsController = async (req, res) => {
  try {
    // Create a new image document in MongoDB
    const newImage = new adsModel({
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname,
    });

    // Save the image document
    await newImage.save();

    res.status(201).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAdsController = async (req, res) => {
  try {
    const { imagePath } = req.body;
    const ad = await adsModel.findOne({ path: imagePath });
    if (!ad) {
      return res.status(200).send({ success: false, message: "Ad not found" });
    }
    const removeAd = await adsModel.findOneAndDelete({ path: imagePath });
    if (!removeAd) {
      return res
        .status(201)
        .send({ success: true, message: "Failed to delete" });
    }
    await fs.unlink(imagePath);
    return res
      .status(200)
      .send({ success: true, message: "Ad deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting ad: ${error.message}`,
    });
  }
};

const addPlanController = async (req, res) => {
  try {
    const plan = await planModel.findOne({ name: req.body.name });
    if (plan) {
      return res.status(200).send({
        success: false,
        message: "Plan Already Exists",
      });
    }
    const savePlan = new planModel(req.body);
    await savePlan.save();
    res.status(201).send({ success: true, message: "Plan Added Successful" });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Add Plan ${error.message}`,
    });
  }
};

const getAllPlanController = async (req, res) => {
  try {
    const plan = await planModel.find({});
    if (!plan) {
      return res.status(200).send({
        success: false,
        message: "No Plan Found",
      });
    }
    res
      .status(201)
      .send({ success: true, message: "Plan Fetched", data: plan });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Get All Plan Ctrl ${error.message}`,
    });
  }
};

// ================= BULK EMAIL
const getIncompleteUsersController = async (req, res) => {
  try {
    const incompleteUsers = await userModel.find({
      $or: [
        { username: { $eq: null } },
        { email: { $eq: null } },
        { mobile: { $eq: null } },
        { gender: { $eq: null } },
        { profileCreatedFor: { $eq: null } },
        { age: { $eq: null } },
        { maritalStatus: { $eq: null } },
        { height: { $eq: null } },
        { weight: { $eq: null } },
        { country: { $eq: null } },
        { state: { $eq: null } },
        { city: { $eq: null } },
        { diet: { $eq: null } },
        { bodyType: { $eq: null } },
        { disability: { $eq: null } },
        { religion: { $eq: null } },
        { language: { $eq: null } },
        { community: { $eq: null } },
        { maslak: { $eq: null } },
        { namaaz: { $eq: null } },
        { zakat: { $eq: null } },
        { fasting: { $eq: null } },
        { fatherStatus: { $eq: null } },
        { motherStatus: { $eq: null } },
        { brothers: { $eq: null } },
        { sisters: { $eq: null } },
        { brothersMarried: { $eq: null } },
        { sistersMarried: { $eq: null } },
        { familyType: { $eq: null } },
        { nativePlace: { $eq: null } },
        { qualification: { $eq: null } },
        { collegeName: { $eq: null } },
        { workingWith: { $eq: null } },
        { employedAs: { $eq: null } },
        { salary: { $eq: null } },
        { companyName: { $eq: null } },
      ],
    });
    if (!incompleteUsers) {
      return res.status(200).send({ success: false, message: "No user found" });
    }
    return res.status(201).send({
      success: true,
      message: "All User Fetched",
      data: incompleteUsers,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Get Incomplete User Ctrl ${error.message}`,
    });
  }
};

const sendMailToIncompleteUsersController = async (req, res) => {
  try {
    const { incompleteUsers, msg } = req.body;

    if (!incompleteUsers || !msg) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid request data" });
    }
    // Loop through incompleteUsers and send email to each user
    for (const user of incompleteUsers) {
      const { email } = user;
      await sendMail(email, "Incomplete Profile", "", msg);
    }

    res
      .status(200)
      .send({ success: true, message: "Emails sent to all users" });
  } catch (error) {
    console.error(`Send Mail to Incomplete Profiles Ctrl: ${error.message}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const sendMailToUserController = async (req, res) => {
  try {
    const { email, subject, msg } = req.body;
    const user = userModel.findOne({ email: email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }

    //! MAIL
    try {
      const dynamicData = {
        username: `${user.username}`,
        email: `${email}`,
        subject: `${subject}`,
        msg: `${msg}`,
      };
      let htmlContent = fs.readFileSync("mailToUser.html", "utf8");
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
        to: `${email}`,
        subject: `${subject}`,
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
    //! MAIL
    res.status(200).send({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error(`Send Mail to Incomplete Profiles Ctrl: ${error.message}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getAllUserController,
  getUserController,
  deleteUserController,
  editUserController,
  getAdsController,
  postAdsController,
  deleteAdsController,
  addPlanController,
  getAllPlanController,
  getIncompleteUsersController,
  sendMailToIncompleteUsersController,
  sendMailToUserController,
};
