
const express = require("express");
const router = express.Router();

const {
  getAllAttendees,
  getAttendeeById,
  getAttendeeExpoRegistrations,
  getAttendeeSessionRegistrations,
} = require("../controllers/attendeeController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes are Admin only
router.use(authMiddleware, roleMiddleware("admin"));

// Get All Attendees
router.get("/", getAllAttendees);

// Get Single Attendee
router.get("/:id", getAttendeeById);

// Get Attendee Expo Registrations
router.get("/:id/expo-registrations", getAttendeeExpoRegistrations);

// Get Attendee Session Registrations
router.get("/:id/session-registrations", getAttendeeSessionRegistrations);

module.exports = router;
