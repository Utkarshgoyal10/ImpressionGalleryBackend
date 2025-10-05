import cron from "node-cron";
import User from "./../models/user.js";   
import { sendEmail } from "../utils/sendEmail.js";
import { sendPushNotification } from "../firebaseAdmin.js"; // make sure this sends to FCM token

// Runs every day at 9:00 AM
cron.schedule("*/2 * * * *", async () => {
  const today = new Date();
  const day = today.getUTCDate();
  const month = today.getUTCMonth() + 1;

  const users = await User.find({
    $expr: {
      $and: [
        { $eq: [{ $dayOfMonth: "$dob" }, day] },
        { $eq: [{ $month: "$dob" }, month] }
      ]
    }
  });

  console.log("Birthday Users:", users);

  for (const user of users) {
    // 1️⃣ Send Email
    // if (user.email) {
    //   await sendEmail(
    //     user.email,
    //     "From Impression Gallery - Happy Birthday! 🎉",
    //     `Hi ${user.name},\n\nWishing you a wonderful birthday! 🎂`
    //   );
    // }

    // 2️⃣ Send Push Notification (if FCM token exists)
    if (user.fcmToken) {
      await sendPushNotification(
        user.fcmToken,
        "🎉 Happy Birthday!",
        `Hi ${user.name}, have a wonderful day!`
      );
    } else {
      console.log(`No FCM token for user: ${user.email}`);
    }
  }
});
