const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const sendSMS = require("./sendSMS");
const nodemailer = require("nodemailer");
const fs = require("fs");

// Function to send email notification
async function sendExpiryNotificationEmail(user, email) {
  let subject, msg;
  if (email === "expiringTomorrow") {
    subject = "Your Premium Plan is Expiring Tomorrow";
    msg = `We hope you're doing well. This is a friendly reminder that your Halal Rishtey plan is set to expire tomorrow. To continue enjoying uninterrupted access to our premium features, please renew your plan at your earliest convenience.`;
    user.premiumExpiryWarning = true;
    await user.save();
  } else if (email === "lowContacts") {
    subject = "Low Contacts Warning";
    msg =
      "Your contacts are running low. Please consider renewing your plan to increase your contact limit.";
  } else if (email === "planexpired") {
    subject = "Your Plan has expired";
    msg = `We hope you're doing well. Sorry to say but your plan has expired and your profile has been set to normal. You can re-purchase premium membership plan for extra benefits as before!`;
    user.contacts = 0;
    user.isPremium = false;
    user.premiumExpiredMail = true;
    await user.save();
  }
  try {
    const dynamicData = {
      username: `${user.username}`,
      email: `${user.email}`,
      msg: `${msg}`,
      subject: `${subject}`,
      contact: `${user.contacts}`,
    };
    let htmlContent = fs.readFileSync("planExpiration.html", "utf8");
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
      to: `${user.email}`,
      subject: subject,
      html: htmlContent,
    };
    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log(err);
      }
    });
    if (email === "expiringTomorrow") {
      user.premiumExpiryWarning = true;
      await user.save();
    } else if (email === "lowContacts") {
      user.contactsWarningEmailSent = true;
      await user.save();
    } else if (email === "planexpired") {
      user.contacts = 0;
      user.isPremium = false;
      await user.save();
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function updateContactsForExpiredPremium() {
  try {
    //! One Day Before expiry Users
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const allUsers = await userModel.find({
      isPremium: true,
      premiumExpiredMail: { $ne: true },
    });
    for (const user of allUsers) {
      if (
        user.premiumExpiry &&
        today.getDate() + 1 === user.premiumExpiry.getUTCDate()
      ) {
        await sendExpiryNotificationEmail(user, "expiringTomorrow");
      }
    }
    //! One Day Before expiry Users
    //! Low Contacts Users
    const usersWithLowContacts = await userModel.find({
      contacts: { $lt: 5 },
      contactsWarningEmailSent: { $ne: true },
      isPremium: true,
    });
    for (const user of usersWithLowContacts) {
      await sendExpiryNotificationEmail(user, "lowContacts");
    }
    //! Low Contacts Users
    //! Expired Users
    const todayDate = new Date();
    const userExpiredPremium = await userModel.find({
      premiumExpiry: { $lt: todayDate },
      premiumExpiredMail: { $ne: true },
    });
    for (const user of userExpiredPremium) {
      await sendExpiryNotificationEmail(user, "planexpired");
    }
    //! Expired Users
  } catch (error) {
    console.error(
      "Error updating contacts and sending email notifications:",
      error
    );
  }
}
// Call the function for testing
updateContactsForExpiredPremium();
setInterval(updateContactsForExpiredPremium, 86400000);

// Admin callback
const adminController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid Credentials" });
    }

    const isAdmin = user.isAdmin || false; // If isAdmin is undefined, default to false

    const token = jwt.sign({ id: user._id, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ success: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

// register callback
const registerController = async (req, res) => {
  try {
    // Check if the email already exists
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(200)
        .send({ success: false, message: "Email Already Exists" });
    }
    // Generate email OTP and hash the password
    const emailOtp = Math.floor(100000 + Math.random() * 900000);
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    req.body.emailOtp = emailOtp;
    // Create and save a new user
    const newUser = new userModel(req.body);
    await newUser.save();
    //! Send registration email
    try {
      const dynamicData = {
        username: `${req.body.username}`,
        email: `${req.body.email}`,
        planDetails: "Free Plan",
      };
      let htmlContent = fs.readFileSync("registerMail.html", "utf8");
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
        subject: "Welcome to Halal Rishtey!",
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
    //! Send registration email END

    //! Send Complete Profile email
    try {
      const dynamicData = {
        username: `${req.body.username}`,
      };
      let htmlContent = fs.readFileSync("completeProfile.html", "utf8");
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
          "Enhance Your Experience - Complete Your Halal Rishtey Profile!",
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
    //! Send Complete Profile email END
    res.status(201).send({ success: true, message: "Registration Successful" });
  } catch (error) {
    // Handle errors during registration process
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    if (isMatch) {
      user.lastLogin = new Date();
      await user.save();
    }
    return res
      .status(200)
      .send({ success: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

// Get User callback
const getUserController = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          gender: req.body.gender,
          dob: req.body.dob,
          state: req.body.state,
          city: req.body.city,
          class: req.body.class,
        },
      },
      { new: true }
    );
    if (!user) {
      res.status(200).send({ success: false, message: "Failed to update" });
    }
    res
      .status(201)
      .send({ success: true, success: "Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

// Auth Callback
const authController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    } else {
      res.status(200).send({ success: true, data: user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Auth Error", error });
  }
};

// ===================== Complete Profile Steps=====================
const stepOneController = async (req, res) => {
  try {
    const updateUser = await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $set: {
          age: req.body.form.age,
          maritalStatus: req.body.form.maritalStatus,
          height: req.body.form.height,
          bodyType: req.body.form.bodyType,
          qualification: req.body.form.qualification,
          workingWith: req.body.form.workingWith,
          business: req.body.form.business,
          employedAs: req.body.form.employedAs,
          salary: req.body.form.salary,
        },
      },
      { new: true }
    );
    if (!updateUser) {
      return res
        .status(200)
        .send({ success: false, message: "Failed to Upfate" });
    }
    return res
      .status(201)
      .send({ success: true, message: "Data Updated Successfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Step One Controller ${error.message}`,
    });
  }
};

const stepTwoController = async (req, res) => {
  try {
    const updateUser = await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $set: {
          fatherName: req.body.form.fatherName,
          fatherStatus: req.body.form.fatherStatus,
          motherStatus: req.body.form.motherStatus,
          brothers: req.body.form.brothers,
          sisters: req.body.form.sisters,
          maslak: req.body.form.maslak,
          country: req.body.form.country,
          state: req.body.form.state,
          city: req.body.form.city,
          pincode: req.body.form.pincode,
          partnerAgeFrom: req.body.partnerAgeFrom,
          partnerAgeTo: req.body.partnerAgeTo,
          partnerReligion: req.body.partnerReligion,
          partnerLanguage: req.body.partnerLanguage,
          partnerMaritalStatus: req.body.partnerMaritalStatus,
          partnerCountry: req.body.partnerCountry,
          partnerState: req.body.partnerState,
          partnerCity: req.body.partnerCity,
        },
      },
      { new: true }
    );
    if (!updateUser) {
      return res
        .status(200)
        .send({ success: false, message: "Failed to Upfate" });
    }
    return res
      .status(201)
      .send({ success: true, message: "Data Updated Successfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Step One Controller ${error.message}`,
    });
  }
};

const stepThreeController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    const updateUser = await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $set: {},
      },
      { new: true }
    );
    if (!updateUser) {
      return res
        .status(200)
        .send({ success: false, message: "Failed to Upfate" });
    }
    return res
      .status(201)
      .send({ success: true, message: "Profile Created Successfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Step One Controller ${error.message}`,
    });
  }
};

