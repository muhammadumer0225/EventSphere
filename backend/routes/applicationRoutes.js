
const express = require("express");
const router = express.Router();

const { createApplication, getMyApplications, getAllApplications, rejectApplication, approveApplication } = require("../controllers/applicationController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Submit Expo Application (Exhibitor only)
router.post(
  "/expos/:expoId/applications",
  authMiddleware,
  roleMiddleware("exhibitor"),
  createApplication
);

// Get logged-in Exhibitor's applications
router.get(
  "/applications/mine",
  authMiddleware,
  roleMiddleware("exhibitor"),
  getMyApplications
);

// Get All Applications (Admin only)
router.get(
  "/applications",
  authMiddleware,
  roleMiddleware("admin"),
  getAllApplications
);

// Approve Application (Admin only)
router.patch(
  "/applications/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveApplication
);

// Reject Application (Admin only)
router.patch(
  "/applications/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectApplication
);

module.exports = router;
