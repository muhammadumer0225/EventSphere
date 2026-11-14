
const mongoose = require("mongoose");

const Speaker = require("../models/Speaker");
const Session = require("../models/Session");

// Validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Create Speaker — Admin Only
const createSpeaker = async (req, res) => {
  try {
    const {
      name,
      email,
      bio,
      designation,
      company,
      photo,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Speaker name is required",
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const speaker = await Speaker.create({
      name,
      email,
      bio,
      designation,
      company,
      photo,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Speaker created successfully",
      speaker,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get All Speakers — Public
const getAllSpeakers = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const { search } = req.query;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit",
      });
    }

    const filter = {};

    if (search?.trim()) {
      const keyword = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { designation: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
      ];
    }

    const total = await Speaker.countDocuments(filter);

    const speakers = await Speaker.find(filter)
    .select("name bio designation company photo createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: speakers.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      speakers,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get Single Speaker — Public
const getSpeakerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Speaker ID",
      });
    }

    const speaker = await Speaker.findById(id)
    .select("name bio designation company photo createdAt");

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: "Speaker not found",
      });
    }

    return res.status(200).json({
      success: true,
      speaker,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Update Speaker — Admin Only
const updateSpeaker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Speaker ID",
      });
    }

    const allowedFields = [
      "name",
      "email",
      "bio",
      "designation",
      "company",
      "photo",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (
      updateData.name !== undefined &&
      (typeof updateData.name !== "string" ||
        !updateData.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Speaker name is required",
      });
    }

    if (
      updateData.email &&
      !isValidEmail(updateData.email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const speaker = await Speaker.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: "Speaker not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Speaker updated successfully",
      speaker,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Delete Speaker — Admin Only
const deleteSpeaker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Speaker ID",
      });
    }

    const speaker = await Speaker.findById(id);

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: "Speaker not found",
      });
    }

    // Prevent deletion if speaker is assigned to a session
    const assignedSession = await Session.exists({
      speakers: id,
    });

    if (assignedSession) {
      return res.status(409).json({
        success: false,
        message: "Speaker is assigned to a session. Remove the speaker from sessions first.",
      });
    }

    await Speaker.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Speaker deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createSpeaker,
  getAllSpeakers,
  getSpeakerById,
  updateSpeaker,
  deleteSpeaker,
};
