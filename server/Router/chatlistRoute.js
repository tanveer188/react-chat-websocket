import express from "express";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Stores files in memory (change if needed)
const upload = multer({ storage });

router.post("/messageslist", upload.array("filelist"), async (req, res) => {
  try {
    // Extract files
    const files = req.files; // Array of uploaded files

    // Extract JSON data
    const { currentmessage } = req.body;
    const messageList = JSON.parse(req.body.messageList); // Convert back to object

    console.log("Current Message:", currentmessage);
    console.log("Message List:", messageList);
    console.log("Uploaded Files:", files.map((file) => file.originalname));

    res.status(200).json({ message: "Data received successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
