
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
    }],
    sizes: [{
      type: String,
    }],
    colors: [{
      type: String,
    }],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

reservedStock: {
  type: Number,
  default: 0,
  min: 0,
},



    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);