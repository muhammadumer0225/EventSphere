
const mongoose = require("mongoose");
const Expo = require("../models/Expo");
const ExpoRegistration = require("../models/ExpoRegistration");

// Register for Expo
const registerForExpo = async (req, res) => {
    try {
        const { expoId } = req.params;
        const attendeeId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(expoId)) {
            return res.status(400).json({
                message: "Invalid Expo ID"
            });
        }

        const expo = await Expo.findOne({
            _id: expoId,
            status: "published"
        });

        if (!expo) {
            return res.status(404).json({
                message: "Published Expo not found"
            });
        }

        if (
            expo.registrationDeadline &&
            new Date() > new Date(expo.registrationDeadline)
        ) {
            return res.status(400).json({
                message: "Expo registration deadline has passed"
            });
        }

        const existingRegistration = await ExpoRegistration.findOne({
            expo: expoId,
            attendee: attendeeId
        });

        if (existingRegistration?.status === "registered") {
            return res.status(409).json({
                message: "You are already registered for this Expo"
            });
        }

        const activeRegistrations = await ExpoRegistration.countDocuments({
            expo: expoId,
            status: "registered"
        });

        if (
            expo.capacity != null &&
            activeRegistrations >= expo.capacity
        ) {
            return res.status(409).json({
                message: "Expo registration capacity is full"
            });
        }

        // Reactivate cancelled registration
        if (existingRegistration) {
            const registration = await ExpoRegistration.findOneAndUpdate(
                { _id: existingRegistration._id },
                {
                    status: "registered",
                    registeredAt: new Date(),
                    cancelledAt: null
                },
                { returnDocument: "after" }
            );

            return res.status(200).json({
                message: "Expo registration reactivated successfully",
                registration
            });
        }

        const registration = await ExpoRegistration.create({
            expo: expoId,
            attendee: attendeeId,
            status: "registered"
        });

        return res.status(201).json({
            message: "Expo registration successful",
            registration
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You are already registered for this Expo"
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get My Expo Registrations
const getMyExpoRegistrations = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const filter = {
            attendee: req.user.id
        };

        if (req.query.status) {
            if (!["registered", "cancelled"].includes(req.query.status)) {
                return res.status(400).json({
                    message: "Invalid registration status"
                });
            }

            filter.status = req.query.status;
        }

        const [registrations, total] = await Promise.all([
            ExpoRegistration.find(filter)
                .populate("expo", "title category startDate endDate location banner status")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            ExpoRegistration.countDocuments(filter)
        ]);

        return res.status(200).json({
            registrations,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Cancel Expo Registration
const cancelExpoRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Registration ID"
            });
        }

        const registration = await ExpoRegistration.findOneAndUpdate(
            {
                _id: id,
                attendee: req.user.id,
                status: "registered"
            },
            {
                status: "cancelled",
                cancelledAt: new Date()
            },
            { returnDocument: "after" }
        );

        if (!registration) {
            return res.status(404).json({
                message: "Active registration not found"
            });
        }

        return res.status(200).json({
            message: "Expo registration cancelled successfully",
            registration
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    registerForExpo,
    getMyExpoRegistrations,
    cancelExpoRegistration
};
