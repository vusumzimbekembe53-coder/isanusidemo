
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("../config/cloudinary");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  upload,
  validateProofFile,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

const allowedOrderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const allowedPaymentStatuses = ["paid", "failed"];

// ==================================================
// DELIVERY CONFIGURATION
// ==================================================

const FREE_DELIVERY_AREAS = [
  "devland",
  "freedom park",
  "diepkloof",
  "chiawelo",
  "dhlamini",
  "nancefield",
  "eldorado park",
  "naturena",
  "meredale",
  "southgate",
];

const DELIVERY_FEES = {
  free_local: 0,
  paxi_economy: 59.95,
  paxi_speed: 109.95,
};

function normalizeArea(area) {
  return String(area || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function calculateDeliveryFee(deliveryMethod, suburb) {
  if (
    !Object.prototype.hasOwnProperty.call(
      DELIVERY_FEES,
      deliveryMethod
    )
  ) {
    throw new Error("Please select a valid delivery method.");
  }

  if (deliveryMethod === "free_local") {
    const normalizedSuburb = normalizeArea(suburb);

    if (!FREE_DELIVERY_AREAS.includes(normalizedSuburb)) {
      throw new Error(
        "Free local delivery is not available for this area. Please select PAXI delivery."
      );
    }

    return 0;
  }

  return DELIVERY_FEES[deliveryMethod];
}

// ==================================================
// HELPER FUNCTIONS
// ==================================================

function formatPrice(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
}

function escapeHtml(value = "") {
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

function getProductQuantities(items) {
  const quantities = {};

  for (const item of items) {
    const productId = item.product.toString();

    quantities[productId] =
      (quantities[productId] || 0) + item.quantity;
  }

  return quantities;
}

function getDeliveryMethodName(method) {
  const names = {
    free_local: "Free Local Delivery",
    paxi_economy: "PAXI Store-to-Store Economy",
    paxi_speed: "PAXI Store-to-Store Speed",
  };

  return names[method] || "Delivery";
}

function getPaxiCollectionPointHtml(deliveryDetails) {
  if (!deliveryDetails?.collectionPoint) return "";

  return `
    <p>
      <strong>PAXI collection point:</strong>
      ${escapeHtml(deliveryDetails.collectionPoint)}
    </p>

    <p>
      <strong>PAXI point code:</strong>
      ${escapeHtml(deliveryDetails.collectionPointCode || "Not provided")}
    </p>
  `;
}

// Release reserved stock inside a MongoDB transaction.
async function releaseReservedStock(order, session) {
  if (!order.inventoryReserved) return;

  const quantities = getProductQuantities(order.items);

  for (const [productId, quantity] of Object.entries(quantities)) {
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        reservedStock: { $gte: quantity },
      },
      {
        $inc: { reservedStock: -quantity },
      },
      {
        new: true,
        session,
      }
    );

    if (!product) {
      throw new Error(
        "Unable to release reserved stock. Please check inventory."
      );
    }
  }

  order.inventoryReserved = false;
}

// ==================================================
// CUSTOMER ORDER STATUS EMAIL
// ==================================================

async function sendOrderStatusEmail(order, orderStatus) {
  if (!order.customer?.email) return false;

  const messages = {
    pending: {
      title: "Your order is pending",
      message: "Your order is awaiting the next step.",
    },
    confirmed: {
      title: "Your order has been confirmed!",
      message:
        "Your payment has been verified and your order is confirmed.",
    },
    processing: {
      title: "Your order is being prepared",
      message: "We are preparing your order for dispatch.",
    },
    shipped: {
      title: "Your order has been shipped!",
      message: "Your order has been dispatched and is on its way to you.",
    },
    delivered: {
      title: "Your order has been delivered!",
      message:
        "Your order has been successfully delivered. Thank you for shopping with us.",
    },
    cancelled: {
      title: "Your order has been cancelled",
      message:
        "Your order has been cancelled. Please contact us if you need assistance.",
    },
  };

  const notification = messages[orderStatus];

  if (!notification) return false;

  try {
    const result = await sendEmail({
      to: order.customer.email,
      subject: `ISANUSI Clothing - ${notification.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px;">

            <h1 style="color: #121212;">
              ISANUSI <span style="color: #FF6B00;">CLOTHING</span>
            </h1>

            <h2>Hello ${escapeHtml(order.customer.name || "Customer")}!</h2>

            <h3 style="color: #FF6B00;">
              ${escapeHtml(notification.title)}
            </h3>

            <p>${escapeHtml(notification.message)}</p>

            <p><strong>Order number:</strong> ${escapeHtml(order._id)}</p>
            <p><strong>Order status:</strong> ${escapeHtml(orderStatus.toUpperCase())}</p>
            <p><strong>Order total:</strong> ${formatPrice(order.total)}</p>

            <p>
              <strong>Delivery method:</strong>
              ${escapeHtml(getDeliveryMethodName(order.deliveryMethod))}
            </p>

            <p>
              <strong>Delivery fee:</strong>
              ${formatPrice(order.deliveryFee)}
            </p>

            ${getPaxiCollectionPointHtml(order.deliveryDetails)}

            <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />

            <h3 style="color: #FF6B00;">
              The Future Belongs to the Unfazed.
            </h3>

            <p>Thank you for shopping with ISANUSI Clothing.</p>
            <p>ISANUSI Clothing Team</p>

          </div>
        </div>
      `,
    });

    if (!result.success) {
      console.error("Order status email failed:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Order status email error:", error.message);
    return false;
  }
}

// ==================================================
// CUSTOMER: GET MY ORDERS
// GET /api/orders/my-orders
// ==================================================

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your orders.",
    });
  }
});

