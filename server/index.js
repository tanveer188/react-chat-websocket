import express from "express";
import http from "http";// Ensure chat.js is in the same directory

import  { json, urlencoded } from "express";
const app=express()
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { generateTextStream } from "./chat_advance.js"; // Ensure chat.js is in the same directory
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
import Db from "./Db/Database.js";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
const server = http.createServer(app);

// Add these middleware before your routes
app.use(json());
app.use(urlencoded({ extended: true }));
import userRoute from "./Router/userRoute.js";
import uploardRoute from "./Router/uploardRoute.js";
import chatlistRoute from "./Router/chatlistRoute.js"
app.use("/user",userRoute);
app.use("/file",uploardRoute);
app.use("/chat",chatlistRoute);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

                               
//+___________________________/      \__________________________+\\
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("generate_text", async (prompt) => {
    console.log(prompt)
    try {
      const file_names = []
      const messageList = [{
          user: "what is ai",
          message: "ai stand for artificial intelligence"
      }]
      for await (const output of generateTextStream(file_names,messageList,prompt)) {
        process.stdout.write(output);
        socket.emit("text_chunk", output);
      }
    } catch (error) {
      console.error("Error generating text:", error);
    }
  });


  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});