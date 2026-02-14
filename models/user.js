import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  purchaseItems: [
  {
    item: String,
    date: {
      type: Date,
      default: Date.now
    },
    addedBy: String   // worker name
  }
],
  dob: Date,
  anniversary: Date,
  membershipTier: { type: String, default: "Silver" },
  purchaseCount: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 },
  referredBy: String,
  photo: String,
  membershipID: String,
  cardUrl: String,
  cardExpiry: Date,
  referralCode: { type: String },
  fcmToken: { type: String, default: null }  // 🆕 FCM token for push notifications
}, { timestamps: true });


export default mongoose.model("User", userSchema);
