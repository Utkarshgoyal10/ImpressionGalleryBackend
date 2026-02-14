// server.js
import express from "express";
import dotenv from "dotenv";

import { upload } from "./middleware/multer.middleware.js"; // your multer setup
import { uploadOnCloudinary } from "./utils/cloudinary.js"; // your cloudinary helper

dotenv.config();

const app = express();
app.use(express.json());

// ------------------ Upload Endpoint ------------------
// "images" is the key in form-data
app.post("/upload-images", upload.array("images", 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Upload each file to Cloudinary and get URL
    const urls = [];
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path); // assumes your helper returns { url }
      urls.push(result.url);
    }

    res.status(200).json({
      message: "Images uploaded successfully",
      urls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
