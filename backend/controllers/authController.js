const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return res.status(400).json({
    message: "Please enter a valid email address",
  });
}

if (password.length < 8) {
  return res.status(400).json({
    message: "Password must be at least 8 characters long",
  });
}


    // Check if user already exists
    const existingUser = await User.findOne({ email });

    

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

     // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
     // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "attendee",
    });

    
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

const signin = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

     const user = await User.findOne({ email });

     if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

        // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    

    const token = jwt.sign(
  {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h", // Token expires in 1 hour
  }
);

const refreshToken = crypto.randomBytes(64).toString("hex");

const refreshTokenHash = crypto
  .createHash("sha256")
  .update(refreshToken)
  .digest("hex");

user.refreshTokenHash = refreshTokenHash;
await user.save();

   res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

const getProfile = async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    

     res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
    
  }catch(error){  
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

const getAdminDashboard = async (req, res) => {
  
 res.status(200).json({
    message: "Welcome to Admin Dashboard",
    user: {
      id: req.user.id,
      name : req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

const getDashboard = async (req, res) => {
  res.status(200).json({
    message: "Welcome to User Dashboard",
    user: {
      id: req.user.id,
      name : req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

const getExhibitorDashboard = (req, res) => {
  res.status(200).json({
    message: "Welcome to Exhibitor Dashboard",
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findOne({ refreshTokenHash });

    if (!user) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30s" }
    );

    // Generate a new refresh token
    const newRefreshToken = crypto
      .randomBytes(64)
      .toString("hex");

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    // Replace the old stored hash
    user.refreshTokenHash = newRefreshTokenHash;
    await user.save();

    return res.status(200).json({
      message: "Tokens refreshed successfully",
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while refreshing token",
    });
  }
};

const logout = async (req, res) => {
  try{
     const { refreshToken } = req.body;

      if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

     const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findOne({ refreshTokenHash });

    if (!user) {

      return res.status(200).json({
        message: "Already logged out or token revoked",
      });
    }

    user.refreshTokenHash = null;
    await user.save();

    return res.status(200).json({
      message: "Logout successful",
    });
  }catch(error){
    res.status(500).json({
      message: "Server error while logging out",
    });
  }
}

const forgotPassword = async (req, res) => {
  try{
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash reset token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

      // Save hashed token and expiry
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    return res.status(200).json({
      message: "Password reset token generated successfully",
      resetToken,
    });

  }catch(error){
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash the received reset token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with valid, unexpired reset token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // Clear reset token after successful password change
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    // Revoke existing refresh token
    user.refreshTokenHash = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


module.exports = { signup, signin, getProfile , getAdminDashboard, getDashboard,getExhibitorDashboard, refreshAccessToken, logout,forgotPassword, resetPassword };