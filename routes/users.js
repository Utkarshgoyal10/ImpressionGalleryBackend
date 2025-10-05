import express from "express";
import User from "../models/user.js";
import { protect } from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendSMS } from "../utils/sendSMS.js";
import {upload} from  "../middleware/multer.middleware.js"
import { membershipCardTemplate } from "../templates/membershipCardTemplate.js";
import QRCode from "qrcode";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ownerNotificationTemplate from "../templates/ownerNotificationTemplate.js"; // 🆕 new email template

const router = express.Router();

router.post("/save-token", async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ message: "Email or token missing" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fcmToken = token; // ✅ update field
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.use(protect);

// Create customer
router.post("/", upload.fields([{ name: "photo", maxCount: 1 }]), async (req, res) => {
  try {
    const { name, email, phone, dob, anniversary, referredBy } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    // Photo check
    const profileImageLocalPath = req.files?.photo?.[0]?.path;
    if (!profileImageLocalPath) {
      return res.status(400).json({ msg: "Profile image not uploaded" });
    }

    // Upload to Cloudinary
    const profileImage = await uploadOnCloudinary(profileImageLocalPath);
    if (!profileImage) {
      return res.status(500).json({ msg: "Image not uploaded successfully" });
    }

    // Card expiry → 6 months
    const cardExpiry = new Date();
    cardExpiry.setMonth(cardExpiry.getMonth() + 6);

    // Create user
    const user = new User({
      name,
      email,
      phone,
      dob,
      anniversary,
      photo: profileImage.url,
      referredBy,
      cardExpiry,
      purchaseCount: 1,
      referralCount: referredBy ? 1 : 0,
      membershipTier: "Silver",
    });

    // Generate QR Code
    const qrDataUrl = await QRCode.toDataURL(user._id.toString());
    user.membershipID = user._id;
    user.cardUrl = qrDataUrl;

    await user.save(); // 🕒 timestamps: createdAt, updatedAt automatically saved

    // Prepare customer email
    const cardHtml = membershipCardTemplate(user);
    await sendEmail(email, "🎉 Your Digital Membership Card", cardHtml);

    // 🆕 Notify the shop owner
    const ownerEmail = process.env.OWNER_EMAIL || "shopowner@example.com";
    const ownerHtml = ownerNotificationTemplate({
      action: "New Card Created",
      customer: user,
      time: new Date().toLocaleString(),
    });
    await sendEmail(ownerEmail, "🆕 New Customer Card Created", ownerHtml);

    res.status(201).json({ msg: "User created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating user", err });
  }
});


// Get customer by membershipID, email, or phone
router.get("/", async (req, res) => {
  const { membershipID, email, phone } = req.query;

  const user = await User.findOne({
    $or: [
      { _id: membershipID },
      { email },
      { phone }
    ]
  });

  if (!user) return res.status(404).json({ msg: "User not found" });
  res.json(user);
});

// Update purchase count & membership tier
router.put("/purchase", async (req, res) => {
  const { id, email, phone } = req.body;

  const user = await User.findOne({
    $or: [{ _id: id }, { email }, { phone }]
  });

  if (!user) return res.status(404).json({ msg: "User not found" });

  const oldTier = user.membershipTier;
  const oldCount = user.purchaseCount;
  const oldreferralCount = user.referralCount;

  user.purchaseCount += 1;
  if (user.purchaseCount === 3) user.membershipTier = "Gold";
  if (user.purchaseCount === 6) user.membershipTier = "Platinum";

  const newExpiry = new Date();
  newExpiry.setMonth(newExpiry.getMonth() + 6);
  user.cardExpiry = newExpiry;
  user.lastUpdatedAt = new Date();

  const qrDataUrl = await QRCode.toDataURL(user._id.toString());
  user.cardUrl = qrDataUrl;

  await user.save();

  // Email to customer
  const cardHtml = `
    <h1>Your Card Has Been Updated</h1>
    <p>Name: ${user.name}</p>
    <p>New Tier: ${user.membershipTier}</p>
    <p>Card Expiry: ${user.cardExpiry.toDateString()}</p>
    <img src="${qrDataUrl}" width="150"/>
  `;
  await sendEmail(user.email, "Your Updated Membership Card", cardHtml);

  // 📨 Email to Owner
  const ownerEmailHtml = `
    <h2>Customer Card Updated</h2>
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
    <p><strong>Previous Tier:</strong> ${oldTier}</p>
    <p><strong>New Tier:</strong> ${user.membershipTier}</p>

    <p><strong>Previous Purchases:</strong> ${oldCount}</p>
    <p><strong>New Purchase Count:</strong> ${user.purchaseCount}</p>
    <p><strong>Previous Purchases:</strong> ${oldreferralCount}</p>
    <p><strong>New Purchase Count:</strong> ${user.referralCount}</p>
    <p><strong>Card Expiry:</strong> ${user.cardExpiry.toDateString()}</p>
    <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
  `;
  await sendEmail(process.env.OWNER_EMAIL, `Card Updated: ${user.name}`, ownerEmailHtml);

  res.json({ msg: "Purchase updated, card sent", user });
});


router.put("/referral", async (req, res) => {
  try {
    const { id, email, phone } = req.body;

    // Find user by ID, email, or phone
    const user = await User.findOne({
      $or: [{ _id: id }, { email }, { phone }],
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Update referral count
    const oldTier = user.membershipTier;
    const oldCount = user.purchaseCount;
    const oldreferralCount = user.referralCount;
    user.referralCount += 1;

    // 🆕 Optional: If referrals reach a milestone, upgrade tier
    if (user.referralCount >= 3 && user.membershipTier === "Silver")
      user.membershipTier = "Gold";
    else if (user.referralCount >= 6)
      user.membershipTier = "Platinum";


    // Generate updated QR code
    const qrDataUrl = await QRCode.toDataURL(user._id.toString());
    user.cardUrl = qrDataUrl;

    await user.save();

    // 🕒 Timestamps are automatically updated (timestamps: true in schema)

    // Send email to the user — updated membership card
    const cardHtml = membershipCardTemplate(user);
    await sendEmail(
      user.email,
      "🎉 Your Membership Card Updated",
      cardHtml
    );

    // 🧑‍💼 Send email to the shop owner about this update
    const ownerEmail = process.env.OWNER_EMAIL || "shopowner@example.com";
     const ownerEmailHtml = `
    <h2>Customer Card Updated</h2>
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
    <p><strong>Previous Tier:</strong> ${oldTier}</p>
    <p><strong>New Tier:</strong> ${user.membershipTier}</p>

    <p><strong>Previous Purchases:</strong> ${oldCount}</p>
    <p><strong>New Purchase Count:</strong> ${user.purchaseCount}</p>
    <p><strong>Previous Referal:</strong> ${oldreferralCount}</p>
    <p><strong>New Referal Count:</strong> ${user.referralCount}</p>
    <p><strong>Card Expiry:</strong> ${user.cardExpiry.toDateString()}</p>
    <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
  `;
    await sendEmail(ownerEmail, "🔁 Customer Referral Updated", ownerEmailHtml);

    res.json({
      msg: "Referral updated successfully and emails sent.",
      user,
    });
  } catch (err) {
    console.error("Referral update error:", err);
    res.status(500).json({ msg: "Error updating referral", err });
  }
});

export default router;
