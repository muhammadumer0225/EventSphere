
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
    default: "",
  },

  image: {
    type: String,
    default: "",
  },
});

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  role: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
});

const exhibitorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    industry: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    address: {
      street: String,
      city: String,
      country: String,
    },

    productsServices: [productSchema],

    staff: [staffSchema],

    documents: [
      {
        name: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ExhibitorProfile = mongoose.model(
  "ExhibitorProfile",
  exhibitorProfileSchema
);

module.exports = ExhibitorProfile;
