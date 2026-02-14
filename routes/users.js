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
import { updatedMembershipCardTemplate } from "../templates/updatedMembershipCardTemplate.js";
import Activity from "../models/activity.js";

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
    const {
      name,
      email,
      phone,
      dob,
      anniversary,
      referredBy,
      purchaseItem
    } = req.body;

    /* ================= VALIDATION ================= */

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ msg: "User already exists" });

    const photoPath = req.files?.photo?.[0]?.path;
    if (!photoPath)
      return res.status(400).json({ msg: "Profile image required" });

    const uploadedImage = await uploadOnCloudinary(photoPath);

    /* ================= REFERRAL CHECK ================= */

    let refUser = null;

    if (referredBy) {
      refUser = await User.findOne({ phone: referredBy });

      if (!refUser) {
        return res.status(400).json({
          msg: "Invalid referral mobile number"
        });
      }
    }

    /* ================= CREATE CUSTOMER ================= */

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6);

    const initialTier = "Silver";

    const newUser = new User({
      name,
      email,
      phone,
      dob,
      anniversary,
      photo: uploadedImage.url,
      referredBy,
      purchaseCount: purchaseItem ? 1 : 0,
      purchaseItems: purchaseItem
        ? [
            {
              item: purchaseItem,
              addedBy: req.worker.name
            }
          ]
        : [],
      referralCount: 0,
      membershipTier: initialTier,
      cardExpiry: expiry
    });

    const qr = await QRCode.toDataURL(newUser._id.toString());
    newUser.membershipID = newUser._id;
    newUser.cardUrl = qr;

    await newUser.save();

    /* ================= ACTIVITY: CREATED ================= */

    await Activity.create({
      userId: newUser._id,
      userName: newUser.name,
      actionType: "created",
      previousCount: 0,
      item: purchaseItem || null,
      newCount: newUser.purchaseCount,
      performedBy: req.worker.name,
      role: req.worker.role
    });

    /* ================= EMAIL TO CUSTOMER ================= */

    const cardPayload = {
      user: newUser.toObject(),
      productImages: [
        "http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051281/ojxypn5khy4tsctqtix6.jpg",
        "http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051280/a43xq1yhskh7xtxlrchq.jpg",
        "http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051278/fvtfrfosbcnqlyjse2vr.webp"
      ]
    };

    const cardHtml = membershipCardTemplate(cardPayload);

    await sendEmail(
      email,
      `Welcome to Impression Gallery! Your ${initialTier} Membership Card`,
      cardHtml
    );

    /* ================= OWNER NOTIFICATION ================= */

    const ownerEmail = process.env.OWNER_EMAIL;

    const ownerHtml = ownerNotificationTemplate({
      action: "New Card Created",
      customer: newUser.toObject(),
      time: new Date().toLocaleString()
    });

    await sendEmail(ownerEmail, "🆕 New Customer Card Created", ownerHtml);

    /* =====================================================
       REFERRAL UPDATE (if referral mobile provided)
    ===================================================== */

    if (refUser) {
      const oldTier = refUser.membershipTier;
      const oldReferralCount = refUser.referralCount;

      refUser.referralCount += 1;

      // Tier upgrade
      if (refUser.referralCount >= 6)
        refUser.membershipTier = "Platinum";
      else if (refUser.referralCount >= 3)
        refUser.membershipTier = "Gold";

      await refUser.save();

      // Activity log
      await Activity.create({
        userId: refUser._id,
        userName: refUser.name,
        actionType: "referral",
        previousCount: oldReferralCount,
        newCount: refUser.referralCount,
        performedBy: req.worker.name,
        referee: newUser.name,
        role: req.worker.role
      });

      // Email to referrer
      const refPayload = { user: refUser.toObject() };
      const refHtml = membershipCardTemplate(refPayload);

      await sendEmail(
        refUser.email,
        "🎉 Your Referral Count Updated",
        refHtml
      );

      // Owner notification for referral
      const referralOwnerHtml = `
        <h2>Referral Added</h2>
        <p><strong>Referrer:</strong> ${refUser.name}</p>
        <p><strong>Phone:</strong> ${refUser.phone}</p>
        <p><strong>Previous Tier:</strong> ${oldTier}</p>
        <p><strong>New Tier:</strong> ${refUser.membershipTier}</p>
        <p><strong>Previous Referrals:</strong> ${oldReferralCount}</p>
        <p><strong>New Referrals:</strong> ${refUser.referralCount}</p>
        <p><strong>Referred Customer:</strong> ${newUser.name}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `;

      await sendEmail(
        ownerEmail,
        "🔁 Customer Referral Added",
        referralOwnerHtml
      );
    }

    /* ================= RESPONSE ================= */

    res.status(201).json({
      msg: "User created successfully",
    });

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
router.put("/purchase", protect, async (req, res) => {
  try {
    
    const { phone, dob, purchaseItem } = req.body;

    /* ================= VALIDATION ================= */


    if ( !phone) {
      return res.status(400).json({ msg: "Phone is required" });
    }

    if (!dob) {
      return res.status(400).json({ msg: "DOB is required" });
    }

    /* ================= FIND USER ================= */

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // DOB verification
    if (user.dob.toISOString().split("T")[0] !== dob) {
      return res.status(400).json({ msg: "DOB does not match" });
    }

    /* ================= SAVE OLD DATA ================= */

    const oldTier = user.membershipTier;
    const oldCount = user.purchaseCount;
    const oldReferralCount = user.referralCount;

    /* ================= UPDATE PURCHASE ================= */

    user.purchaseCount += 1;

    // Save purchase item history
    if (purchaseItem) {
      user.purchaseItems.push({
        item: purchaseItem,
        addedBy: req.worker.name
      });
    }

    /* ================= TIER UPDATE ================= */

    if (user.purchaseCount >= 6)
      user.membershipTier = "Platinum";
    else if (user.purchaseCount >= 3)
      user.membershipTier = "Gold";
    else
      user.membershipTier = "Silver";

    /* ================= EXTEND EXPIRY ================= */

    const newExpiry = new Date();
    newExpiry.setMonth(newExpiry.getMonth() + 6);
    user.cardExpiry = newExpiry;

    await user.save();

    /* ================= ACTIVITY LOG ================= */

    await Activity.create({
      userId: user._id,
      userName: user.name,
      actionType: "purchase",
      previousCount: oldCount,
      newCount: user.purchaseCount,
      item: purchaseItem || null,
      performedBy: req.worker.name,
      role: req.worker.role
    });

    /* ================= EMAIL TO CUSTOMER ================= */

    const cardPayload = {
      user: user.toObject(),
      productImages: [
        "http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051281/ojxypn5khy4tsctqtix6.jpg",
        "http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051280/a43xq1yhskh7xtxlrchq.jpg",
        "http://res.cloudinary.com/dvh3ndrgx/image/upload/v1760051278/fvtfrfosbcnqlyjse2vr.webp"
      ]
    };

    const cardHtml = updatedMembershipCardTemplate(cardPayload);

    await sendEmail(
      user.email,
      `Your ${user.membershipTier} Membership Card Updated!`,
      cardHtml
    );

    /* ================= EMAIL TO OWNER ================= */

    const ownerHtml = ownerNotificationTemplate({
      action: "Purchase Added",
      customer: user.toObject(),
      oldTier,
      oldPurchaseCount: oldCount,
      oldReferralCount,
      item: purchaseItem,
      time: new Date().toLocaleString()
    });

    await sendEmail(
      process.env.OWNER_EMAIL,
      `Purchase Update: ${user.name}`,
      ownerHtml
    );

    /* ================= RESPONSE ================= */

    res.json({
      msg: "Purchase updated successfully",
    });

  } catch (err) {
    console.error("Purchase update error:", err);
    res.status(500).json({ msg: "Error updating purchase", err });
  }
});


