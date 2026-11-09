
const express = require("express");
const multer = require("multer");
const FileType = require("file-type");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Product image upload configuration
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG and WebP images are allowed.")
      );
    }

    cb(null, true);
  },
});

// Upload a buffer to Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "isanusi/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}

// GET all active products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// GET featured products
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      featured: true,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    });
  }
});

// UPLOAD product images
router.post(
  "/upload-images",
  protect,
  adminOnly,
  imageUpload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one image.",
        });
      }

      // Verify actual file contents, not just the supplied MIME type
      for (const file of req.files) {
        const detectedType = await FileType.fromBuffer(file.buffer);

        if (
          !detectedType ||
          !allowedMimeTypes.includes(detectedType.mime) ||
          detectedType.mime !== file.mimetype
        ) {
          return res.status(400).json({
            success: false,
            message: "One or more files are not valid images.",
          });
        }
      }

      const uploadedImages = [];

      try {
        for (const file of req.files) {
          const uploaded = await uploadToCloudinary(file.buffer);
          uploadedImages.push(uploaded);
        }
      } catch (uploadError) {
        // Clean up any images uploaded before a failure
        await Promise.all(
          uploadedImages.map((image) =>
            cloudinary.uploader.destroy(image.publicId).catch(() => null)
          )
        );

        throw uploadError;
      }

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully.",
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Product image upload error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to upload product images.",
      });
    }
  }
);

// CREATE product
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE product
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE product
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET one product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
});

module.exports = router;