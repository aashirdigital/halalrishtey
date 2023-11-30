const express = require("express");
const {
  withdrawController,
  getAllWithdrawalsController,
  approveWithdrawController,
} = require("../controllers/withdrawCtrl");

// router object
const router = express.Router();

// routes
// Add Withdrawal || post
router.post("/add-withdraw", withdrawController);
// ADMIN
// Get All Withdrawal || get
router.get("/get-withdrawals", getAllWithdrawalsController);
// Approve Withdrawal || get
router.post("/approve-withdrawal", approveWithdrawController);

module.exports = router;
