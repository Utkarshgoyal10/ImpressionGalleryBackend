import express from "express";
import Activity from "../models/activity.js";
import User from "../models/user.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

/* =====================================================
   Helper: Get Day Range
===================================================== */
// IST based day range (correct for India)
const getDayRange = (offset = 0) => {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes

  const now = new Date();

  // Convert current UTC time to IST
  const istNow = new Date(now.getTime() + IST_OFFSET);

  // Move to required day
  istNow.setDate(istNow.getDate() - offset);

  // Start of IST day
  const startIST = new Date(istNow);
  startIST.setHours(0, 0, 0, 0);

  // End of IST day
  const endIST = new Date(istNow);
  endIST.setHours(23, 59, 59, 999);

  // Convert IST back to UTC for MongoDB query
  const startUTC = new Date(startIST.getTime() - IST_OFFSET);
  const endUTC = new Date(endIST.getTime() - IST_OFFSET);

  return { start: startUTC, end: endUTC };
};

/* =====================================================
   Dashboard Summary (Last 3 Days)
   Returns count only
===================================================== */
router.get("/dashboard-summary-last-3-days", async (req, res) => {
  try {
    const days = ["today", "yesterday", "dayBefore"];
    const offsets = [0, 1, 2];

    const result = {};

    for (let i = 0; i < days.length; i++) {
      const { start, end } = getDayRange(offsets[i]);

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

      result[days[i]] = {
        created,
        updated,
        total
      };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching summary" });
  }
});

/* =====================================================
   Activity Details
   GET /auth/activity/:type/:day
===================================================== */
router.get("/activity/:type/:day", async (req, res) => {
  try {
    const { type, day } = req.params;

    let offset = 0;
    if (day === "today") offset = 0;
    else if (day === "yesterday") offset = 1;
    else if (day === "day-before") offset = 2;
    else return res.status(400).json({ msg: "Invalid day" });

    const { start, end } = getDayRange(offset);

    let query = {
      createdAt: { $gte: start, $lte: end }
    };

    if (type === "created") {
      query.actionType = "created";
    } else if (type === "updated") {
      query.actionType = { $in: ["purchase", "referral"] };
    } else if (type === "purchase") {
      query.actionType = "purchase";
    } else if (type === "referral") {
      query.actionType = "referral";
    } else if (type === "total") {
      // no filter
    } else {
      return res.status(400).json({ msg: "Invalid type" });
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(500);

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching activity" });
  }
});

export default router;