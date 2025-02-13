import express from "express";
import multer from "multer";
import { generateTextStream } from "../chat_advance.js"; // Ensure the correct path to the file

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Stores files in memory (change if needed)
const upload = multer({ storage });

const chatlistRoute = (io) => {
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

      // Call generateTextStream and handle its output
      const file_names = files.map((file) => file.originalname);
      const prompt = currentmessage;

      for await (const output of generateTextStream(file_names, messageList, prompt)) {
        process.stdout.write(output);
        // Emit the output using Socket.IO
        io.emit("text_chunk", output);
      }

      res.status(200).json({ message: "Data received successfully" });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};

export default chatlistRoute;
