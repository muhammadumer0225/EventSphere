
const Expo = require("../models/Expo");
const mongoose = require("mongoose");

// Helper: Validate Expo dates
const validateDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      message: "Invalid Expo date format",
    };
  }

  if (end < start) {
    return {
      valid: false,
      message: "End date cannot be before start date",
    };
  }

  return { valid: true, start, end };
};

// Helper: Handle common validation errors
const handleError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Expo slug already exists",
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
    message: "Internal server error",
  });
};

// CREATE EXPO — Admin only
const createExpo = async (req, res) => {
  try {
    const {
      title,
      description,
      theme,
      category,
      startDate,
      endDate,
      location,
      banner,
      status,
      capacity,
      registrationDeadline,
      floorPlan,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !location?.venue ||
      !location?.city ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const dateCheck = validateDates(startDate, endDate);

    if (!dateCheck.valid) {
      return res.status(400).json({
        success: false,
        message: dateCheck.message,
      });
    }

    if (
      capacity !== undefined &&
      capacity !== null &&
      (!Number.isInteger(Number(capacity)) || Number(capacity) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    if (registrationDeadline) {
      const deadline = new Date(registrationDeadline);

      if (isNaN(deadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration deadline",
        });
      }
    }

    const expo = await Expo.create({
      title,
      description,
      theme,
      category,
      startDate: dateCheck.start,
      endDate: dateCheck.end,
      location,
      banner,
      status,
      capacity,
      registrationDeadline,
      floorPlan,
      organizer: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Expo created successfully",
      expo,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


// GET ALL EXPOS
const getAllExpos = async (req, res) => {
  try {
    const {
      search,
      category,
      city,
      status,
      startDate,
      endDate,
    } = req.query;

    // Identify Admin management request
    const isAdminManagement = req.user?.role === "admin";

    // Pagination
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit. Limit must be between 1 and 100.",
      });
    }

    const filter = {};

    // Public users can only see published Expos
    if (!isAdminManagement) {
      filter.status = "published";
    }

    // Search by Expo title
    if (search?.trim()) {
      const keyword = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.title = {
        $regex: keyword,
        $options: "i",
      };
    }

    // Category filter
    if (category?.trim()) {
      const value = category.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.category = {
        $regex: `^${value}$`,
        $options: "i",
      };
    }

    // City filter
    if (city?.trim()) {
      const value = city.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter["location.city"] = {
        $regex: `^${value}$`,
        $options: "i",
      };
    }

    // Status filter
    if (status) {
      const allowedStatuses = [
        "draft",
        "published",
        "ongoing",
        "completed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Expo status",
        });
      }

      // Only Admin can filter by other statuses
      if (!isAdminManagement && status !== "published") {
        return res.status(403).json({
          success: false,
          message: "Public users can only view published Expos",
        });
      }

      if (isAdminManagement) {
        filter.status = status;
      }
    }

    // Date range filter
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (
        (start && isNaN(start.getTime())) ||
        (end && isNaN(end.getTime()))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }

      if (start && end && start > end) {
        return res.status(400).json({
          success: false,
          message: "Start date cannot be after end date",
        });
      }

      if (start) {
        filter.endDate = { $gte: start };
      }

      if (end) {
        filter.startDate = { $lte: end };
      }
    }

    // Total matching records
    const total = await Expo.countDocuments(filter);

    // Fetch paginated Expos
    const expos = await Expo.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: expos.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      expos,
    });
  } catch (error) {
    return handleError(res, error);
  }
};



// GET SINGLE EXPO

const getExpoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo ID",
      });
    }

    // Admin management request can access all Expos
    const isAdminManagement = req.user?.role === "admin";

    const filter = { _id: id };

    // Public users can only access published Expos
    if (!isAdminManagement) {
      filter.status = "published";
    }

    const expo = await Expo.findOne(filter);

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
    return handleError(res, error);
  }
};


// UPDATE EXPO — Admin only
const updateExpo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo ID",
      });
    }

    const expo = await Expo.findById(id);

    if (!expo) {
      return res.status(404).json({
        success: false,
        message: "Expo not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "theme",
      "category",
      "startDate",
      "endDate",
      "location",
      "banner",
      "status",
      "capacity",
      "registrationDeadline",
      "floorPlan",
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

    const finalStartDate =
      updateData.startDate || expo.startDate;

    const finalEndDate =
      updateData.endDate || expo.endDate;

    const dateCheck = validateDates(
      finalStartDate,
      finalEndDate
    );

    if (!dateCheck.valid) {
      return res.status(400).json({
        success: false,
        message: dateCheck.message,
      });
    }

    if (updateData.capacity !== undefined) {
      const capacity = Number(updateData.capacity);

      if (
        !Number.isInteger(capacity) ||
        capacity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be a positive integer",
        });
      }

      updateData.capacity = capacity;
    }

    expo.set(updateData);

    await expo.save();

    return res.status(200).json({
      success: true,
      message: "Expo updated successfully",
      expo,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE EXPO — Admin only
const deleteExpo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo ID",
      });
    }

    const expo = await Expo.findByIdAndDelete(id);

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
    return handleError(res, error);
  }
};

module.exports = {
  createExpo,
  getAllExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
};
