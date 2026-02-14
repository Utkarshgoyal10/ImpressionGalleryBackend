import cron from "node-cron";
import User from "./../models/user.js"; 
import { sendEmail } from "../utils/sendEmail.js";
import { sendPushNotification } from "../firebaseAdmin.js"; // make sure this sends to FCM token
import { BirthdayTemplate } from "../templates/BirthdayTemplate.js";
import { AnniversaryTemplate } from "../templates/AnniversaryTemplate.js";
// Runs every day at 9:00 AM

// cron.schedule("*/1 * * * *", async () => {
//     const today = new Date();
//     const day = today.getDate();
//     const month = today.getMonth() + 1;
  
//     try {
//         // Find users whose birthday is today
//         const users = await User.find({
//         $expr: {
//             $and: [
//             { $eq: [{ $dayOfMonth: "$dob" }, day] },
//             { $eq: [{ $month: "$dob" }, month] }
//             ]
//         }
//     });
    
//     for (const user of users) {
//         if (user.email) {
//         const htmlContent = BirthdayTemplate({
//             user,
//             discountCode: "BIRTHDAY200",
//             validityDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toLocaleDateString()
//         });
//     //   1️⃣ Optional: Send Email
//         // await sendEmail(
//         //   user.email,
//         //   "Happy Birthday from Impression Gallery!",
//         //   htmlContent
//         // );
//       }

//       // 2️⃣ Send Push Notification (if FCM token exists)
//       if (user.fcmToken) {
//         await sendPushNotification(
//           user.fcmToken,
//           `🎉 Happy Birthday, ${user.name}!`,
//           "Click to see your special birthday offer 🎁",
//           {
//             route: `/birthday-offer?userId=${user._id}`, // dynamic route for frontend
//           }
//         );
//       } else {
//       }
//     }
//   } catch (err) {
//     console.error("Error running birthday cron job:", err);
//   }
// });

// cron.schedule("*/1 * * * *", async () => {
//     const today = new Date();
//     const day = today.getDate();
//     const month = today.getMonth() + 1;
  
//     try {
//         // Find users whose birthday is today
//         const users = await User.find({
//         $expr: {
//             $and: [
//             { $eq: [{ $dayOfMonth: "$anniversary" }, day] },
//             { $eq: [{ $month: "$anniversary" }, month] }
//             ]
//         }
//     });
    
//     for (const user of users) {
//         if (user.email) {
//         const htmlContent = AnniversaryTemplate({
//             user,
//             discountCode: "SPECIAL200",
//             validityDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toLocaleDateString()
//         });
//     //   1️⃣ Optional: Send Email
//         // await sendEmail(
//         //   user.email,
//         //   "Happy Marriage Anniversary from Impression Gallery!",
//         //   htmlContent
//         // );
//       }

//       // 2️⃣ Send Push Notification (if FCM token exists)
//       if (user.fcmToken) {
//         await sendPushNotification(
//           user.fcmToken,
//           `🎉 Happy Birthday, ${user.name}!`,
//           "Click to see your special birthday offer 🎁",
//           {
//             route: `/birthday-offer?userId=${user._id}`, // dynamic route for frontend
//           }
//         );
//       } else {
//       }
//     }
//   } catch (err) {
//     console.error("Error running birthday cron job:", err);
//   }
// });