const updateUserController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (!existingUser) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const userUpdate = await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $set: req.body,
        isVerified: "No",
      },
      { new: true }
    );
    if (!userUpdate) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to Update" });
    }
    res.status(202).send({
      success: true,
      message: "Profile Updated Successfully",
      data: userUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: `Update Ctrl ${error.message}` });
  }
};

const updatePhotoPrivacy = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (!existingUser) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const userUpdate = await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $set: req.body,
      },
      { new: true }
    );
    if (!userUpdate) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to Update" });
    }
    res.status(202).send({
      success: true,
      message: "Profile Updated Successfully",
      data: userUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: `Update Ctrl ${error.message}` });
  }
};

// ===================== Complete Profile Steps=====================

const getAllTodayMatchUserController = async (req, res) => {
  try {
    const {
      gender,
      partnerAgeFrom,
      partnerAgeTo,
      partnerCountry,
      partnerMaritalStatus,
      partnerState,
    } = req.body;

    const matches = await userModel.find({
      gender: gender,
      isVerified: "Yes",
      isDeleted: "No",
      age: { $gte: partnerAgeFrom, $lte: partnerAgeTo },
      maritalStatus: partnerMaritalStatus,
      state: partnerState,
      country: partnerCountry,
    });
    if (matches.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No matches found" });
    }
    return res.status(201).send({
      success: true,
      message: "Data Fetched Success",
      data: matches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get all users
const getAllUserController = async (req, res) => {
  try {
    let users;
    if (req.body.country) {
      users = await userModel.find({
        email: { $ne: "aashirdigital@gmail.com" },
        gender: req.body.gender,
        country: req.body.country,
        isVerified: "Yes",
        isDeleted: "No",
      });
    } else {
      users = await userModel.find({
        email: { $ne: "aashirdigital@gmail.com" },
        gender: req.body.gender,
        isVerified: "Yes",
        isDeleted: "No",
      });
    }
    if (users.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }
    if (!Array.isArray(users)) {
      // Ensure users is an array
      users = [users];
    }
    users.forEach((user) => {
      user.mobile = undefined;
      user.mobileOtp = undefined;
      user.email = undefined;
      user.emailOtp = undefined;
      user.isActive = undefined;
      user.mobileVerified = undefined;
      user.idVerified = undefined;
      user.isVerified = undefined;
      user.password = undefined;
      user.likesCount = undefined;
      user.contactCount = undefined;
      user.likesData = undefined;
      user.received = undefined;
      user.sent = undefined;
      user.accepted = undefined;
      user.deleted = undefined;
      user.contactData = undefined;
      user.idProof = undefined;
    });

    res.status(200).send({
      success: true,
      message: "User Fetched Successful",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Get All User Controller ${error.message}`,
    });
  }
};

const homePageUsersController = async (req, res) => {
  try {
    users = await userModel.find({
      email: { $ne: "aashirdigital@gmail.com" },
      isVerified: "Yes",
      isDeleted: "No",
    });
    if (!Array.isArray(users)) {
      // Ensure users is an array
      users = [users];
    }
    users.forEach((user) => {
      user.mobile = undefined;
      user.email = undefined;
      user.emailOtp = undefined;
      user.isActive = undefined;
      user.password = undefined;
      user.isVerified = undefined;
      user.likesCount = undefined;
      user.contactCount = undefined;
      user.likesData = undefined;
      user.contactData = undefined;
      user.mobileVerified = undefined;
    });
    res.status(200).send({
      success: true,
      message: "User Fetched Successful",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Get All User Controller ${error.message}`,
    });
  }
};

// get all users
const getAllUserNearMeController = async (req, res) => {
  try {
    let users;
    if (req.body.country && req.body.state) {
      users = await userModel.find({
        email: { $ne: "aashirdigital@gmail.com" },
        gender: req.body.gender,
        country: req.body.country,
        state: req.body.state,
        isVerified: "Yes",
        isDeleted: "No",
      });
    }
    if (!users) {
      return res.status(200).send({
        success: false,
        message: "No User Found",
      });
    }
    if (!Array.isArray(users)) {
      // Ensure users is an array
      users = [users];
    }
    users.forEach((user) => {
      user.mobile = undefined;
      user.email = undefined;
      user.isActive = undefined;
      user.password = undefined;
      user.isVerified = undefined;
      user.likesCount = undefined;
      user.contactCount = undefined;
      user.likesData = undefined;
      user.contactData = undefined;
      user.mobileVerified = undefined;
    });

    res.status(201).send({
      success: true,
      message: "User Fetched Successful",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Get All User Controller ${error.message}`,
    });
  }
};

const getProfileDataController = async (req, res) => {
  try {
    const userProfile = await userModel.findOne({ msId: req.body.msId });
    if (!userProfile) {
      return res.status(200).send({ success: true, message: "User not found" });
    }

    userProfile.mobile = undefined;
    userProfile.email = undefined;
    userProfile.isActive = undefined;
    userProfile.password = undefined;
    userProfile.isVerified = undefined;
    userProfile.likesCount = undefined;
    userProfile.contactCount = undefined;
    userProfile.likesData = undefined;
    userProfile.contactData = undefined;
    userProfile.mobileVerified = undefined;
    userProfile.emailOtp = undefined;
    return res.status(201).send({
      success: true,
      message: "Data fetched Success",
      data: userProfile,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get Profile Data Controller ${error.message}`,
    });
  }
};

// Delete all users
const DeleteUserController = async (req, res) => {
  try {
    const user = await userModel.findOneAndDelete({ _id: req.body.userId });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "No User Found",
      });
    }
    res.status(200).send({
      success: true,
      message: "User Deleted Successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Delete User Controller ${error.message}`,
    });
  }
};

// Send Mail
const sendMailController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "Email Not Registered With Us" });
    }
    const emailOtp = Math.floor(100000 + Math.random() * 900000);
    const savedOtpUser = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { emailOtp: emailOtp } },
      { new: true }
    );
    if (!savedOtpUser) {
      return res
        .status(201)
        .send({ success: false, message: "Error In saving Otp" });
    }
    await sendMail(
      savedOtpUser?.email,
      "Email Verification OTP",
      emailOtp,
      req.body.msg
    );
    return res.status(203).send({
      success: true,
      message: "Otp Send Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Send Mail Controller ${error.message}`,
    });
  }
};
// Verify Email OTP
const verifyOtpController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    if (user.emailOtp !== req.body.userEnteredOtp) {
      return res
        .status(201)
        .send({ success: false, message: "Failed: Incorrect OTP" });
    } else {
      const updateUser = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { $set: { isActive: "Yes" } },
        { new: true }
      );
      if (!updateUser) {
        return res
          .status(200)
          .send({ success: false, message: "Failed to Verify" });
      }
      return res.status(202).send({
        success: true,
        message: "Email Verification Successful",
        data: user,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Verify Otp Controller ${error.message}`,
    });
  }
};
// Activate user by email
const userActiveController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const activeUser = await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      { $set: { isActive: "Yes" } },
      { new: true }
    );
    if (!activeUser) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to Activate" });
    }
    return res.status(201).send({ success: true, message: "User Activated" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `User Active Controller ${error.message}`,
    });
  }
};

const checkMobileNumberController = async (req, res) => {
  try {
    const mobile = await userModel.findOne({ mobile: req.body.ph });
    if (!mobile) {
      return res.status(200).send({
        success: false,
        message: "Mobile Number not found",
      });
    }
    return res.status(201).send({
      success: true,
      message: "This mobile number is already registered with us",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Check Mobile Number Ctrl ${error.message}`,
    });
  }
};

