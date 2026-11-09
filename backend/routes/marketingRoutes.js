const express = require("express");
const crypto = require("crypto");

const Subscriber = require("../models/Subscriber");
const Campaign = require("../models/Campaign");
const sendEmail = require("../utils/sendEmail");


const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Escape user-provided text before inserting it into HTML
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

// Generate a signed unsubscribe token
function generateUnsubscribeToken(subscriberId) {
  const signature = crypto
    .createHmac("sha256", process.env.UNSUBSCRIBE_SECRET)
    .update(subscriberId.toString())
    .digest("hex");

  return `${subscriberId}.${signature}`;
}

// POST /api/marketing/send
// Admin sends a marketing campaign
router.post("/send", protect, adminOnly, async (req, res) => {
  try {
    const {
      subject,
      heading,
      message,
      subscriberEmails,
      sendToAllActive,
    } = req.body;

    if (!subject?.trim() || !heading?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject, heading and message are required.",
      });
    }

    if (!process.env.UNSUBSCRIBE_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Unsubscribe signing secret is not configured.",
      });
    }

    if (!sendToAllActive &&
        (!Array.isArray(subscriberEmails) || subscriberEmails.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one recipient.",
      });
    }

    // Always retrieve active subscribers from the database.
    // Never trust recipient status supplied by the frontend.
    let subscribers;

    if (sendToAllActive === true) {
      subscribers = await Subscriber.find({
        status: "active",
      });
    } else {
      const emails = [
        ...new Set(
          subscriberEmails.map((email) =>
            String(email).trim().toLowerCase()
          )
        ),
      ];

      subscribers = await Subscriber.find({
        email: { $in: emails },
        status: "active",
      });
    }

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active subscribers were found.",
      });
    }

    const frontendUrl = (
      process.env.CLIENT_URL || "http://localhost:5173"
    ).replace(/\/$/, "");

    const safeHeading = escapeHTML(heading.trim());
    const safeMessage = escapeHTML(message.trim()).replace(/\n/g, "<br>");

    const results = [];

    // Send sequentially to reduce SMTP rate-limit problems.
    for (const subscriber of subscribers) {
      const unsubscribeToken = generateUnsubscribeToken(
        subscriber._id
      );

      const unsubscribeLink =
        `${frontendUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#121212;padding:24px;">

          <h1 style="color:#FF6B00;">ISANUSI Clothing</h1>

          <h2>${safeHeading}</h2>

          <p style="line-height:1.8;">
            ${safeMessage}
          </p>

          <hr style="border:none;border-top:1px solid #ddd;margin:30px 0;" />

          <p style="font-size:12px;color:#777;">
            You received this email because you confirmed your
            subscription to ISANUSI Clothing marketing updates.
          </p>

          <p style="font-size:12px;">
            <a href="${unsubscribeLink}" style="color:#FF6B00;">
              Unsubscribe from marketing emails
            </a>
          </p>

        </div>
      `;

      const result = await sendEmail({
        to: subscriber.email,
        subject: subject.trim(),
        html,
      });

      results.push({
        email: subscriber.email,
        status: result.success ? "sent" : "failed",
        ...(result.success ? {} : { error: result.error }),
      });
    }

    const successful = results.filter(
      (item) => item.status === "sent"
    ).length;

    const failed = results.length - successful;

    // Save campaign history
    const campaign = await Campaign.create({
      subject: subject.trim(),
      heading: heading.trim(),
      message: message.trim(),
      recipients: results,
      totalRecipients: results.length,
      successful,
      failed,
      sentBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign processing completed.",
      campaignId: campaign._id,
      totalRecipients: results.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error("Marketing campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process marketing campaign.",
    });
  }
});

// GET /api/marketing/campaigns
// Admin views campaign history
router.get("/campaigns", protect, adminOnly, async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .select("-recipients")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      campaigns,
    });
  } catch (error) {
    console.error("Campaign history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve campaign history.",
    });
  }
});

module.exports = router;