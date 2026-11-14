
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      default: "General",
    },

    speakers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Speaker",
      },
    ],

    room: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.startTime || value > this.startTime;
        },
        message: "Session end time must be after start time",
      },
    },

    capacity: {
      type: Number,
      min: 1,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Expo-wise session schedule
sessionSchema.index({
  expo: 1,
  startTime: 1,
});

// Room schedule lookup
sessionSchema.index({
  expo: 1,
  room: 1,
  startTime: 1,
  endTime: 1,
});

// Speaker schedule lookup
sessionSchema.index({
  speakers: 1,
  startTime: 1,
  endTime: 1,
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
