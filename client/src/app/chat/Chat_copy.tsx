import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Settings, Menu } from "lucide-react"
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import IconSendFill from "./IconSendFill";

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
  const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState<Message[]>([]);
    const [currentAIMessage, setCurrentAIMessage] = useState<Message | null>(null);

  
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
        setCurrentAIMessage(null); // Reset current AI message
        await socket.emit("generate_text", currentMessage);
        setCurrentMessage("");
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
          // Append to the current AI message
          setCurrentAIMessage((prev) => ({
            ...prev!,
            message: prev!.message + chunk,
          }));
        } else {
          // Create a new AI message
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


  return (
    <div className="dark h-screen">
      <div className="grid lg:grid-cols-[280px_1fr] h-full">
        {/* Sidebar */}
        <div className="border-r bg-zinc-950 lg:block">
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
              <Button size="icon" variant="ghost">
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
        <div className="flex flex-col bg-zinc-900">
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

          <ScrollArea className="flex-1 p-4">
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
              <div
                key={index}
                className={`flex flex-col p-2.5 mb-2 rounded-md w-[70%] sm:w-80 ${
                  message.author === username
                    ? "bg-purple-800 self-end text-white"
                    : "bg-black self-start text-white"
                }`}
              >
                <p className="font-bold">{message.author}</p>
                <p>{message.message}</p>
                <p className="text-sm font-light text-end">{message.time}</p>
              </div>
            );
          })}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-zinc-800">
          <div className="flex flex-row justify-between items-center bg-slate-900 p-2 overflow-hidden rounded-md space-x-2">
        <input
          type="text"
          placeholder="Type here"
          onChange={(e) => setCurrentMessage(e.target.value)}
          value={currentMessage}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="outline-none bg-transparent flex-1"
        />
        <IconSendFill
          onClick={sendMessage}
          className="cursor-pointer w-5 h-5 hover:text-white/70"
        />
      </div>
          </div>
        </div>
      </div>
    </div>
  )
}

