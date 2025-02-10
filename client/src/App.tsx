import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import Chat from "./components/Chat_copy";
import Login from "./app/login/page";
import Home from "./app/page";

const PORT = import.meta.env.PORT || '3001';
const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || `http://localhost:${PORT}`;
const socket = io(VITE_SERVER_URL);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login username={username} setUsername={setUsername} room={room} setRoom={setRoom} />} />
      <Route path="/chat" element={<Chat socket={socket} username={username} room={room} />} />
    </Routes>
  );
}

export default App;
