const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

const router = express.Router();

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

// REGISTER customer
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Provide name, email and a password of at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer",
    });

    // Send welcome email
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Welcome to ISANUSI Clothing!",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px;">
            <h1 style="color: #121212;">ISANUSI <span style="color: #FF6B00;">CLOTHING</span></h1>

            <h2>Welcome, ${user.name}!</h2>

            <p>Thank you for joining the ISANUSI community.</p>

            <p>
              We represent the visionaries, dreamers and relentless achievers
              who remain unfazed by adversity.
            </p>

            <h3 style="color: #FF6B00;">The Future Belongs to the Unfazed.</h3>

            <p>We are excited to have you with us.</p>

            <p>ISANUSI Clothing Team</p>
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("Welcome email failed:", emailResult.error);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      emailSent: emailResult.success,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});

// GET ALL CUSTOMERS
// Admin only
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "customer" })
      .select("name email phone address createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Fetch customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customers.",
    });
  }
});

// GET CUSTOMER ORDER HISTORY
// Admin only
router.get("/users/:id/orders", protect, adminOnly, async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const orders = await Order.find({
      user: customer._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Customer order history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customer orders.",
    });
  }
});

// GET current user
router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || "",
      address: req.user.address || {},
      role: req.user.role,
    },
  });
});

// UPDATE CUSTOMER PROFILE
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already being used.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || "",
          address: {
            street: address?.street?.trim() || "",
            suburb: address?.suburb?.trim() || "",
            city: address?.city?.trim() || "",
            province: address?.province?.trim() || "",
            postalCode: address?.postalCode?.trim() || "",
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
});

// CHANGE PASSWORD
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Provide your current password and a new password of at least 8 characters.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Your current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Password change error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
});

// CREATE ANOTHER ADMIN
router.post("/admins", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password (8+ characters) are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully.",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin creation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create admin.",
    });
  }
});

// ONE-TIME FIRST ADMIN SETUP
router.post("/setup-first-admin", async (req, res) => {
  try {
    const { setupKey, name, password } = req.body;

    if (
      !process.env.ADMIN_SETUP_KEY ||
      setupKey !== process.env.ADMIN_SETUP_KEY
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid setup key.",
      });
    }

    if (await User.exists({ role: "admin" })) {
      return res.status(409).json({
        success: false,
        message: "An admin already exists.",
      });
    }

    const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();

    if (!email || !name?.trim() || !password || password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Configure the admin email, name and a password of at least 12 characters.",
      });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({
        success: false,
        message: "This email already has an account. Contact support to configure it safely.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "First admin created. Save your login details securely.",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token: generateToken(admin._id.toString()),
    });
  } catch (error) {
    console.error("First admin setup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "First admin setup failed.",
    });
  }
});

module.exports = router;