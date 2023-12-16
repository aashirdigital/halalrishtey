const express = require("express");
const {
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
  uploadUserImageController,
  getProfileDataController,
  userLikeController,
  userSeeContactController,
  getInboxUserAcceptController,
  getInboxUserRejectController,
  sendSMSController,
  adminController,
  getUserImproveProfileController,
  getAllTodayMatchUserController,
  getAllUserNearMeController,
  checkMobileNumberController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

// router object
const router = express.Router();

// routes
//ADMIN  | USER | LOGIN & REGISTER
router.post("/admin", adminController);
router.post("/login", loginController);
router.post("/register", registerController);
// USER COMPLETE PROFILE
router.post("/step-one", stepOneController);
router.post("/step-two", stepTwoController);
router.post("/step-three", stepThreeController);
// USER UPDATE PROFILE
router.post("/update-user", updateUserController);
// GET USER DATA
router.post("/user", getUserController);
router.post("/getUserData", authMiddleware, authController);
router.post("/get-profile-data", getProfileDataController);
router.post("/get-all-users", getAllUserController);
router.post("/get-all-users-near-me", getAllUserNearMeController);
router.post("/get-all-today-match-users", getAllTodayMatchUserController);
router.post("/delete-user", DeleteUserController);
// VERIFY USER
router.post("/send-otp", sendMailController);
router.post("/verify-otp", verifyOtpController);
router.post("/user-active", userActiveController);
router.post("/check-mobile-number", checkMobileNumberController);
router.post("/sendSMS", sendSMSController);
router.post("/verify-mobile", verifyMobileController);
router.post("/update-pass", updatePassController);
// LIKE SYSTEM
router.post("/user-like", userLikeController);
router.post("/see-contact", userSeeContactController);
router.post("/inbox-user-accept", getInboxUserAcceptController);
router.post("/inbox-user-reject", getInboxUserRejectController);

module.exports = router;
