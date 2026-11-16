
const express = require("express");
const router = express.Router();

const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements
} = require("../controllers/announcementController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin routes
router.post("/", authMiddleware, roleMiddleware("admin"), createAnnouncement);
router.get("/", authMiddleware, roleMiddleware("admin"), getAllAnnouncements);

// Any logged-in user can view relevant announcements
// IMPORTANT: /my must come before /:id
router.get("/my", authMiddleware, getMyAnnouncements);

router.get("/:id", authMiddleware, roleMiddleware("admin"), getAnnouncementById);
router.patch("/:id", authMiddleware, roleMiddleware("admin"), updateAnnouncement);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteAnnouncement);

module.exports = router;
