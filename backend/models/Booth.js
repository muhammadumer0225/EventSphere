const mongoose = require("mongoose");


const boothPositionSchema = new mongoose.Schema(
  {
    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    width: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    height: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    rotation: {
      type: Number,
      min: 0,
      max: 360,
      default: 0,
    },
  },
  { _id: false }
);


const boothSchema  = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },

    boothNumber: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },


position: {
  type: boothPositionSchema,
  default: undefined,
},


    status: {
      type: String,
      enum: ["available", "reserved", "occupied"],
      default: "available",
    },

    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate booth numbers within the same Expo
boothSchema.index(
  { expo: 1, boothNumber: 1 },
  { unique: true }
);

const Booth = mongoose.model("Booth", boothSchema);

module.exports = Booth;
