
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const Expo = require("../models/Expo");
const ExpoRegistration = require("../models/ExpoRegistration");

// Attendee Submit Feedback
const createFeedback = async (req, res) => {
  try {
    const { expo, rating, comment } = req.body;

    if (!expo || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Expo and rating are required"
      });
    }

    if (!mongoose.isValidObjectId(expo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo ID"
      });
    }

    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    const existingExpo = await Expo.findById(expo);

    if (!existingExpo) {
      return res.status(404).json({
        success: false,
        message: "Expo not found"
      });
    }

    // Check whether attendee has registered for this Expo
    const registration = await ExpoRegistration.findOne({
      expo,
      attendee: req.user.id,
      status: "registered"
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You must be registered for this Expo to submit feedback"
      });
    }

    const feedback = await Feedback.create({
      expo,
      attendee: req.user.id,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted feedback for this Expo"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message
    });
  }
};



const getAllFeedback = async (req, res) => {
  try {
    const {
      expo,
      status,
      rating,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (expo) {
      if (!mongoose.isValidObjectId(expo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Expo ID"
        });
      }

      filter.expo = expo;
    }

    if (status) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid feedback status"
        });
      }

      filter.status = status;
    }

    if (rating !== undefined) {
      const ratingNumber = Number(rating);

      if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }

      filter.rating = ratingNumber;
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * pageLimit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate("attendee", "name email")
        .populate("expo", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      Feedback.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageLimit),
      feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message
    });
  }
};



const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, approved or rejected"
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      {
  returnDocument: "after",
  runValidators: true
}
    )
      .populate("attendee", "name email")
      .populate("expo", "title");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update feedback status",
      error: error.message
    });
  }
};



module.exports = {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus
};
