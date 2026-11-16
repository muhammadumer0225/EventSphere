
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true
    },

    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// One feedback per attendee for each Expo
feedbackSchema.index(
  { expo: 1, attendee: 1 },
  { unique: true }
);

feedbackSchema.index({ expo: 1, status: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
