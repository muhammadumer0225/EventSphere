
const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Get logged-in user's notifications
router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

// Mark notification as read
router.patch(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

module.exports = router;
