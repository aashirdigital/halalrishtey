const express = require("express");
const multer = require("multer");
const router = express.Router();
const userModel = require("../models/userModel");
const fs = require("fs");
const authMiddleware = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "userImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});
const upload = multer({ storage: storage });

const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "VerificationImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});
const uploadVerification = multer({ storage: verificationStorage });

// upload
router.post("/upload-image", upload.array("images", 5), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    const uploadedImages = req.files.map((file) => file.path);
    // Get the total number of images after upload
    const totalImages = user.images.length + uploadedImages.length;
    // If the total exceeds 5, remove the oldest images
    if (totalImages > 5) {
      const excessImages = totalImages - 5;
      user.images.splice(0, excessImages);
    }
    user.images = user.images.concat(uploadedImages);
    await user.save();
    res.status(200).send({
      message: "Image(s) uploaded successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});
// delete
router.delete("/delete-image", async (req, res) => {
  try {
    const { email, imagePath } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    // Find the index of the image path in the images array
    const index = user.images.indexOf(imagePath);
    if (index !== -1) {
      // Remove the image path from the array
      user.images.splice(index, 1);
      // Save the updated user data
      await user.save();
      // Delete the actual image file from the server
      fs.unlinkSync(imagePath); // Make sure to import 'fs' at the top

      return res.status(200).send({
        message: "Image deleted successfully",
        success: true,
      });
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Image not found" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// Upload Verification Image
router.post(
  "/upload-idproof",
  uploadVerification.single("image"),
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(200)
          .send({ success: false, message: "User not found" });
      }
      if (!req.file) {
        return res
          .status(400)
          .send({ success: false, message: "No file uploaded" });
      }
      const uploadedImage = req.file.path;
      user.idProof = uploadedImage;
      await user.save();
      res.status(200).send({
        message: "Image uploaded successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        success: false,
      });
    }
  }
);

module.exports = router;
