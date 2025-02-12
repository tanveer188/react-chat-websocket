import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import Chat from "./app/chat/Chat_copy";
import Login from "./app/login/page";
import Home from "./app/page";
import SignupPages from "./app/login/signupPages";

const PORT = import.meta.env.PORT || '3001';
const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || `http://localhost:${PORT}`;
const socket = io(VITE_SERVER_URL);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");


  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login username={username} setUsername={setUsername} room={room} setRoom={setRoom} />} />
      <Route path="/signup" element={<SignupPages />} />
      <Route path="/chat" element={<Chat socket={socket} username={username} room={room} />} />
    </Routes>
  );
}

export default App;
