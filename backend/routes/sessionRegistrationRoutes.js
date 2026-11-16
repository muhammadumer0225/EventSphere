
const express = require("express");
const router = express.Router();

const {
    registerForSession,
    getMySessionRegistrations,
    cancelSessionRegistration
} = require("../controllers/sessionRegistrationController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Register for Session
router.post(
    "/:sessionId/register",
    authMiddleware,
    roleMiddleware("attendee"),
    registerForSession
);

// Get My Registrations
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("attendee"),
    getMySessionRegistrations
);

// Cancel Registration
router.patch(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("attendee"),
    cancelSessionRegistration
);

module.exports = router;
