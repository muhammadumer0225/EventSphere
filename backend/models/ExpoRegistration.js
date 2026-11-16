
const mongoose = require("mongoose");

const expoRegistrationSchema = new mongoose.Schema(
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

        status: {
            type: String,
            enum: ["registered", "cancelled"],
            default: "registered"
        },

        registeredAt: {
            type: Date,
            default: Date.now
        },

        cancelledAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate registration records
expoRegistrationSchema.index(
    { expo: 1, attendee: 1 },
    { unique: true }
);

// Helpful indexes
expoRegistrationSchema.index({ expo: 1, status: 1 });
expoRegistrationSchema.index({ attendee: 1, createdAt: -1 });

module.exports = mongoose.model(
    "ExpoRegistration",
    expoRegistrationSchema
);
