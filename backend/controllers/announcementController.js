
const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const Expo = require("../models/Expo");

// Create Announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience, expo } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    if (
      targetAudience &&
      !["all", "attendees", "exhibitors"].includes(targetAudience)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience"
      });
    }

    if (expo) {
      if (!mongoose.isValidObjectId(expo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Expo ID"
        });
      }

      const existingExpo = await Expo.findById(expo);

      if (!existingExpo) {
        return res.status(404).json({
          success: false,
          message: "Expo not found"
        });
      }
    }

    const announcement = await Announcement.create({
      title,
      message,
      targetAudience,
      expo: expo || null,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
      error: error.message
    });
  }
};


const getAllAnnouncements = async (req, res) => {
  try {
    const {
      search,
      targetAudience,
      expo,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (targetAudience) {
      filter.targetAudience = targetAudience;
    }

    if (expo) {
      filter.expo = expo;
    }

    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate("expo", "title")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Announcement.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: announcements.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message
    });
  }
};




const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("expo", "title")
      .populate("createdBy", "name email");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }

    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcement",
      error: error.message
    });
  }
};

// Update Announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience, expo } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }

    if (title !== undefined) announcement.title = title;
    if (message !== undefined) announcement.message = message;
    if (targetAudience !== undefined) {
      announcement.targetAudience = targetAudience;
    }

    if (expo !== undefined) {
      if (expo && !mongoose.isValidObjectId(expo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Expo ID"
        });
      }

      if (expo) {
        const existingExpo = await Expo.findById(expo);

        if (!existingExpo) {
          return res.status(404).json({
            success: false,
            message: "Expo not found"
          });
        }
      }

      announcement.expo = expo || null;
    }

    await announcement.save();

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update announcement",
      error: error.message
    });
  }
};

// Delete Announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
      error: error.message
    });
  }
};


const getMyAnnouncements = async (req, res) => {
  try {
    let audienceFilter = ["all"];

    if (req.user.role === "attendee") {
      audienceFilter.push("attendees");
    } else if (req.user.role === "exhibitor") {
      audienceFilter.push("exhibitors");
    } else if (req.user.role === "admin") {
      audienceFilter = ["all", "attendees", "exhibitors"];
    }

    const announcements = await Announcement.find({
      targetAudience: { $in: audienceFilter }
    })
      .populate("expo", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your announcements",
      error: error.message
    });
  }
};





module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements
};
