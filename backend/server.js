const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const expoRoutes = require("./routes/expoRoutes");
const boothRoutes = require("./routes/boothRoutes");

const app = express();

// 1. CORS Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 2. JSON Middleware
app.use(express.json());

// 3. Auth Routes
app.use("/api/auth", authRoutes);

// 4. Expo Routes
app.use("/api/expos", expoRoutes);

// 5. Booth Routes
app.use("/api/booths", boothRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("EventSphere API is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventSphere API is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

