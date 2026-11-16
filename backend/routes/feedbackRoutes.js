
const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus
} = require("../controllers/feedbackController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Attendee submit feedback
router.post(
  "/",
  authMiddleware,
  roleMiddleware("attendee"),
  createFeedback
);

// Admin view all feedback
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getAllFeedback
);

// Admin moderate feedback
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateFeedbackStatus
);

module.exports = router;
