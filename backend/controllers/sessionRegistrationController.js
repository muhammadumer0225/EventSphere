
const mongoose = require("mongoose");
const Session = require("../models/Session");
const SessionRegistration = require("../models/SessionRegistration");

// Register for Session
const registerForSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const attendeeId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: "Invalid Session ID" });
        }

        const session = await Session.findOne({
            _id: sessionId,
            status: "published"
        }).populate("expo", "status title");

        if (!session || !session.expo || session.expo.status !== "published") {
            return res.status(404).json({
                message: "Published Session or Expo not found"
            });
        }

        const existing = await SessionRegistration.findOne({
            session: sessionId,
            attendee: attendeeId
        });

        if (existing?.status === "registered") {
            return res.status(409).json({
                message: "You are already registered for this Session"
            });
        }

        const count = await SessionRegistration.countDocuments({
            session: sessionId,
            status: "registered"
        });

        if (session.capacity != null && count >= session.capacity) {
            return res.status(409).json({
                message: "Session registration capacity is full"
            });
        }

        if (existing) {
            const registration = await SessionRegistration.findOneAndUpdate(
                { _id: existing._id },
                {
                    status: "registered",
                    registeredAt: new Date(),
                    cancelledAt: null
                },
                { returnDocument: "after" }
            );

            return res.status(200).json({
                message: "Session registration reactivated successfully",
                registration
            });
        }

        const registration = await SessionRegistration.create({
            session: sessionId,
            attendee: attendeeId
        });

        return res.status(201).json({
            message: "Session registration successful",
            registration
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You are already registered for this Session"
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get My Session Registrations
const getMySessionRegistrations = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const filter = { attendee: req.user.id };

        if (req.query.status) {
            if (!["registered", "cancelled"].includes(req.query.status)) {
                return res.status(400).json({
                    message: "Invalid registration status"
                });
            }
            filter.status = req.query.status;
        }

        const [registrations, total] = await Promise.all([
            SessionRegistration.find(filter)
                .populate({
                    path: "session",
                    select: "title description room startTime endTime status speakers expo",
                    populate: [
                        { path: "expo", select: "title status startDate endDate" },
                        { path: "speakers", select: "name designation company photo" }
                    ]
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            SessionRegistration.countDocuments(filter)
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


// Cancel Session Registration
const cancelSessionRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Registration ID"
            });
        }

        const registration = await SessionRegistration.findOneAndUpdate(
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
            message: "Session registration cancelled successfully",
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
    registerForSession,
    getMySessionRegistrations,
    cancelSessionRegistration
};
