const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },

    heading: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    recipients: [
      {
        email: String,
        status: {
          type: String,
          enum: ["sent", "failed"],
        },
        error: String,
      },
    ],

    totalRecipients: {
      type: Number,
      default: 0,
    },

    successful: {
      type: Number,
      default: 0,
    },

    failed: {
      type: Number,
      default: 0,
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);