
const express = require("express");
const router = express.Router();

const {
    registerForExpo,
    getMyExpoRegistrations,
    cancelExpoRegistration
} = require("../controllers/expoRegistrationController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Register for Expo
router.post("/:expoId/register", authMiddleware, roleMiddleware("attendee"), registerForExpo);

// Get my Expo registrations
router.get("/my", authMiddleware, roleMiddleware("attendee"), getMyExpoRegistrations);

// Cancel Expo registration
router.patch("/:id/cancel", authMiddleware, roleMiddleware("attendee"), cancelExpoRegistration);

module.exports = router;
