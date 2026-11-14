
const express = require("express");
const router = express.Router();

const {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
} = require("../controllers/sessionController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin: Get all Sessions including drafts
router.get(
  "/manage",
  authMiddleware,
  roleMiddleware("admin"),
  getAllSessions
);

// Admin: Get any Session by ID
router.get(
  "/manage/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getSessionById
);

// Public: Get published Sessions
router.get("/", getAllSessions);

// Public: Get published Session details
router.get("/:id", getSessionById);

// Admin: Create Session
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createSession
);

// Admin: Update Session
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateSession
);

// Admin: Delete Session
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSession
);

module.exports = router;
