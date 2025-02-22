import express from "express";
import http from "http";
import { json, urlencoded } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { generateTextStream } from "./chat_advance.js";
import Db from "./Db/Database.js";
import userRoute from "./Router/userRoute.js";
import uploardRoute from "./Router/uploardRoute.js";
import chatlistRoute from "./Router/chatlistRoute.js";

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Pass io to the chatlistRoute
app.use("/user", userRoute);
app.use("/file", uploardRoute);
app.use("/chat", chatlistRoute(io));

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