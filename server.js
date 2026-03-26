require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("./db");
const { ObjectId } = require("mongodb");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// 📦 GET all products
app.get("/products", async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ ADD product
app.post("/add-product", async (req, res) => {
  try {
    const db = getDB();
    const { name, category, stock } = req.body;

    if (!name || !category || stock === undefined) {
      return res.status(400).json({ message: "All fields required" });
    }

    const result = await db.collection("products").insertOne({
      name,
      category,
      stock: parseInt(stock),
      createdAt: new Date(), // track creation date
    });

    res.json({
      message: "Product added successfully",
      id: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔄 UPDATE stock
app.put("/update-stock/:id", async (req, res) => {
  try {
    const db = getDB();
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ message: "Stock required" });
    }

    await db.collection("products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { stock: parseInt(stock) } }
    );

    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ DELETE product
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const db = getDB();
    await db.collection("products").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Dashboard data
app.get("/dashboard-data", async (req, res) => {
  try {
    const db = getDB();

    const totalProducts = await db.collection("products").countDocuments();
    const lowStockItems = await db
      .collection("products")
      .countDocuments({ stock: { $lt: 20 } }); // low stock threshold
    const itemsAddedToday = await db
      .collection("products")
      .countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)), // today
        },
      });
    const stockUpdates = await db.collection("products").countDocuments({
      stock: { $exists: true },
    }); // simple count, can adjust if you track updates separately

    const recentStock = await db
      .collection("products")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({
      totalProducts,
      lowStockItems,
      itemsAddedToday,
      stockUpdates,
      recentStock,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});