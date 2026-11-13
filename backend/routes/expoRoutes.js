
const express = require("express");
const router = express.Router();

const {
  createExpo,
  getAllExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
  updateExpoFloorPlan,
} = require("../controllers/expoController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin: Get all Expos including drafts
router.get(
  "/manage",
  authMiddleware,
  roleMiddleware("admin"),
  getAllExpos
);

// Admin: Get any Expo by ID including drafts
router.get(
  "/manage/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getExpoById
);

// Public: Get published Expos only
router.get("/", getAllExpos);

// Public: Get published Expo details only
router.get("/:id", getExpoById);

// Admin: Create Expo
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createExpo
);

// Admin: Update Expo
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateExpo
);

// Update Expo Floor Plan (Admin Only)
router.put(
  "/:id/floor-plan",
  authMiddleware,
  roleMiddleware("admin"),
  updateExpoFloorPlan
);

// Admin: Delete Expo
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteExpo
);

module.exports = router;
