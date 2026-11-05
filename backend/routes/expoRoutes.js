const express = require("express");
const router = express.Router();

const {
  createExpo,
  getAllExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
} = require("../controllers/expoController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// Create Expo (Admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createExpo
);

// Get All Expos (Authenticated users)
router.get(
  "/",
  authMiddleware,
  getAllExpos
);


// Get Single Expo (Authenticated users)
router.get(
  "/:id",
  authMiddleware,
  getExpoById
);

// Update Expo (Admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateExpo
);

// Delete Expo (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteExpo
);

module.exports = router;