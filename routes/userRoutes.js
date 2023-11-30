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
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

// router object
const router = express.Router();

// routes
// Login || post
router.post("/admin", adminController);
// Login || post
router.post("/login", loginController);
// Register || post
router.post("/register", registerController);
// Step one || post
router.post("/step-one", stepOneController);
// Step one || post
router.post("/step-two", stepTwoController);
// Step one || post
router.post("/step-three", stepThreeController);
// Step one || post
router.post("/update-user", updateUserController);
// Register || post
router.post("/user", getUserController);
// Auth || post
router.post("/getUserData", authMiddleware, authController);
// get Profile || post
router.post("/get-profile-data", getProfileDataController);
// Get all user || get
router.post("/get-all-users", getAllUserController);
// Get all user near me || get
router.post("/get-all-users-near-me", getAllUserNearMeController);
// Get all Today Match user || get
router.post("/get-all-today-match-users", getAllTodayMatchUserController);
// Delete user || post
router.post("/delete-user", DeleteUserController);
// Send Mail || post
router.post("/send-otp", sendMailController);
// Verify Otp || post
router.post("/verify-otp", verifyOtpController);
// Activate User || post
router.post("/user-active", userActiveController);
// SEND SMS OTP || post
router.post("/sendSMS", sendSMSController);
// Mobile otp verify || post
router.post("/verify-mobile", verifyMobileController);
// Upodate Password || post
router.post("/update-pass", updatePassController);
// User Like || post
router.post("/user-like", userLikeController);
// User See Contact || post
router.post("/see-contact", userSeeContactController);

// ================ USER LIKE
// LIKE
router.post("/inbox-user-accept", getInboxUserAcceptController);
// REJECT
router.post("/inbox-user-reject", getInboxUserRejectController);
// ================ USER ENDS

// router.post("/get-payment-method", getUserPaymentDetailsController);

module.exports = router;
