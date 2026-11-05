const express = require("express");
const { signup, signin, getProfile, getAdminDashboard, getDashboard, refreshAccessToken, logout, getExhibitorDashboard, forgotPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", authMiddleware, getProfile);
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("attendee"),
  getDashboard
);

router.get(
  "/exhibitor",
  authMiddleware,
  roleMiddleware("exhibitor"),
  getExhibitorDashboard
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDashboard
);

router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;