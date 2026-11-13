
const mongoose = require("mongoose");

const applicationDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  fileUrl: {
    type: String,
    required: true,
  },

  fileType: {
    type: String,
    required: true,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },

    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    exhibitorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExhibitorProfile",
      required: true,
    },

    preferredBoothSize: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    documents: {
      type: [applicationDocumentSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same Expo
// by the same Exhibitor.
applicationSchema.index(
  { expo: 1, exhibitor: 1 },
  { unique: true }
);

// Useful indexes for filtering applications.
applicationSchema.index({ expo: 1, status: 1 });
applicationSchema.index({ exhibitor: 1, createdAt: -1 });

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
