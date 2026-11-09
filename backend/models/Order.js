const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        size: { type: String, default: "" },
        color: { type: String, default: "" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    deliveryAddress: {
      address: { type: String, required: true },
      suburb: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      notes: { type: String, default: "" },
    },

    deliveryMethod: {
      type: String,
      enum: [
        "free_local",
        "paxi_economy",
        "paxi_speed",
      ],
      required: true,
      default: "paxi_economy",
    },

    deliveryDetails: {
      collectionPoint: {
        type: String,
        default: "",
      },

      collectionPointCode: {
        type: String,
        default: "",
        uppercase: true,
        trim: true,
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["eft"],
      default: "eft",
    },

    inventoryReserved: {
      type: Boolean,
      default: false,
    },

    paymentDetails: {
      proofOfPayment: {
        type: String,
        default: "",
      },
      gatewayReference: {
        type: String,
        default: "",
      },
      paidAt: {
        type: Date,
        default: null,
      },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);