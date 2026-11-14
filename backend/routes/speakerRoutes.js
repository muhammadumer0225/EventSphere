
const express = require("express");
const router = express.Router();

const {
  createSpeaker,
  getAllSpeakers,
  getSpeakerById,
  updateSpeaker,
  deleteSpeaker,
} = require("../controllers/speakerController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create Speaker (Admin Only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createSpeaker
);

// Get All Speakers (Public)
router.get("/", getAllSpeakers);

// Get Single Speaker (Public)
router.get("/:id", getSpeakerById);

// Update Speaker (Admin Only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateSpeaker
);

// Delete Speaker (Admin Only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSpeaker
);

module.exports = router;
