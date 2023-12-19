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
const authMiddleware = require("../middlewares/authMiddleware");

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
router.get("/get-all-users", authMiddleware, getAllUserController);
router.post("/get-user", authMiddleware, getUserController);
router.post("/delete-user", authMiddleware, deleteUserController);
router.post("/admin-edit-user", authMiddleware, editUserController);
router.get("/get-ads", authMiddleware, getAdsController);
router.post(
  "/post-ads",
  upload.single("image"),
  authMiddleware,
  postAdsController
);
router.post("/delete-ads", authMiddleware, deleteAdsController);
router.post("/add-plan", authMiddleware, addPlanController);
router.get("/get-plans", authMiddleware, getAllPlanController);

// ============== BULK EMAIL
router.get(
  "/get-incomplete-users",
  authMiddleware,
  getIncompleteUsersController
);
router.post(
  "/send-mail-to-incomplete-profiles",
  sendMailToIncompleteUsersController
);

module.exports = router;
