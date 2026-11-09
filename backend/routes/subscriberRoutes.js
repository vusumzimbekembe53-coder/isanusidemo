const express = require("express");
const crypto = require("crypto");

const Subscriber = require("../models/Subscriber");
const sendEmail = require("../utils/sendEmail");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Generate secure tokens
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Hash tokens before storing them
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Generate a signed unsubscribe token for a subscriber
function generateUnsubscribeToken(subscriberId) {
  const signature = crypto
    .createHmac("sha256", process.env.UNSUBSCRIBE_SECRET)
    .update(subscriberId.toString())
    .digest("hex");

  return `${subscriberId}.${signature}`;
}

// Verify a signed unsubscribe token
function verifyUnsubscribeToken(token) {
  const [subscriberId, signature] = token.split(".");

  if (
    !subscriberId ||
    !signature ||
    !/^[a-f\d]{24}$/i.test(subscriberId) ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.UNSUBSCRIBE_SECRET)
    .update(subscriberId)
    .digest("hex");

  const valid = crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );

  return valid ? subscriberId : null;
}

// POST /api/subscribers
// Customer subscribes
router.post("/", async (req, res) => {
  try {
    const { email, consent } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (consent !== true) {
      return res.status(400).json({
        success: false,
        message: "Please agree to receive marketing emails.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let subscriber = await Subscriber.findOne({
      email: normalizedEmail,
    });

    // Already subscribed
    if (subscriber?.status === "active") {
      return res.status(200).json({
        success: true,
        message: "This email is already subscribed.",
      });
    }

    const confirmationToken = generateToken();
    const unsubscribeToken = generateToken();

    const confirmationTokenHash = hashToken(confirmationToken);
    const unsubscribeTokenHash = hashToken(unsubscribeToken);

    const confirmationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    if (!subscriber) {
      subscriber = new Subscriber({
        email: normalizedEmail,
      });
    }

    // Reset subscription confirmation
    subscriber.status = "pending";
    subscriber.consentAt = new Date();
    subscriber.confirmedAt = null;
    subscriber.unsubscribedAt = null;

    subscriber.confirmationTokenHash = confirmationTokenHash;
    subscriber.confirmationTokenExpires = confirmationTokenExpires;
    subscriber.unsubscribeTokenHash = unsubscribeTokenHash;

    await subscriber.save();

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const confirmationLink =
      `${frontendUrl}/confirm-subscription?token=${confirmationToken}`;

    const unsubscribeLink =
      `${frontendUrl}/unsubscribe?token=${unsubscribeToken}`;

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Confirm your ISANUSI Clothing subscription",
      html: `
        <div style="font-family: Arial, sans-serif; color: #121212; max-width: 600px; margin: auto;">
          <h1 style="color: #FF6B00;">ISANUSI Clothing</h1>

          <h2>Welcome to the unfazed.</h2>

          <p>
            Thank you for choosing to receive updates from ISANUSI Clothing.
          </p>

          <p>
            Please confirm your email address to receive new drops,
            promotions and brand updates.
          </p>

          <a
            href="${confirmationLink}"
            style="display: inline-block; background: #FF6B00; color: white; padding: 14px 24px; text-decoration: none; border-radius: 6px;"
          >
            Confirm Subscription
          </a>

          <p>This confirmation link expires in 24 hours.</p>

          <p>If you did not request this subscription, you can ignore this email.</p>

          <p>
            <a href="${unsubscribeLink}">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Unable to send confirmation email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Please check your email to confirm your subscription.",
    });
  } catch (error) {
    console.error("Subscriber registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your subscription.",
    });
  }
});

// POST /api/subscribers/confirm
// Customer confirms subscription
router.post("/confirm", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Confirmation token is required.",
      });
    }

    const subscriber = await Subscriber.findOne({
      confirmationTokenHash: hashToken(token),
      confirmationTokenExpires: { $gt: new Date() },
      status: "pending",
    });

    if (!subscriber) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired confirmation link.",
      });
    }

    subscriber.status = "active";
    subscriber.confirmedAt = new Date();
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationTokenExpires = null;

    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: "Your ISANUSI subscription is confirmed!",
    });
  } catch (error) {
    console.error("Subscription confirmation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to confirm your subscription.",
    });
  }
});

// POST /api/subscribers/unsubscribe
router.post("/unsubscribe", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Unsubscribe token is required.",
      });
    }

    let subscriber = null;

    // First, check the new signed campaign token
    const subscriberId = verifyUnsubscribeToken(token);

    if (subscriberId) {
      subscriber = await Subscriber.findOne({
        _id: subscriberId,
        status: "active",
      });
    }

    // Support older unsubscribe links already sent by the subscription system
    if (!subscriber) {
      subscriber = await Subscriber.findOne({
        unsubscribeTokenHash: hashToken(token),
        status: "active",
      });
    }

    if (!subscriber) {
      return res.status(400).json({
        success: false,
        message: "Invalid unsubscribe link or subscription already inactive.",
      });
    }

    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();
    subscriber.unsubscribeTokenHash = null;

    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: "You have successfully unsubscribed from ISANUSI emails.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your unsubscribe request.",
    });
  }
});

// GET /api/subscribers
// Admin: View subscribers
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .select("email status consentAt confirmedAt unsubscribedAt createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    console.error("Get subscribers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve subscribers.",
    });
  }
});

module.exports = router;