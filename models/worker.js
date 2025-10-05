import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },         // ✅ worker name
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "worker" },     // worker or owner
  verificationCode: String,
  verificationExpiry: Date
}, { timestamps: true });

export default mongoose.model("Worker", workerSchema);
