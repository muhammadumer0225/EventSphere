
const mongoose = require("mongoose");

const sessionRegistrationSchema = new mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
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
sessionRegistrationSchema.index(
    { session: 1, attendee: 1 },
    { unique: true }
);

sessionRegistrationSchema.index({ session: 1, status: 1 });
sessionRegistrationSchema.index({ attendee: 1, createdAt: -1 });

module.exports = mongoose.model(
    "SessionRegistration",
    sessionRegistrationSchema
);
