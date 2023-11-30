const multer = require("multer");
const express = require("express");
const {
  getAllUserController,
  getUserController,
  editUserController,
  getAdsController,
  postAdsController,
  deleteAdsController,
  addPlanController,
  getAllPlanController,
  deleteUserController,
  getIncompleteUsersController,
  sendMailToIncompleteUsersController,
} = require("../controllers/AdminCtrl");

// router object
const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "adsImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});

const upload = multer({ storage: storage });

// ALl Users
router.get("/get-all-users", getAllUserController);
// Get Single user
router.post("/get-user", getUserController);
// Admin delete user
router.post("/delete-user", deleteUserController);
// Edit User
router.post("/admin-edit-user", editUserController);
// Get Ads
router.get("/get-ads", getAdsController);
// Post Ads
router.post("/post-ads", upload.single("image"), postAdsController);
// Delete Ads
router.post("/delete-ads", deleteAdsController);
// Add Plan
router.post("/add-plan", addPlanController);
// Get Plan
router.get("/get-plans", getAllPlanController);

// ============== BULK EMAIL
// Get incomplete users
router.get("/get-incomplete-users", getIncompleteUsersController);
// Get incomplete users
router.post(
  "/send-mail-to-incomplete-profiles",
  sendMailToIncompleteUsersController
);

module.exports = router;
