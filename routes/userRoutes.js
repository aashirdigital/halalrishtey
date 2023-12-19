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
  homePageUsersController,
  updatePhotoPrivacy,
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
router.post("/update-user", authMiddleware, updateUserController);
router.post("/update-photo-privacy", updatePhotoPrivacy);
// GET USER DATA
router.post("/user", authMiddleware, getUserController);
router.post("/getUserData", authMiddleware, authController);
router.post("/get-profile-data", authMiddleware, getProfileDataController);
router.post("/get-all-users", authMiddleware, getAllUserController);
router.post("/home-page-users", homePageUsersController);
router.post(
  "/get-all-users-near-me",
  authMiddleware,
  getAllUserNearMeController
);
router.post(
  "/get-all-today-match-users",
  authMiddleware,
  getAllTodayMatchUserController
);
router.post("/delete-user", authMiddleware, DeleteUserController);
// VERIFY USER
router.post("/send-otp", sendMailController);
router.post("/verify-otp", verifyOtpController);
router.post("/user-active", authMiddleware, userActiveController);
router.post("/check-mobile-number", checkMobileNumberController);
router.post("/sendSMS", sendSMSController);
router.post("/verify-mobile", verifyMobileController);
router.post("/update-pass", updatePassController);
// LIKE SYSTEM
router.post("/user-like", authMiddleware, userLikeController);
router.post("/see-contact", authMiddleware, userSeeContactController);
router.post("/inbox-user-accept", authMiddleware, getInboxUserAcceptController);
router.post("/inbox-user-reject", authMiddleware, getInboxUserRejectController);

module.exports = router;
