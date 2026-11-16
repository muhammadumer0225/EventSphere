
const express = require("express");
const router = express.Router();

const {
  getDashboardAnalytics,
  getExpoAnalytics,
  getRegistrationAnalytics,
  getExhibitorAnalytics
} = require("../controllers/analyticsController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin only
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboardAnalytics
);


router.get(
  "/expos",
  authMiddleware,
  roleMiddleware("admin"),
  getExpoAnalytics
);


router.get(
  "/registrations",
  authMiddleware,
  roleMiddleware("admin"),
  getRegistrationAnalytics
);


router.get(
  "/exhibitors",
  authMiddleware,
  roleMiddleware("admin"),
  getExhibitorAnalytics
);

module.exports = router;
