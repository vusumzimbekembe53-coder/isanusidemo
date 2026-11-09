require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "ISANUSI Palm Print Tee",
    description: "Tropical energy meets urban grit.",
    price: 599,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White"],
    stock: 20,
    featured: true,
  },
  {
    name: "ISANUSI Black Icon Tee",
    description: "Classic, bold, and unfazed.",
    price: 599,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    stock: 20,
    featured: true,
  },
  {
    name: "ISANUSI Soft Pink Logo Tee",
    description: "Clean pastel tone with street attitude.",
    price: 599,
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Pink"],
    stock: 20,
    featured: true,
  },
  {
    name: "ISANUSI Unfazed Hoodie",
    description: "A heavyweight everyday hoodie for those who stay unfazed.",
    price: 999,
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    stock: 10,
    featured: false,
  },
  {
    name: "ISANUSI Signature Cap",
    description: "A minimal ISANUSI cap with signature streetwear energy.",
    price: 399,
    category: "Accessories",
    sizes: ["One Size"],
    colors: ["Black"],
    stock: 15,
    featured: false,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const product of products) {
      await Product.findOneAndUpdate(
        { name: product.name },
        { $setOnInsert: product },
        { upsert: true, new: true }
      );
    }

    console.log("Products seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();