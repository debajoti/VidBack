import mongoose from "mongoose";
import 'dotenv/config'

export default async function dbConnect() {
    await mongoose.connect(String(process.env.MONGODB_URI));
    console.log("MongoDB Connected Successfully...");
}