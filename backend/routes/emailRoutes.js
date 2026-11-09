const express = require("express");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required.",
      });
    }

    const result = await sendEmail({
      to,
      subject: "ISANUSI Clothing - Email Test",
      html: "<h1>Email is working!</h1><p>Your ISANUSI email system is ready.</p>",
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;