router.put("/referral", async (req, res) => {
  try {
    const {  phone } = req.body;
    if (!id && !phone) {
      return res.status(400).json({ msg: "ID or phone is required" });
    }

    // Validate dob
    if (!dob) {
      return res.status(400).json({ msg: "dob is required" });
    }

    // Find user by ID, email, or phone
    const user = await User.findOne({
      $or: [{ _id: id }, { phone }],
    });

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.dob.toISOString().split("T")[0] !== dob) {
      return res.status(400).json({ msg: "DOB does not match" });
    }

    // Update referral count
    const oldTier = user.membershipTier;
    const oldCount = user.purchaseCount;
    const oldreferralCount = user.referralCount;
    user.referralCount += 1;

    // 🆕 Optional: If referrals reach a milestone, upgrade tier
    if (user.referralCount >= 6) user.membershipTier = "Platinum";
    else if (user.referralCount >= 3) user.membershipTier = "Gold";


    await user.save();

    await Activity.create({
      userId: user._id,
      userName: user.name,
      actionType: "referral",
      previousCount: oldreferralCount,
      newCount: user.referralCount,
      performedBy: req.user.name,   // from protect middleware
      role: req.user.role
    });

    // 🕒 Timestamps are automatically updated (timestamps: true in schema)

    // Send email to the user — updated membership card
    const cardPayload = { user: user.toObject() };
    const cardHtml = membershipCardTemplate(cardPayload);     
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
    });
  } catch (err) {
    console.error("Referral update error:", err);
    res.status(500).json({ msg: "Error updating referral", err });
  }
});

router.get("/validate-referral/:phone", protect, async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ valid: false, msg: "Referral not found" });
    }
    res.json({ valid: true, user: { id: user._id, name: user.name} });
  } catch (err) {
    res.status(500).json({ valid: false, msg: "Server error" });
  }
});

export default router;