// send mobile sms otp
const sendSMSController = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "Email Not Registered With Us" });
    }
    const smsOTP = Math.floor(100000 + Math.random() * 900000);
    await sendSMS(smsOTP, mobile);
    const savedOtpUser = await userModel.findOneAndUpdate(
      { email: email },
      { $set: { mobileOtp: smsOTP } },
      { new: true }
    );
    if (!savedOtpUser) {
      return res
        .status(201)
        .send({ success: false, message: "Error In saving Otp" });
    }
    return res.status(202).send({
      success: true,
      message: "Otp Send Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Send Mail Controller ${error.message}`,
    });
  }
};

const verifyMobileController = async (req, res) => {
  const message =
    req.body.message === "Profile"
      ? "Profile Created Successfully"
      : "Mobile Verified Successfully";
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    if (userExist.mobileOtp !== req.body.otp) {
      return res.status(200).send({ success: false, message: "Incorrect OTP" });
    } else {
      const updateUser = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { $set: { mobileVerified: "Yes", mobile: req.body.mobile } },
        { new: true }
      );
      const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      if (!updateUser) {
        return res
          .status(200)
          .send({ success: false, message: "Failed to Verify" });
      }
      return res.status(202).send({
        success: true,
        message: message,
        data: updateUser,
        token: token,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: `Verify Mobile Ctrl ${error.message}` });
  }
};

