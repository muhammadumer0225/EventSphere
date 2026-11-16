
const mongoose = require("mongoose");

const User = require("../models/User");
const ExpoRegistration = require("../models/ExpoRegistration");
const SessionRegistration = require("../models/SessionRegistration");

// Get All Attendees — Admin Only
const getAllAttendees = async (req, res) => {
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

    const filter = { role: "attendee" };

    // Search by attendee name or email
    if (search?.trim()) {
      const keyword = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const attendees = await User.find(filter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: attendees.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      attendees,
    });

  } catch (error) {
    console.error("Get Attendees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Single Attendee — Admin Only
const getAttendeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Attendee ID",
      });
    }

    const attendee = await User.findOne({
      _id: id,
      role: "attendee",
    }).select("name email role createdAt");

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "Attendee not found",
      });
    }

    const [
      activeExpoRegistrations,
      activeSessionRegistrations,
    ] = await Promise.all([
      ExpoRegistration.countDocuments({
        attendee: id,
        status: "registered",
      }),
      SessionRegistration.countDocuments({
        attendee: id,
        status: "registered",
      }),
    ]);

    return res.status(200).json({
      success: true,
      attendee,
      registrationSummary: {
        activeExpoRegistrations,
        activeSessionRegistrations,
      },
    });

  } catch (error) {
    console.error("Get Attendee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Attendee Expo Registrations — Admin Only
const getAttendeeExpoRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Attendee ID",
      });
    }

    const attendee = await User.findOne({
      _id: id,
      role: "attendee",
    }).select("_id");

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "Attendee not found",
      });
    }

    const filter = { attendee: id };

    if (status) {
      if (!["registered", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration status",
        });
      }

      filter.status = status;
    }

    const registrations = await ExpoRegistration.find(filter)
      .populate("expo", "title category startDate endDate location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });

  } catch (error) {
    console.error("Attendee Expo Registrations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Attendee Session Registrations — Admin Only
const getAttendeeSessionRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Attendee ID",
      });
    }

    const attendee = await User.findOne({
      _id: id,
      role: "attendee",
    }).select("_id");

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "Attendee not found",
      });
    }

    const filter = { attendee: id };

    if (status) {
      if (!["registered", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration status",
        });
      }

      filter.status = status;
    }

    const registrations = await SessionRegistration.find(filter)
      .populate({
        path: "session",
        select: "title category room startTime endTime status expo speakers",
        populate: [
          {
            path: "expo",
            select: "title category startDate endDate",
          },
          {
            path: "speakers",
            select: "name designation company",
          },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });

  } catch (error) {
    console.error("Attendee Session Registrations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllAttendees,
  getAttendeeById,
  getAttendeeExpoRegistrations,
  getAttendeeSessionRegistrations,
};
