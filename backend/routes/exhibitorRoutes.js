
const express = require("express");
const router = express.Router();

const {
  createExhibitorProfile,
  getMyExhibitorProfile,
  updateMyExhibitorProfile,
} = require("../controllers/exhibitorController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create Exhibitor Profile
router.post(
  "/me",
  authMiddleware,
  roleMiddleware("exhibitor"),
  createExhibitorProfile
);

// Get My Exhibitor Profile
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("exhibitor"),
  getMyExhibitorProfile
);

// Update My Exhibitor Profile
router.put(
  "/me",
  authMiddleware,
  roleMiddleware("exhibitor"),
  updateMyExhibitorProfile
);

module.exports = router;