const saveNumberController = async (req, res) => {
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const updateUser = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { mobile: req.body.ph } },
      { $set: { mobile: req.body.ph } },
      { new: true }
    );
    const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    if (!updateUser) {
      return res
        .status(200)
        .send({ success: false, message: "Failed to Verify" });
    }
    return res.status(202).send({
      success: true,
      message: "Number Saved Success",
      data: updateUser,
      token: token,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: `Save Number Ctrl ${error.message}` });
  }
};

const updatePassController = async (req, res) => {
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const password = req.body.pass;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!user) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to update password" });
    }
    res
      .status(202)
      .send({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Update Pass Controller ${error.message}`,
    });
  }
};

// Premium thigns
//sent
const userLikeController = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { msId: req.body.userOne },
      { $push: { likesData: { msId: req.body.userTwo } } },
      { new: true, returnOriginal: true }
    );
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "Failed To Like" });
    }
    if (user) {
      const otherUser = await userModel.findOneAndUpdate(
        { msId: req.body.userTwo },
        { $push: { received: { msId: req.body.userOne } } },
        { new: true, returnOriginal: true }
      );
      if (!otherUser) {
        return res
          .status(201)
          .send({ success: false, message: "Failed To Add Like" });
      }
    }
    try {
      const userOne = await userModel.findOne({ msId: req.body.userOne });
      const userTwo = await userModel.findOne({ msId: req.body.userTwo });
      const dynamicData = {
        username: `${userOne.username}`,
        userTwo: `${userTwo.username}`,
        msId: `${userOne.msId}`,
        lastLogin: `${userOne.lastLogin}`,
        age: `${userOne.age}`,
        language: `${userOne.language}`,
        qualification: `${userOne.qualification}`,
        state: `${userOne.state}`,
        path: `./male.webp`,
      };
      let htmlContent = fs.readFileSync("receivedLike.html", "utf8");
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
        to: `${userTwo.email}`,
        subject: "Received Interest in your profile",
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
    return res
      .status(202)
      .send({ success: true, message: "Like sent successfully", data: user });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `User Like Controller ${error.message}`,
    });
  }
};

const userSeeContactController = async (req, res) => {
  try {
    const contactedUser = await userModel.findOne({ msId: req.body.userTwo });
    if (!contactedUser) {
      return res
        .status(200)
        .send({ success: false, message: "Contacted User Not Found" });
    }
    const existingUser = await userModel.findOne({ msId: req.body.userOne });
    if (!existingUser) {
      return res
        .status(201)
        .send({ success: false, message: "User Not Found" });
    }
    const user = await userModel.findOneAndUpdate(
      { msId: req.body.userOne },
      {
        $push: {
          contactData: {
            msId: req.body.userTwo,
            contactNumber: contactedUser.mobile,
          },
        },
        $set: {
          contacts:
            parseInt(existingUser.contacts) > 0
              ? parseInt(existingUser.contacts) - 1
              : 0,
        },
      },
      { new: true, returnOriginal: true }
    );
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "Failed To Like" });
    }
    return res
      .status(201)
      .send({ success: true, message: "Contact Seen", data: user });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `User Like Controller ${error.message}`,
    });
  }
};

const getInboxUserAcceptController = async (req, res) => {
  try {
    const userAccept = await userModel.findOneAndUpdate(
      {
        msId: req.body.userOne,
      },
      {
        $push: { accepted: { msId: req.body.userTwo } },
        $pull: { received: { msId: req.body.userTwo } }, // Remove msId from received array
      },
      { new: true, returnOriginal: true }
    );
    if (!userAccept) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    if (userAccept) {
      const AcceptedUser = await userModel.findOneAndUpdate(
        {
          msId: req.body.userTwo,
        },
        {
          $pull: { sent: { msId: req.body.userOne } }, // Remove msId from received array
          $pull: { likesData: { msId: req.body.userOne } }, // Remove msId from received array
          $push: { accepted: { msId: req.body.userOne } },
        },
        { new: true, returnOriginal: true }
      );
      if (!AcceptedUser) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
    }
    res.status(200).send({
      success: true,
      message: "User updated successfully",
      data: userAccept,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Inbox User Accept Ctrl $${error.message}`,
    });
  }
};

