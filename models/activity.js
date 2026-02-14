import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
     userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    userName: String,

    actionType: {
      type: String,
      enum: ["created", "purchase", "referral"]
    },

    previousCount: Number,
    newCount: Number,

    item: String,
    referee: String, // for referral actions

    performedBy: String,
    role: String
  },
  {
    timestamps: true
  }
);

/* ================= INDEXES (IMPORTANT for analytics speed) ================= */

// For dashboard date queries
activitySchema.index({ createdAt: -1 });

// For action type + date filtering
activitySchema.index({ actionType: 1, createdAt: -1 });

// For worker performance
activitySchema.index({ performedBy: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);