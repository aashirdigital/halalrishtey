const multer = require("multer");
const express = require("express");
const { AddPlanController } = require("../controllers/planCtrl");

// router object
const router = express.Router();

// ALl Plan
// router.get("/get-all-users", getAllUserController);
// Add plan
router.post("/add-plan", AddPlanController);

module.exports = router;
