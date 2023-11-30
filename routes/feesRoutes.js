const express = require("express");
const {
  addFeesController,
  getFeesController,
  updateFeesController,
} = require("../controllers/FeesCtrl");
// router object
const router = express.Router();

// routes
// Get Fees || get
router.get("/get-fees", getFeesController);
// Add Fees || post
router.post("/add-fees", addFeesController);
// Add Fees || post
router.post("/update-fees", updateFeesController);

module.exports = router;
