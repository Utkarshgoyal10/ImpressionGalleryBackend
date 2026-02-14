import express from "express";
import Worker from "../models/worker.js";
import User from "../models/user.js";
import Activity from "../models/activity.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* =====================================================
   WORKER SIGNUP
===================================================== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await Worker.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "Worker already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const worker = new Worker({
      name,
      email,
      passwordHash,
      role: role || "Employee"
    });

    await worker.save();

    await sendEmail(
      email,
      "Welcome to Impression Gallery",
      "<h2>Your worker account has been created successfully!</h2>"
    );

    res.json({ msg: "Worker created successfully", worker });
  } catch (err) {
    res.status(500).json({ msg: "Error creating worker", err });
  }
});

/* =====================================================
   LOGIN → SEND OTP
===================================================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const worker = await Worker.findOne({ email });
  if (!worker) return res.status(404).json({ msg: "Worker not found" });

  const match = await bcrypt.compare(password, worker.passwordHash);
  if (!match) return res.status(401).json({ msg: "Invalid credentials" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  worker.verificationCode = code;
  worker.verificationExpiry = Date.now() + 10 * 60 * 1000;
  await worker.save();

  await sendEmail(worker.email, "Login Verification Code", `<h1>${code}</h1>`);

  res.json({ msg: "Verification code sent to email" });
});

/* =====================================================
   VERIFY LOGIN → JWT
===================================================== */
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  const worker = await Worker.findOne({ email });
  if (!worker) return res.status(404).json({ msg: "Worker not found" });

  if (
    worker.verificationCode !== code ||
    Date.now() > worker.verificationExpiry
  ) {
    return res.status(401).json({ msg: "Invalid or expired code" });
  }

  const token = jwt.sign(
    { id: worker._id, role: worker.role, name: worker.name },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

  res.json({
    msg: "Login successful",
    token,
    worker: {
      id: worker._id,
      name: worker.name,
      email: worker.email,
      role: worker.role
    }
  });
});

/* =====================================================
   GET CURRENT WORKER
===================================================== */
router.get("/me", protect, async (req, res) => {
  res.json({ worker: req.worker });
});

/* =====================================================
   HELPER → DAY RANGE
===================================================== */
const getDayRange = (offset = 0) => {
  const day = new Date();
  day.setDate(day.getDate() - offset);
  day.setHours(0, 0, 0, 0);

  const start = new Date(day);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/* =====================================================
   DASHBOARD SUMMARY (ACTIVITY BASED)
   Matches OwnerDashboard cards
===================================================== */
router.get("/dashboard-summary-last-3-days", protect, async (req, res) => {
  try {
    const days = ["today", "yesterday", "dayBefore"];
    const stats = {};

    for (let i = 0; i < 3; i++) {
      const { start, end } = getDayRange(i);

      const created = await Activity.countDocuments({
        actionType: "created",
        createdAt: { $gte: start, $lte: end }
      });

      const updated = await Activity.countDocuments({
        actionType: { $in: ["purchase", "referral"] },
        createdAt: { $gte: start, $lte: end }
      });

      const total = await Activity.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });

      stats[days[i]] = { created, updated, total };
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching dashboard summary" });
  }
});

/* =====================================================
   ACTIVITY DETAILS (FOR ANALYTICS MODAL)
   /auth/activity/:type/:day
===================================================== */
router.get("/activity/:type/:day", protect, async (req, res) => {
  try {
    const { type, day } = req.params;

    let offset = 0;
    if (day === "today") offset = 0;
    else if (day === "yesterday") offset = 1;
    else if (day === "day-before") offset = 2;
    else return res.status(400).json({ msg: "Invalid day parameter" });

    const { start, end } = getDayRange(offset);

    let filter = {
      createdAt: { $gte: start, $lte: end }
    };

    if (type === "created") {
      filter.actionType = "created";
    } 
    else if (type === "updated") {
      filter.actionType = { $in: ["purchase", "referral"] };
    }
    // type === "total" → all actions

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(500);

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching activity data" });
  }
});

export default router;