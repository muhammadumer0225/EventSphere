const ExhibitorProfile = require("../models/ExhibitorProfile");


const createExhibitorProfile = async (req, res) => {
  try {
    // Check if exhibitor already has a profile
    const existingProfile = await ExhibitorProfile.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Exhibitor profile already exists",
      });
    }

    const {
      companyName,
      description,
      industry,
      website,
      logo,
      contactPhone,
      address,
      productsServices,
      staff,
    } = req.body;

    // Create new exhibitor profile
    const profile = await ExhibitorProfile.create({
      user: req.user.id,
      companyName,
      description,
      industry,
      website,
      logo,
      contactPhone,
      address,
      productsServices,
      staff,
    });

    return res.status(201).json({
      success: true,
      message: "Exhibitor profile created successfully",
      profile,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Exhibitor profile already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getMyExhibitorProfile = async (req, res) => {
  try {
    const profile = await ExhibitorProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Exhibitor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exhibitor profile fetched successfully",
      profile,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateMyExhibitorProfile = async (req, res) => {
  try {
    // Only allow specific fields to be updated
    const allowedFields = [
      "companyName",
      "description",
      "industry",
      "website",
      "logo",
      "contactPhone",
      "address",
      "productsServices",
      "staff",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    // Check if request body contains valid fields
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid fields to update",
      });
    }

    // Update only logged-in exhibitor's profile
    const profile = await ExhibitorProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Exhibitor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exhibitor profile updated successfully",
      profile,
    });

  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


module.exports = { createExhibitorProfile, getMyExhibitorProfile, updateMyExhibitorProfile };
