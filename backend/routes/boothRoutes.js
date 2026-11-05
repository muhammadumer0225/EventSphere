const express = require("express");
const router = express.Router();

const { createBooth, getAllBooths, getBoothById, updateBooth, deleteBooth, reserveBooth, getMyReservations } = require("../controllers/boothController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create Booth (Admin Only)
router.post("/", authMiddleware, roleMiddleware("admin"), createBooth);

// Get All Booths
router.get("/", getAllBooths);

// Get Single Booth
router.get("/:id", getBoothById);

// Update Booth (Admin Only)
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateBooth);

// Delete Booth (Admin Only)
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteBooth);

// Reserve Booth (Exhibitor Only)
router.post(
  "/:id/reserve",
  authMiddleware,
  roleMiddleware("exhibitor"),
  reserveBooth
);

// Get My Reservations (Exhibitor Only)
router.get(
  "/my-reservations",
  authMiddleware,
  roleMiddleware("exhibitor"),
  getMyReservations
);



module.exports = router;