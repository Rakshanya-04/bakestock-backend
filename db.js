const { MongoClient } = require("mongodb");
require("dotenv").config();

let dbConnection;

module.exports = {
  connectDB: async () => {
    try {
      // Use your Environment Variable here
      const client = await MongoClient.connect(process.env.MONGO_URL);
      dbConnection = client.db("BakeStock"); // Make sure this matches your DB name
      console.log("✅ MongoDB Connected successfully");
    } catch (err) {
      console.error("❌ DB Connection Error:", err);
      throw err;
    }
  },
  getDB: () => {
    if (!dbConnection) {
      throw new Error("Database not connected");
    }
    return dbConnection;
  },
};