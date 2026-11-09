const multer = require("multer");
const FileType = require("file-type");

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only PDF, JPG and PNG files are allowed.")
      );
    }

    cb(null, true);
  },
});

async function validateProofFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your proof of payment.",
      });
    }

    const detectedType = await FileType.fromBuffer(req.file.buffer);

    const allowedDetectedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (
      !detectedType ||
      !allowedDetectedTypes.includes(detectedType.mime) ||
      detectedType.mime !== req.file.mimetype
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid file. Upload a genuine PDF, JPG or PNG.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload,
  validateProofFile,
};