// ==================================================
// ADMIN: GET ALL ORDERS
// GET /api/orders
// ==================================================

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve orders.",
    });
  }
});

// ==================================================
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// ==================================================

router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }

  if (!allowedOrderStatuses.includes(orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status.",
    });
  }

  const session = await mongoose.startSession();

  let previousStatus;
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) throw new Error("Order not found.");

      previousStatus = order.orderStatus;

      if (
        previousStatus === "cancelled" &&
        orderStatus !== "cancelled"
      ) {
        throw new Error("A cancelled order cannot be reopened.");
      }

      const requiresPayment = [
        "confirmed",
        "processing",
        "shipped",
        "delivered",
      ];

      if (
        requiresPayment.includes(orderStatus) &&
        order.paymentStatus !== "paid"
      ) {
        throw new Error(
          "Verify the customer's payment before progressing this order."
        );
      }

      if (
        orderStatus === "cancelled" &&
        order.paymentStatus !== "paid"
      ) {
        await releaseReservedStock(order, session);
      }

      order.orderStatus = orderStatus;
      await order.save({ session });

      updatedOrder = order;
    });

    let emailSent = null;

    if (previousStatus !== orderStatus) {
      emailSent = await sendOrderStatusEmail(
        updatedOrder,
        orderStatus
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      emailSent,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(
      error.message === "Order not found." ? 404 : 400
    ).json({
      success: false,
      message: error.message || "Unable to update order status.",
    });
  } finally {
    await session.endSession();
  }
});

// ==================================================
// ADMIN: VERIFY EFT PAYMENT
// PATCH /api/orders/:id/payment-status
// ==================================================

router.patch("/:id/payment-status", protect, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }

  if (!allowedPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message: "Payment status must be paid or failed.",
    });
  }

  const session = await mongoose.startSession();

  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) throw new Error("Order not found.");

      if (order.paymentMethod !== "eft") {
        throw new Error(
          "This verification endpoint is for EFT orders only."
        );
      }

      if (order.orderStatus === "cancelled") {
        throw new Error(
          "This order has been cancelled and cannot be approved."
        );
      }

      if (
        paymentStatus === "paid" &&
        !order.paymentDetails?.proofOfPayment
      ) {
        throw new Error(
          "Upload proof of payment before verifying this order."
        );
      }

      if (order.paymentStatus !== "pending") {
        throw new Error("This payment has already been processed.");
      }

      if (order.inventoryReserved) {
        const quantities = getProductQuantities(order.items);

        for (const [productId, quantity] of Object.entries(quantities)) {
          const update =
            paymentStatus === "paid"
              ? {
                  $inc: {
                    stock: -quantity,
                    reservedStock: -quantity,
                  },
                }
              : {
                  $inc: {
                    reservedStock: -quantity,
                  },
                };

          const filter = {
            _id: productId,
            reservedStock: { $gte: quantity },
          };

          if (paymentStatus === "paid") {
            filter.stock = { $gte: quantity };
          }

          const product = await Product.findOneAndUpdate(
            filter,
            update,
            {
              new: true,
              session,
            }
          );

          if (!product) {
            throw new Error(
              "Unable to update inventory. Please check reserved stock."
            );
          }
        }

        order.inventoryReserved = false;
      }

      order.paymentStatus = paymentStatus;

      if (paymentStatus === "paid") {
        order.paymentDetails.paidAt = new Date();
      }

      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message:
        paymentStatus === "paid"
          ? "Payment verified and stock updated successfully."
          : "Payment marked as failed and reserved stock released.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(
      error.message === "Order not found." ? 404 : 400
    ).json({
      success: false,
      message: error.message || "Unable to update payment status.",
    });
  } finally {
    await session.endSession();
  }
});

