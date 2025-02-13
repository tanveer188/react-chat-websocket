import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Settings, Menu } from "lucide-react"
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { FileInput } from "@/components/FileInput"
import IconSendFill from "./IconSendFill";
import React,{useRef} from "react"
import axios from "axios";
import { METHODS } from "node:http"
import { m } from "framer-motion"
interface Props {
  socket: Socket;
  username: string;
  room: string;
}
interface Message {
  room: string;
  id: string | undefined;
  author: string;
  message: string;
  time: string;
}
export default function ChatTemplate({ socket, username, room }: Props) {

  const [messageList, setMessageList] = useState<Message[]>([]);
  const [currentAIMessage, setCurrentAIMessage] = useState<Message | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    if (textRef.current) {
      textRef.current.style.height = "auto"; // Reset height for recalculation
      textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 200)}px`; // Limit height to 200px
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      const message: Message = {
        room,
        id: socket.id,
        author: username,
        message: currentMessage,
        time: timeString,
      };
      setMessageList((prev) => [...prev, message]);
      setCurrentAIMessage(null);
      setCurrentMessage("");
      chatapi();
    }
  }; 
  const formData = new FormData();

  // Append files correctly
  if (selectedFiles && selectedFiles.length > 0) {
    selectedFiles.forEach((file) => {
      formData.append("filelist", file); // Appends each file separately
    });
  }
  
  // Convert messageList to JSON string before appending
  const MessageList = messageList.map((m) => ({
    user: m.author,
    message: m.message
  }));
  
  formData.append("messageList", JSON.stringify(MessageList));
  formData.append("currentmessage", currentMessage);
  
  const chatapi = async () => {
    try {
      const response = await axios.post("http://localhost:3001/chat/messageslist", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Required for FormData
        },
      });
  
      if (!response || response.status !== 200) {
        throw new Error("Failed to send data");
      }
  
      console.log("Data sent successfully", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  useEffect(() => {
    socket.on("receive_message", (data: Message) => {
      setMessageList((prev) => [...prev, data]);
    });

    socket.on("text_chunk", (chunk: string) => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      if (currentAIMessage) {
        setCurrentAIMessage((prev) => ({
          ...prev!,
          message: prev!.message + chunk,
        }));
      } else {
        const message: Message = {
          room,
          id: socket.id,
          author: "AI",
          message: chunk,
          time: timeString,
        };
        setCurrentAIMessage(message);
        setMessageList((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("text_chunk");
    };
  }, [socket, currentAIMessage]);

  useEffect(() => {
    if (currentAIMessage) {
      // Update the message list with the current AI message
      setMessageList((prev) => {
        const updatedList = [...prev];
        updatedList[updatedList.length - 1] = currentAIMessage;
        return updatedList;
      });
    }
  }, [currentAIMessage]);

  const deleteFile = async (file: File) => {
    try {
      const response = await axios.delete(`http://localhost:3001/file/deleteUploads/${file.name}`,{
      });
      console.error(response);
    } catch (error) {
      console.error(`Error ${file.name}:`, error);
    }
  };
  return (
    <div className="dark ">
      <div className="h-screen grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="h-screen overflow-y-scroll border-r no-scrollbar bg-zinc-950 lg:block">
          <div className="flex h-[60px] items-center px-6 gap-4 border-b">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-semibold text-lg text-zinc-50">Messages</h1>
          </div>
          <div className="p-4 gap-2">
            <form className="flex items-center gap-2">
              <Input
                placeholder="Search messages..."
                className="bg-zinc-900 border-zinc-800 placeholder:text-zinc-400"
              />
              <Button className="text-slate-50" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="px-4 py-2">
              <h2 className="text-xs font-semibold text-zinc-400 pb-2">Recent Chats</h2>
              <div className="space-y-2">
                <button className="w-full hover:bg-zinc-900 p-2 rounded-lg transition-colors text-left flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-zinc-50">Sarah Chen</div>
                    <div className="text-xs text-zinc-400 truncate">Let's meet tomorrow at 10</div>
                  </div>
                  <div className="text-xs text-zinc-400">2m</div>
                </button>
                <button className="w-full hover:bg-zinc-900 p-2 rounded-lg transition-colors text-left flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-zinc-50">John Doe</div>
                    <div className="text-xs text-zinc-400 truncate">Project update: Phase 1 complete</div>
                  </div>
                  <div className="text-xs text-zinc-400">1h</div>
                </button>
                <button className="w-full hover:bg-zinc-900 p-2 rounded-lg transition-colors text-left flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>EW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-zinc-50">Emma Wilson</div>
                    <div className="text-xs text-zinc-400 truncate">Thanks for your help!</div>
                  </div>
                  <div className="text-xs text-zinc-400">2h</div>
                </button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="h-screen overflow-y-scroll no-scrollbar flex flex-col bg-zinc-900">
          <div className="flex h-[60px] items-center px-6 gap-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-zinc-50">Sarah Chen</div>
                <div className="text-xs text-zinc-400">Active now</div>
              </div>
            </div>
            <div className="ml-auto">
              <Button size="icon" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className=" flex-1 p-4">
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-zinc-800 px-4 py-2 max-w-[75%]">
                  <p className="text-sm text-zinc-50">Hi! How are you doing?</p>
                  <span className="text-xs text-zinc-400 mt-1 block">2:30 PM</span>
                </div>
              </div>
              <div className="flex items-end gap-2 flex-row-reverse">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-blue-600 px-4 py-2 max-w-[75%]">
                  <p className="text-sm text-zinc-50">
                    Hey! I'm doing great, thanks for asking. Just finished up with the project presentation.
                  </p>
                  <span className="text-xs text-zinc-200 mt-1 block">2:31 PM</span>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-zinc-800 px-4 py-2 max-w-[75%]">
                  <p className="text-sm text-zinc-50">That's awesome! How did it go?</p>
                  <span className="text-xs text-zinc-400 mt-1 block">2:32 PM</span>
                </div>
              </div>
              <div className="flex items-end gap-2 flex-row-reverse">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-blue-600 px-4 py-2 max-w-[75%]">
                  <p className="text-sm text-zinc-50">
                    It went really well! The client loved our new design direction.
                  </p>
                  <span className="text-xs text-zinc-200 mt-1 block">2:33 PM</span>
                </div>
              </div>
              {messageList.map((message, index) => {
                return (
                  <div key={index} className={`flex items-end gap-2  ${message.author === username
                    ? " items-end text-zinc-50 flex-row-reverse"
                    : "text-zinc-50"
                    }`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>{message.author}</AvatarFallback>
                    </Avatar>
                    <div className={`text-wrap break-words h-auto rounded-lg px-4 py-2 max-w-[75%] ${message.author === username
                      ? "bg-blue-600 "
                      : "bg-zinc-800 "}`}>
                      <p className=" text-sm text-zinc-50">
                        {message.message}</p>
                      <span className="text-xs text-zinc-200 mt-1 block">{message.time}</span>
                    </div>
                  </div>

                );
              })}
            </div>
          </ScrollArea>
          <div className="h-auto p-4 border-t bg-zinc-950">
          {selectedFiles && selectedFiles.length > 0 && (
  <div className="flex mr-1 mb-2 flex-wrap">
  {selectedFiles.length > 0 &&
  selectedFiles.map((file, index) => (
    <div
      className="flex items-center text-slate-50 border rounded-lg p-2 space-x-2"
      key={index}
    >
      <Button
        size="sm"
        onClick={() =>{
          setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index)),deleteFile(file)
        }
        }
      >
        x
      </Button>
      <p>{file.name}</p>
    </div>
  ))}

  </div>
)}

<div className="h-auto flex gap-2 items-center">
  <FileInput selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
  <textarea
    ref={textRef}
    value={currentMessage}
    onChange={handleInputChange}
    className="w-full bg-zinc-900 border rounded-lg p-2 resize-none no-scrollbar text-white"
    rows={1}
    placeholder="Type a message..."
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }}
  />
  <IconSendFill
    onClick={sendMessage}
    className="cursor-pointer w-5 h-5 text-slate-50 hover:text-blue-400"
  />
</div>

          </div>
        </div>
      </div>
    </div>
  )
}
