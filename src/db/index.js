import mongoose from "mongoose";
import { DATABASE_NAME } from '../constant.js';

const connectDB = async () => {
  try {
    const rawUrl = process.env.MONGODB_URL || "";
    // Clean trailing database name like /test or trailing slash if present
    const baseUrl = rawUrl.replace(/\/test\/?$/, "").replace(/\/+$/, "");
    const targetDb = process.env.DATABASE_NAME || DATABASE_NAME;

    const connectionInstance = await mongoose.connect(baseUrl, {
      dbName: targetDb,
    });
    console.log(`Database connected successfully: ${connectionInstance.connection.host} [DB: ${connectionInstance.connection.name}]`);
  } catch (error) {
    console.log("Error in database connection:", error);
    process.exit(1);
  }
};

export default connectDB;