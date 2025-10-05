import express from "express";
import User from "../models/user.js";
import Worker from "../models/worker.js";

const router = express.Router();

// Owner dashboard - get all users and workers
router.get("/dashboard", async (req, res) => {
  try {
    const users = await User.find();
    const workers = await Worker.find();
    res.json({ users, workers });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching dashboard data" });
  }
});

export default router;
