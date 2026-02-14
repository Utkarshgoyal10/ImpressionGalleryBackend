import express from "express";
import User from "../models/user.js";

const router = express.Router();


router.get("/card", async (req, res) => {
  try {
    const { phone, dob } = req.query;

    if (!phone || !dob) {
      return res.status(400).json({ msg: "Phone and DOB are required" });
    }

    // convert dob to date format (ensure same as stored in DB)
    const formattedDob = new Date(dob);

    const user = await User.findOne({
      phone,
      dob: dob
    });

    if (!user) {
      return res.status(404).json({ msg: "No customer found with these details" });
    }

    // prepare card info
    const cardDetails = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      membershipTier: user.membershipTier,
      membershipID: user._id,
      cardExpiry: user.cardExpiry,
      cardUrl: user.cardUrl,
      referralCode: user.referralCode,
      purchaseCount: user.purchaseCount,
      referralCount: user.referralCount,
      photoUrl: user.photo,
      dob: user.dob
    };

    res.status(200).json({
      msg: "Customer card found",
      cardDetails
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
