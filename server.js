require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("./db");
const { ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

let PORT = process.env.PORT || 5000;

// 🔥 START EVERYTHING INSIDE ASYNC FUNCTION
async function startServer() {
  try {
    // Connect DB FIRST
    await connectDB();
    console.log("✅ DB Connected");

    // 🚀 START SERVER
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start:", err);
  }
}

startServer();


// 📦 GET PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ➕ ADD PRODUCT (FIXED)
app.post("/add-product", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const db = getDB();
    const { name, category, stock } = req.body;

    if (!name || !category || stock === undefined) {
      return res.status(400).json({ message: "All fields required" });
    }

    await db.collection("products").insertOne({
      name,
      category,
      stock: parseInt(stock),
      createdAt: new Date()
    });

    res.json({ message: "✅ Product Added Successfully" });

  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🔄 UPDATE STOCK
app.put("/update-stock/:id", async (req, res) => {
  try {
    const db = getDB();

    await db.collection("products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { stock: parseInt(req.body.stock) } }
    );

    res.json({ message: "Stock updated" });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ❌ DELETE PRODUCT
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const db = getDB();

    await db.collection("products").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});