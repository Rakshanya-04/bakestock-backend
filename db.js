require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URL;

const client = new MongoClient(uri);

let db;

// Connect function
async function connectDB() {
    try {
        await client.connect();
        db = client.db("bakestock"); // database name
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ DB Connection Failed:", error);
        process.exit(1);
    }
}

// Get DB
function getDB() {
    if (!db) {
        throw new Error("Database not initialized!");
    }
    return db;
}

module.exports = { connectDB, getDB };