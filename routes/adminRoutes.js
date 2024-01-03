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
  sendMailToUserController,
} = require("../controllers/AdminCtrl");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

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
router.get("/get-all-users", adminAuthMiddleware, getAllUserController);
router.post("/get-user", adminAuthMiddleware, getUserController);
router.post("/delete-user", adminAuthMiddleware, deleteUserController);
router.post("/admin-edit-user", adminAuthMiddleware, editUserController);
router.get("/get-ads", adminAuthMiddleware, getAdsController);
router.post(
  "/post-ads",
  upload.single("image"),
  adminAuthMiddleware,
  postAdsController
);
router.post("/delete-ads", adminAuthMiddleware, deleteAdsController);
router.post("/add-plan", adminAuthMiddleware, addPlanController);
router.get("/get-plans", getAllPlanController);

// ============== BULK EMAIL
router.get(
  "/get-incomplete-users",
  adminAuthMiddleware,
  getIncompleteUsersController
);
router.post(
  "/send-mail-to-incomplete-profiles",
  sendMailToIncompleteUsersController
);

router.post(
  "/send-mail-to-user",
  adminAuthMiddleware,
  sendMailToUserController
);

module.exports = router;
