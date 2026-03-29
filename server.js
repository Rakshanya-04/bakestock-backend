require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("./db");
const { ObjectId } = require("mongodb");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- ROUTES ---

// 🔍 Health Check (Check this in your browser first!)
app.get("/", (req, res) => {
  res.send("Bakestock Backend is Running! 🚀");
});

// 📦 GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ➕ ADD PRODUCT
app.post("/add-product", async (req, res) => {
  try {
    const { name, category, stock } = req.body;

    // Validation
    if (!name || !category || stock === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = getDB();
    const result = await db.collection("products").insertOne({
      name,
      category,
      stock: parseInt(stock) || 0, // Ensure it's a number
      createdAt: new Date()
    });

    console.log("✅ Product Added:", result.insertedId);
    res.status(201).json({ message: "✅ Product Added Successfully" });

  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// 🔄 UPDATE STOCK
app.put("/update-stock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const db = getDB();
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: { stock: parseInt(stock) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// ❌ DELETE PRODUCT
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    
    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// --- SERVER STARTUP ---

async function startServer() {
  try {
    // 1. Connect to DB first
    await connectDB();
    console.log("✅ Database Connection Established");

    // 2. Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is live on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ CRITICAL: Failed to start server:", err);
    process.exit(1); // Stop the process if DB connection fails
  }
}

startServer();