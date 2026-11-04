const Expo = require("../models/Expo");
const mongoose = require("mongoose");

// Create a new Expo and save it in MongoDB
const createExpo = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      startDate,
      endDate,
      image,
      status,
    } = req.body;

    
    // Validate required fields
    if (!name || !description || !location || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate Expo dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo date format",
      });
    }

    // End date must be after or equal to start date
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }


    const newExpo = await Expo.create({
      name,
      description,
      location,
      startDate,
      endDate,
      image,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Expo created successfully",
      expo: newExpo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


















// Get all Expos from MongoDB (newest first)
const getAllExpos = async (req, res) => {
  try {
    const expos = await Expo.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: expos.length,
      expos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single Expo using its MongoDB ID
const getExpoById = async (req, res) => {
  try {

    if (!mongoose.isValidObjectId(req.params.id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid Expo ID",
  });
}

    const expo = await Expo.findById(req.params.id);

    if (!expo) {
      return res.status(404).json({
        success: false,
        message: "Expo not found",
      });
    }

    return res.status(200).json({
      success: true,
      expo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update an existing Expo using its ID
const updateExpo = async (req, res) => {
  try {

    const {
  name,
  description,
  location,
  startDate,
  endDate,
  image,
  status,
} = req.body;

const updateData = {
  name,
  description,
  location,
  startDate,
  endDate,
  image,
  status,
};

if (!mongoose.isValidObjectId(req.params.id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid Expo ID",
  });
}

    const expo = await Expo.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expo) {
      return res.status(404).json({
        success: false,
        message: "Expo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expo updated successfully",
      expo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete an Expo using its ID
const deleteExpo = async (req, res) => {
  try {

    if (!mongoose.isValidObjectId(req.params.id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid Expo ID",
  });
}

    const expo = await Expo.findByIdAndDelete(req.params.id);

    if (!expo) {
      return res.status(404).json({
        success: false,
        message: "Expo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expo deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Export all Expo controller functions for use in routes
module.exports = { createExpo, getAllExpos, getExpoById, updateExpo, deleteExpo };
