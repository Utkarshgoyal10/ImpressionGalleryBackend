import cron from "node-cron";
import User from "./../models/user.js";   
import { sendEmail } from "../utils/sendEmail.js";
import { sendPushNotification } from "../firebaseAdmin.js"; // make sure this sends to FCM token

// Runs every day at 9:00 AM
cron.schedule("*/2 * * * *", async () => {
    const today = new Date();
    const day = today.getUTCDate();
    const month = today.getUTCMonth() + 1;

    try {
        // Find users whose birthday is today
        const users = await User.find({
        $expr: {
            $and: [
            { $eq: [{ $dayOfMonth: "$dob" }, day] },
            { $eq: [{ $month: "$dob" }, month] }
            ]
        }
    });

    for (const user of users) {
      // 1️⃣ Optional: Send Email
    //   if (user.email) {
    //     await sendEmail(
    //       user.email,
    //       "🎉 Happy Birthday from Impression Gallery!",
    //       `Hi ${user.name},\n\nClick here to claim your birthday offer: https://yourdomain.com/birthday-offer?userId=${user._id}`
    //     );
    //   }

      // 2️⃣ Send Push Notification (if FCM token exists)
      if (user.fcmToken) {
        await sendPushNotification(
          user.fcmToken,
          `🎉 Happy Birthday, ${user.name}!`,
          "Click to see your special birthday offer 🎁",
          {
            route: `/birthday-offer?userId=${user._id}`, // dynamic route for frontend
          }
        );
      } else {
      }
    }
  } catch (err) {
    console.error("Error running birthday cron job:", err);
  }
});