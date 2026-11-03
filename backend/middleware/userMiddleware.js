const userMiddleware = (req, res, next) => {
  if (req.user.role !== "attendee") {
    return res.status(403).json({
      message: "Access denied. Users only.",
    });
  }

  next();
};

module.exports = userMiddleware;