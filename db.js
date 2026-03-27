const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

let client;
let db;

async function connectDB() {
  try {
    client = new MongoClient(uri);
    await client.connect();

    db = client.db("bakestock"); // your DB name
    console.log("✅ MongoDB Connected");

  } catch (err) {
    console.error("❌ DB Error:", err);
  }
}

function getDB() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db;
}

module.exports = { connectDB, getDB };