
const mongoose = require("mongoose");

const Application = require("../models/Application");
const Expo = require("../models/Expo");
const ExhibitorProfile = require("../models/ExhibitorProfile");
const User = require("../models/User");
const Notification = require("../models/Notification");
const transporter = require("../config/mailer");




const sendApplicationNotification = async (
  application,
  type,
  title,
  message
) => {

  // Send professional email notification
  try {
    const recipientName =
      application.exhibitor?.name || "Exhibitor";

    const expoTitle =
      application.expo?.title || "EventSphere Expo";

    const companyName =
      application.exhibitorProfile?.companyName || "Your Company";

    const subject = `${title} | EventSphere`;

    const emailBody = [
      `Hello ${recipientName},`,
      "",
      "Thank you for choosing EventSphere and applying to participate in our Expo.",
      "",
      message,
      "",
      "APPLICATION DETAILS",
      "------------------------------",
      `Company: ${companyName}`,
      `Expo: ${expoTitle}`,
      `Preferred Booth Size: ${application.preferredBoothSize}`,
      "",
      application.remarks
        ? `Admin Remarks: ${application.remarks}`
        : "",
      "",
      "You can sign in to your EventSphere account to view your application details.",
      "",
      "Thank you,",
      "EventSphere Team",
    ].join("\n");

    const info = await transporter.sendMail({
      from: `"EventSphere" <${process.env.EMAIL_USER}>`,
      to: application.exhibitor.email,
      subject,
      text: emailBody,
    });

    console.log("Email accepted:", info.accepted);
    console.log("Email rejected:", info.rejected);
    console.log("Email Message ID:", info.messageId);

  } catch (error) {
    console.error("Email sending failed:", error);
  }

};





// Submit Expo Application
const createApplication = async (req, res) => {
  try {
    const { expoId } = req.params;
    const { preferredBoothSize } = req.body;

    // Validate Expo ID
    if (!mongoose.isValidObjectId(expoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo ID",
      });
    }

    // Validate preferred booth size
    if (
      typeof preferredBoothSize !== "string" ||
      !preferredBoothSize.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Preferred booth size is required",
      });
    }

    // Find published Expo
    const expo = await Expo.findOne({
      _id: expoId,
      status: "published",
    });

    if (!expo) {
      return res.status(404).json({
        success: false,
        message: "Expo not found or not available for applications",
      });
    }

    // Check registration deadline
    const now = new Date();

    if (
      expo.registrationDeadline &&
      now > expo.registrationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Expo application deadline has passed",
      });
    }

    if (now >= expo.startDate) {
      return res.status(400).json({
        success: false,
        message: "Applications are closed for this Expo",
      });
    }

    // Find logged-in Exhibitor's company profile
    const profile = await ExhibitorProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Please create your exhibitor profile first",
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      expo: expoId,
      exhibitor: req.user.id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this Expo",
      });
    }

    // Copy valid profile documents into application
    const documents = profile.documents
      .filter(
        (doc) => doc.name && doc.fileUrl && doc.fileType
      )
      .map((doc) => ({
        name: doc.name,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
      }));

    // Create Application
    const application = await Application.create({
      expo: expo._id,
      exhibitor: req.user.id,
      exhibitorProfile: profile._id,
      preferredBoothSize: preferredBoothSize.trim(),
      documents,
    });

    return res.status(201).json({
      success: true,
      message: "Expo application submitted successfully",
      application,
    });

  } catch (error) {
    // Handle duplicate application race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this Expo",
      });
    }

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



const getMyApplications = async (req, res) => {
  try {
    // Find applications submitted by logged-in exhibitor
    const applications = await Application.find({
      exhibitor: req.user.id,
    })
      .populate(
        "expo",
        "title slug category startDate endDate location banner"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Your applications fetched successfully",
      count: applications.length,
      applications,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getAllApplications = async (req, res) => {
  try {
    const { status, expoId, search } = req.query;

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
        message: "Invalid page or limit",
      });
    }

    const filter = {};

    // Filter by application status
    if (status) {
      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status",
        });
      }

      filter.status = status;
    }

    // Filter by Expo ID
    if (expoId) {
      if (!mongoose.isValidObjectId(expoId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Expo ID",
        });
      }

      filter.expo = expoId;
    }

    // Search by Expo title, company name or exhibitor
    if (search?.trim()) {
      const keyword = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(keyword, "i");

      const [expos, profiles, users] = await Promise.all([
        Expo.find({ title: regex }).select("_id"),

        ExhibitorProfile.find({
          companyName: regex,
        }).select("_id"),

        User.find({
          role: "exhibitor",
          $or: [
            { name: regex },
            { email: regex },
          ],
        }).select("_id"),
      ]);

      filter.$or = [
        { expo: { $in: expos.map((item) => item._id) } },
        {
          exhibitorProfile: {
            $in: profiles.map((item) => item._id),
          },
        },
        {
          exhibitor: {
            $in: users.map((item) => item._id),
          },
        },
      ];
    }

    // Total matching applications
    const total = await Application.countDocuments(filter);

    // Fetch applications
    const applications = await Application.find(filter)
      .populate("expo", "title category startDate endDate")
      .populate("exhibitor", "name email")
      .populate(
        "exhibitorProfile",
        "companyName industry logo contactPhone"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      count: applications.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      applications,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    // Validate Application ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Application ID",
      });
    }

    // Validate remarks
    if (
      remarks !== undefined &&
      typeof remarks !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Remarks must be a string",
      });
    }

    // Approve only pending applications
    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          remarks: remarks?.trim() || "",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .populate("expo", "title category")
      .populate("exhibitor", "name email")
      .populate("exhibitorProfile", "companyName industry");

    if (!application) {
      const existingApplication = await Application.findById(id);

      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Application has already been reviewed",
      });
    }

    await sendApplicationNotification(
  application,
  "application_approved",
  "Application Approved!",
  `Your application for ${application.expo.title} has been approved. Welcome to EventSphere!`
);

    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      application,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    // Validate Application ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Application ID",
      });
    }

    // Rejection remarks are required
    if (
      typeof remarks !== "string" ||
      !remarks.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Rejection remarks are required",
      });
    }

    // Reject only pending applications
    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          remarks: remarks.trim(),
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      },
      {
        returnDocument: true,
        runValidators: true,
      }
    )
      .populate("expo", "title category")
      .populate("exhibitor", "name email")
      .populate("exhibitorProfile", "companyName industry");

    if (!application) {
      const existingApplication = await Application.findById(id);

      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Application has already been reviewed",
      });
    }

    await sendApplicationNotification(
  application,
  "application_rejected",
  "Application Rejected",
  `Your application for ${application.expo.title} has been rejected. Remarks: ${application.remarks}`
);

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      application,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



module.exports = { createApplication, getMyApplications, getAllApplications, approveApplication, rejectApplication };
