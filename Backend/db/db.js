const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.CONNECT);
    console.log("Connected to DB");
    
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
