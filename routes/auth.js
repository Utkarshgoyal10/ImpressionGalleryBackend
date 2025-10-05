import express from "express";
import Worker from "../models/worker.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { protect } from "../middleware/auth.js";
import User from "../models/user.js";

const router = express.Router();


router.post("/signup", async (req, res) => {
  try {
    const {name, email, password, role } = req.body;

    const existing = await Worker.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Worker already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const worker = new Worker({
        name,
      email,
      passwordHash,
      role: role || "worker"
    });

    await worker.save();

    // Send welcome email
    await sendEmail(email, "Welcome to Mobile Shop", "<h1>Your worker account has been created!</h1>");

    res.json({ msg: "Worker created successfully", worker });
  } catch (err) {
    res.status(500).json({ msg: "Error creating worker", err });
  }
});
// Login → send verification code
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const worker = await Worker.findOne({ email });
  if (!worker) return res.status(404).json({ msg: "Worker not found" });

  const match = await bcrypt.compare(password, worker.passwordHash);
  if (!match) return res.status(401).json({ msg: "Invalid credentials" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  worker.verificationCode = code;
  worker.verificationExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
  await worker.save();

  await sendEmail(worker.email, "Your Login Verification Code", `<h1>${code}</h1>`);

  res.json({ msg: "Verification code sent to email" });
});

// Verify login → return JWT valid for 2 days
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  const worker = await Worker.findOne({ email });
  if (!worker) return res.status(404).json({ msg: "Worker not found" });

  if (worker.verificationCode !== code || Date.now() > worker.verificationExpiry) {
    return res.status(401).json({ msg: "Invalid or expired code" });
  }

  const token = jwt.sign({ id: worker._id, role: worker.role, name:worker.name }, process.env.JWT_SECRET, { expiresIn: "2d" });

  res.json({ msg: "Login successful", token, worker: { name:worker.name, id: worker._id, email: worker.email, role: worker.role } });
});

router.get("/me", protect, async (req, res) => {
  res.json({ worker: req.worker });
});
// GET today's created and updated users
// Helper function to get users by type and day
const getUsersByDay = async (type = "created", offset = 0) => {
  const { start, end } = getDayRange(offset);
  const filter = type === "created" ? { createdAt: { $gte: start, $lte: end } } : { updatedAt: { $gte: start, $lte: end } };
  return await User.find(filter).sort(type === "created" ? { createdAt: -1 } : { updatedAt: -1 });
};

// 🔹 Users Created Today / Yesterday / Day Before
router.get("/:type/:day", protect, async (req, res) => {
  try {
    const { type, day } = req.params;

    let offset = 0;
    if (day === "today") offset = 0;
    else if (day === "yesterday") offset = 1;
    else if (day === "day-before") offset = 2;
    else return res.status(400).json({ msg: "Invalid day parameter" });

    if (!["created", "updated", "total"].includes(type)) {
      return res.status(400).json({ msg: "Invalid type parameter" });
    }

    if (type === "total") {
      // Total users up to that day
      const { end } = getDayRange(offset);
      const users = await User.find({ createdAt: { $lte: end } }).sort({ createdAt: -1 });
      return res.json(users);
    }

    const users = await getUsersByDay(type, offset);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching users" });
  }
});

// Helper function to get start & end of a day
const getDayRange = (offset = 0) => {
  const day = new Date();
  day.setDate(day.getDate() - offset);
  day.setHours(0, 0, 0, 0);
  const start = new Date(day);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// 🔹 Dashboard summary (last 3 days)
router.get("/dashboard-summary-last-3-days", protect, async (req, res) => {
  try {
    const days = ["today", "yesterday", "dayBefore"];
    const stats = {};

    for (let i = 0; i < 3; i++) {
      const { start, end } = getDayRange(i);

      const created = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
      const updated = await User.countDocuments({ updatedAt: { $gte: start, $lte: end } });
      const total = await User.countDocuments({ createdAt: { $lte: end } }); // total users up to that day

      stats[days[i]] = { created, updated, total };
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching dashboard summary" });
  }
});




export default router;