// ==================================================
// ADMIN: PRODUCT SALES ANALYTICS
// GET /api/orders/analytics/products
// ==================================================

router.get(
  "/analytics/products",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const productSales = await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            orderStatus: { $ne: "cancelled" },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: {
              $sum: {
                $multiply: ["$items.price", "$items.quantity"],
              },
            },
          },
        },
        { $sort: { unitsSold: -1 } },
      ]);

      return res.status(200).json({
        success: true,
        products: productSales,
      });
    } catch (error) {
      console.error("Product analytics error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve product analytics.",
      });
    }
  }
);

// ==================================================
// ADMIN: GET PAYMENT PROOF
// GET /api/orders/:id/proof-of-payment
// ==================================================

router.get(
  "/:id/proof-of-payment",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      const proofId = order.paymentDetails?.proofOfPayment;

      if (!proofId) {
        return res.status(404).json({
          success: false,
          message: "No payment proof uploaded.",
        });
      }

      const fileExtension = proofId.split(".").pop().toLowerCase();

      const proofUrl = cloudinary.utils.private_download_url(
        proofId,
        fileExtension,
        {
          resource_type: "raw",
          type: "authenticated",
          expires_at: Math.floor(Date.now() / 1000) + 300,
        }
      );

      return res.status(200).json({
        success: true,
        proofUrl,
        expiresIn: 300,
      });
    } catch (error) {
      console.error("Payment proof retrieval error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve payment proof.",
      });
    }
  }
);

// ==================================================
// CUSTOMER: UPLOAD EFT PROOF
// POST /api/orders/:id/proof-of-payment
// ==================================================

router.post(
  "/:id/proof-of-payment",
  protect,
  upload.single("proof"),
  validateProofFile,
  async (req, res) => {
    let uploadedAsset;

    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a proof-of-payment file.",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      if (
        !order.user ||
        order.user.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorised to upload proof for this order.",
        });
      }

      if (order.paymentMethod !== "eft") {
        return res.status(400).json({
          success: false,
          message: "Proof of payment is only accepted for EFT orders.",
        });
      }

      if (order.orderStatus === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Proof cannot be uploaded for a cancelled order.",
        });
      }

      if (order.paymentStatus !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Proof cannot be uploaded for this payment status.",
        });
      }

      const fileExtension = {
        "application/pdf": "pdf",
        "image/png": "png",
        "image/jpeg": "jpg",
      }[req.file.mimetype];

      if (!fileExtension) {
        return res.status(400).json({
          success: false,
          message: "Only PDF, PNG and JPG files are accepted.",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "isanusi/payment-proofs",
            resource_type: "raw",
            type: "authenticated",
            public_id: `${order._id}-${Date.now()}.${fileExtension}`,
            overwrite: false,
          },
          (error, uploaded) => {
            if (error) return reject(error);
            resolve(uploaded);
          }
        );

        stream.end(req.file.buffer);
      });

      uploadedAsset = result;

      order.paymentDetails.proofOfPayment = result.public_id;
      await order.save();

      return res.status(200).json({
        success: true,
        message:
          "Proof of payment uploaded successfully. Your payment is awaiting verification.",
        paymentStatus: order.paymentStatus,
      });
    } catch (error) {
      console.error("Proof upload error:", error);

      if (uploadedAsset?.public_id) {
        try {
          await cloudinary.uploader.destroy(
            uploadedAsset.public_id,
            {
              resource_type: "raw",
              type: "authenticated",
            }
          );
        } catch (cleanupError) {
          console.error("Cloudinary cleanup error:", cleanupError);
        }
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to upload proof of payment. Please try again.",
      });
    }
  }
);

