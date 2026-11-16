
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    targetAudience: {
      type: String,
      enum: ["all", "attendees", "exhibitors"],
      default: "all"
    },

    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ expo: 1, targetAudience: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
