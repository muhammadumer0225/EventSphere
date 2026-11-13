const mongoose = require("mongoose");

const Booth = require("../models/Booth");
const Expo = require("../models/Expo");

// Create Booth
const createBooth = async (req, res) => {
  try {
    const { expo, boothNumber, size, price, position } = req.body;

    if (!expo || !boothNumber || !size || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const expoExists = await Expo.findById(expo);

    if (!expoExists) {
      return res.status(404).json({
        success: false,
        message: "Expo not found",
      });
    }

    const boothData = {
  expo,
  boothNumber,
  size,
  price,
};

// Add position only when provided
if (position !== undefined) {
  boothData.position = position;
}

const booth = await Booth.create(boothData);

    res.status(201).json({
      success: true,
      message: "Booth created successfully",
      booth,
    });

  } catch (error) {
    if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This booth number already exists in this Expo",
    });
  }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Booths
const getAllBooths = async (req, res) => {
  try {
    if (
  req.query.expo &&
  !mongoose.isValidObjectId(req.query.expo)
) {
  return res.status(400).json({
    success: false,
    message: "Invalid Expo ID",
  });
}

    const filter = {};

if (req.query.expo) {
  filter.expo = req.query.expo;
}

const booths = await Booth.find(filter).populate(
  "expo",
  "title category startDate endDate"
);

    res.status(200).json({
      success: true,
      count: booths.length,
      booths,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Reservations (Exhibitor Only)
const getMyReservations = async (req, res) => {
  try {
    const booths = await Booth.find({
      exhibitor: req.user.id,
      status: "reserved",
    }).populate("expo");

    res.status(200).json({
      success: true,
      count: booths.length,
      booths,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Expo Floor Plan
const getExpoFloorPlan = async (req, res) => {
  try {
    const { expoId } = req.params;

    // Validate Expo ID
    if (!mongoose.isValidObjectId(expoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo ID",
      });
    }

    // Find published Expo
    const expo = await Expo.findOne({
      _id: expoId,
      status: "published",
    }).select("title category location startDate endDate floorPlan");

    if (!expo) {
      return res.status(404).json({
        success: false,
        message: "Published Expo not found",
      });
    }

    // Get all booths of this Expo
    const booths = await Booth.find({
      expo: expoId,
    })
      .select("boothNumber size price status exhibitor position")
      .populate("exhibitor", "name")
      .sort({ boothNumber: 1 });

    return res.status(200).json({
      success: true,
      message: "Expo floor plan fetched successfully",
      expo,
      floorPlan: expo.floorPlan || null,
      count: booths.length,
      booths,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// Get Single Booth
const getBoothById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booth ID",
      });
    }

    const booth = await Booth.findById(id).populate(
  "expo",
  "title category startDate endDate"
);

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: "Booth not found",
      });
    }

    res.status(200).json({
      success: true,
      booth,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Booth
const updateBooth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booth ID",
      });
    }

    const { boothNumber, size, price, status, exhibitor, position } = req.body;

    const updateData = {
  boothNumber,
  size,
  price,
  status,
  exhibitor,
};

if (position !== undefined) {
  updateData.position = position;
}

    const booth = await Booth.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: true,
        runValidators: true,
      }
    );

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: "Booth not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booth updated successfully",
      booth,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
  return res.status(400).json({
    success: false,
    message: error.message,
  });
}
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This booth number already exists in this Expo",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Booth
const deleteBooth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booth ID",
      });
    }

    const booth = await Booth.findByIdAndDelete(id);

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: "Booth not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booth deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reserve Booth
const reserveBooth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booth ID",
      });
    }

    const booth = await Booth.findOneAndUpdate(
      {
        _id: id,
        status: "available",
      },
      {
        status: "reserved",
        exhibitor: req.user.id,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: "Booth not found or already reserved",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booth reserved successfully",
      booth,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { createBooth, getAllBooths, getBoothById, updateBooth, deleteBooth, reserveBooth, getMyReservations, getExpoFloorPlan };
