import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port:465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Mobile Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("Email Error:", err);
  }
};