const getInboxUserRejectController = async (req, res) => {
  try {
    const userReject = await userModel.findOneAndUpdate(
      {
        msId: req.body.userOne,
      },
      {
        $pull: { received: { msId: req.body.userTwo } },
        $push: { deleted: { msId: req.body.userTwo } },
      },
      { new: true, returnOriginal: true }
    );
    if (!userReject) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to Reject" });
    }
    if (userReject) {
      const rejectedUser = await userModel.findOneAndUpdate(
        {
          msId: req.body.userTwo,
        },
        {
          $pull: { likesData: { msId: req.body.userOne } },
          $push: { deleted: { msId: req.body.userOne } },
        },
        { new: true, returnOriginal: true }
      );
      if (!rejectedUser) {
        return res
          .status(202)
          .send({ success: false, message: "Failed to Reject" });
      }
    }
    return res
      .status(203)
      .send({ success: true, message: "User Declined", data: userReject });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Inbox User Reject Ctrl $${error.message}`,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  getAllUserController,
  DeleteUserController,
  getUserController,
  sendMailController,
  verifyOtpController,
  updatePassController,
  stepOneController,
  stepTwoController,
  stepThreeController,
  updateUserController,
  verifyMobileController,
  userActiveController,
  getProfileDataController,
  userLikeController,
  userSeeContactController,
  getInboxUserAcceptController,
  getInboxUserRejectController,
  sendSMSController,
  adminController,
  getAllTodayMatchUserController,
  getAllUserNearMeController,
  checkMobileNumberController,
  homePageUsersController,
  updatePhotoPrivacy,
  saveNumberController,
};
