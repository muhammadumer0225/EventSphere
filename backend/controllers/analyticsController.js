
const User = require("../models/User");
const Expo = require("../models/Expo");
const Booth = require("../models/Booth");
const Session = require("../models/Session");
const ExpoRegistration = require("../models/ExpoRegistration");
const SessionRegistration = require("../models/SessionRegistration");
const Application = require("../models/Application");
const ExhibitorProfile = require("../models/ExhibitorProfile");

// Admin Dashboard Analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalExpos,
      totalAttendees,
      totalExhibitors,
      totalSessions,
      totalBooths,
      activeExpoRegistrations,
      activeSessionRegistrations
    ] = await Promise.all([
      Expo.countDocuments(),
      User.countDocuments({ role: "attendee" }),
      User.countDocuments({ role: "exhibitor" }),
      Session.countDocuments(),
      Booth.countDocuments(),
      ExpoRegistration.countDocuments({ status: "registered" }),
      SessionRegistration.countDocuments({ status: "registered" })
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalExpos,
        totalAttendees,
        totalExhibitors,
        totalSessions,
        totalBooths,
        activeExpoRegistrations,
        activeSessionRegistrations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: error.message
    });
  }
};



const getExpoAnalytics = async (req, res) => {
  try {
    const expos = await Expo.find().select(
      "title status startDate endDate"
    );

    const analytics = await Promise.all(
      expos.map(async (expo) => {
        const [
          totalRegistrations,
          activeRegistrations,
          cancelledRegistrations,
          totalBooths,
          totalSessions
        ] = await Promise.all([
          ExpoRegistration.countDocuments({ expo: expo._id }),
          ExpoRegistration.countDocuments({
            expo: expo._id,
            status: "registered"
          }),
          ExpoRegistration.countDocuments({
            expo: expo._id,
            status: "cancelled"
          }),
          Booth.countDocuments({ expo: expo._id }),
          Session.countDocuments({ expo: expo._id })
        ]);

        return {
          expo,
          totalRegistrations,
          activeRegistrations,
          cancelledRegistrations,
          totalBooths,
          totalSessions
        };
      })
    );

    res.status(200).json({
      success: true,
      count: analytics.length,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Expo analytics",
      error: error.message
    });
  }
};


const getRegistrationAnalytics = async (req, res) => {
  try {
    const [
      totalExpoRegistrations,
      activeExpoRegistrations,
      cancelledExpoRegistrations,
      totalSessionRegistrations,
      activeSessionRegistrations,
      cancelledSessionRegistrations
    ] = await Promise.all([
      ExpoRegistration.countDocuments(),
      ExpoRegistration.countDocuments({ status: "registered" }),
      ExpoRegistration.countDocuments({ status: "cancelled" }),

      SessionRegistration.countDocuments(),
      SessionRegistration.countDocuments({ status: "registered" }),
      SessionRegistration.countDocuments({ status: "cancelled" })
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        expoRegistrations: {
          total: totalExpoRegistrations,
          active: activeExpoRegistrations,
          cancelled: cancelledExpoRegistrations
        },
        sessionRegistrations: {
          total: totalSessionRegistrations,
          active: activeSessionRegistrations,
          cancelled: cancelledSessionRegistrations
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registration analytics",
      error: error.message
    });
  }
};




const getExhibitorAnalytics = async (req, res) => {
  try {
    const [
      totalExhibitors,
      totalProfiles,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications
    ] = await Promise.all([
      User.countDocuments({ role: "exhibitor" }),
      ExhibitorProfile.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: "pending" }),
      Application.countDocuments({ status: "approved" }),
      Application.countDocuments({ status: "rejected" })
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalExhibitors,
        totalProfiles,
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch exhibitor analytics",
      error: error.message
    });
  }
};



module.exports = {
  getDashboardAnalytics,
  getExpoAnalytics,
  getRegistrationAnalytics,
  getExhibitorAnalytics
};