// ==================================================
// CUSTOMER: CREATE EFT ORDER AND RESERVE STOCK
// POST /api/orders
// ==================================================

router.post("/", protect, async (req, res) => {
  const {
    items,
    customer,
    deliveryAddress,
    deliveryMethod,
    deliveryDetails,
    paymentMethod,
  } = req.body;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // EFT is the only payment method accepted for new orders.
    if (paymentMethod !== "eft") {
      return res.status(400).json({
        success: false,
        message:
          "Only EFT / Bank Transfer is currently available.",
      });
    }

    if (!customer?.phone || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Customer phone and delivery details are required.",
      });
    }

    const requiredAddressFields = [
      "address",
      "suburb",
      "city",
      "province",
      "postalCode",
    ];

    for (const field of requiredAddressFields) {
      if (
        typeof deliveryAddress[field] !== "string" ||
        !deliveryAddress[field].trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `Delivery ${field} is required.`,
        });
      }
    }

    // Validate delivery choice and calculate fee on the server.
    let deliveryFee;

    try {
      deliveryFee = calculateDeliveryFee(
        deliveryMethod,
        deliveryAddress.suburb
      );
    } catch (deliveryError) {
      return res.status(400).json({
        success: false,
        message: deliveryError.message,
      });
    }

    let collectionPoint = "";
    let collectionPointCode = "";

    if (
      ["paxi_economy", "paxi_speed"].includes(deliveryMethod)
    ) {
      if (
        typeof deliveryDetails?.collectionPoint !== "string" ||
        !deliveryDetails.collectionPoint.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide your preferred PAXI collection point.",
        });
      }

      if (
        typeof deliveryDetails?.collectionPointCode !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide your PAXI collection point code.",
        });
      }

      collectionPoint = deliveryDetails.collectionPoint.trim();
      collectionPointCode = deliveryDetails.collectionPointCode
        .trim()
        .toUpperCase();

      if (!/^P\d{4}$/.test(collectionPointCode)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid PAXI point code, for example P6320.",
        });
      }
    }

    for (const item of items) {
      if (
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity in your cart.",
        });
      }
    }

    const session = await mongoose.startSession();

    let createdOrder;

    try {
      await session.withTransaction(async () => {
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
          const product = await Product.findOne({
            _id: item.productId,
            isActive: true,
          }).session(session);

          if (!product) {
            throw new Error(
              "A product in your cart is unavailable."
            );
          }

          if (
            product.sizes.length > 0 &&
            !product.sizes.includes(item.size)
          ) {
            throw new Error(
              `Invalid size selected for ${product.name}.`
            );
          }

          if (
            product.colors.length > 0 &&
            !product.colors.includes(item.color)
          ) {
            throw new Error(
              `Invalid colour selected for ${product.name}.`
            );
          }

          if (product.sizes.length > 0 && !item.size) {
            throw new Error(
              `Please select a size for ${product.name}.`
            );
          }

          if (product.colors.length > 0 && !item.color) {
            throw new Error(
              `Please select a colour for ${product.name}.`
            );
          }

          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: product._id,
              isActive: true,
              $expr: {
                $gte: [
                  {
                    $subtract: [
                      "$stock",
                      { $ifNull: ["$reservedStock", 0] },
                    ],
                  },
                  item.quantity,
                ],
              },
            },
            {
              $inc: {
                reservedStock: item.quantity,
              },
            },
            {
              new: true,
              session,
            }
          );

          if (!updatedProduct) {
            throw new Error(
              `Insufficient available stock for ${product.name}.`
            );
          }

          subtotal += product.price * item.quantity;

          orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            size: item.size || "",
            color: item.color || "",
            quantity: item.quantity,
          });
        }

        const order = await Order.create(
          [
            {
              user: req.user._id,

              customer: {
                name: req.user.name,
                email: req.user.email,
                phone: customer.phone.trim(),
              },

              items: orderItems,

              deliveryAddress: {
                address: deliveryAddress.address.trim(),
                suburb: deliveryAddress.suburb.trim(),
                city: deliveryAddress.city.trim(),
                province: deliveryAddress.province.trim(),
                postalCode: deliveryAddress.postalCode.trim(),
                notes: deliveryAddress.notes?.trim() || "",
              },

              deliveryMethod,

              deliveryDetails: {
                collectionPoint,
                collectionPointCode,
              },

              subtotal,
              deliveryFee,
              total: subtotal + deliveryFee,

              paymentMethod: "eft",
              paymentStatus: "pending",
              orderStatus: "pending",
              inventoryReserved: true,
            },
          ],
          { session }
        );

        createdOrder = order[0];
      });
    } finally {
      await session.endSession();
    }

    // ==================================================
    // SEND ORDER CONFIRMATION EMAIL
    // ==================================================

    const orderItemsHtml = createdOrder.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${escapeHtml(item.name)}
              <br />
              <small>
                Size: ${escapeHtml(item.size || "N/A")} |
                Colour: ${escapeHtml(item.color || "N/A")}
              </small>
            </td>

            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${item.quantity}
            </td>

            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${formatPrice(item.price * item.quantity)}
            </td>
          </tr>
        `
      )
      .join("");

    let emailSent = false;

    try {
      const emailResult = await sendEmail({
        to: createdOrder.customer.email,

        subject: `ISANUSI Clothing - Order Received #${createdOrder._id}`,

        html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
            <div style="max-width: 650px; margin: auto; background: #fff; padding: 30px; border-radius: 8px;">

              <h1 style="color: #121212;">
                ISANUSI <span style="color: #FF6B00;">CLOTHING</span>
              </h1>

              <h2>
                Thank you for your order,
                ${escapeHtml(createdOrder.customer.name)}!
              </h2>

              <p>We've successfully received your order.</p>

              <p>
                <strong>Order number:</strong>
                ${escapeHtml(createdOrder._id)}
              </p>

              <h3 style="color: #FF6B00;">Order summary</h3>

              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr>
                    <th style="padding: 12px; background: #121212; color: #fff;">Product</th>
                    <th style="padding: 12px; background: #121212; color: #fff;">Qty</th>
                    <th style="padding: 12px; background: #121212; color: #fff;">Total</th>
                  </tr>
                </thead>

                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 20px;">
                <p>
                  Subtotal:
                  <strong>${formatPrice(createdOrder.subtotal)}</strong>
                </p>

                <p>
                  Delivery:
                  <strong>${formatPrice(createdOrder.deliveryFee)}</strong>
                </p>

                <h3>
                  Total: ${formatPrice(createdOrder.total)}
                </h3>
              </div>

              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />

              <h3 style="color: #FF6B00;">Delivery information</h3>

              <p>
                <strong>Delivery method:</strong>
                ${escapeHtml(getDeliveryMethodName(createdOrder.deliveryMethod))}
              </p>

              <p>
                <strong>Delivery fee:</strong>
                ${formatPrice(createdOrder.deliveryFee)}
              </p>

              ${getPaxiCollectionPointHtml(createdOrder.deliveryDetails)}

              <h3>Delivery address</h3>

              <p>
                ${escapeHtml(createdOrder.deliveryAddress.address)}<br />
                ${escapeHtml(createdOrder.deliveryAddress.suburb)}<br />
                ${escapeHtml(createdOrder.deliveryAddress.city)}<br />
                ${escapeHtml(createdOrder.deliveryAddress.province)}<br />
                ${escapeHtml(createdOrder.deliveryAddress.postalCode)}
              </p>

              ${
                createdOrder.deliveryAddress.notes
                  ? `
                    <p>
                      <strong>Delivery notes:</strong>
                      ${escapeHtml(createdOrder.deliveryAddress.notes)}
                    </p>
                  `
                  : ""
              }

              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />

              <h3>Payment information</h3>

              <p>
                Payment method:
                <strong>EFT / Bank Transfer</strong>
              </p>

              <p>
                Payment status:
                <strong>Pending</strong>
              </p>

              <p>
                Your order has been received, but this email does not confirm payment.
                We will update you when your payment has been verified.
              </p>

              <h3 style="color: #FF6B00;">
                The Future Belongs to the Unfazed.
              </h3>

              <p>Thank you for shopping with ISANUSI Clothing.</p>
              <p>ISANUSI Clothing Team</p>

            </div>
          </div>
        `,
      });

      emailSent = Boolean(emailResult.success);

      if (!emailSent) {
        console.error(
          "Order confirmation email failed:",
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error(
        "Order confirmation email error:",
        emailError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Your order has been placed successfully.",
      emailSent,
      order: createdOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to place your order.",
    });
  }
});

module.exports = router;