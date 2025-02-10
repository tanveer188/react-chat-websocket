"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Settings, Send, Menu } from "lucide-react"
import { useWebSocket } from "@/lib/hooks/use-websocket"
import type { Contact, Message } from "@/types/chat"
import { formatTimestamp } from "@/utils/format-time"

// Initial data
const initialContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Let's meet tomorrow at 10",
    lastMessageTime: "2m",
    isOnline: true,
  },
  {
    id: "2",
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Project update: Phase 1 complete",
    lastMessageTime: "1h",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2h",
    isOnline: true,
  },
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Let's meet tomorrow at 10",
    lastMessageTime: "2m",
    isOnline: true,
  },
  {
    id: "2",
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Project update: Phase 1 complete",
    lastMessageTime: "1h",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2h",
    isOnline: true,
  },
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Let's meet tomorrow at 10",
    lastMessageTime: "2m",
    isOnline: true,
  },
  {
    id: "2",
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Project update: Phase 1 complete",
    lastMessageTime: "1h",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2h",
    isOnline: true,
  },
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Let's meet tomorrow at 10",
    lastMessageTime: "2m",
    isOnline: true,
  },
  {
    id: "2",
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Project update: Phase 1 complete",
    lastMessageTime: "1h",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2h",
    isOnline: true,
  },
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Let's meet tomorrow at 10",
    lastMessageTime: "2m",
    isOnline: true,
  },
  {
    id: "2",
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Project update: Phase 1 complete",
    lastMessageTime: "1h",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2h",
    isOnline: true,
  },
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Let's meet tomorrow at 10",
    lastMessageTime: "2m",
    isOnline: true,
  },
  {
    id: "2",
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Project update: Phase 1 complete",
    lastMessageTime: "1h",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2h",
    isOnline: true,
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hi! How are you doing?",
    timestamp: "2:30 PM",
    senderId: "1",
  },
  {
    id: "2",
    content: "Hey! I'm doing great, thanks for asking. Just finished up with the project presentation.",
    timestamp: "2:31 PM",
    senderId: "me",
  },
  {
    id: "3",
    content: "That's awesome! How did it go?",
    timestamp: "2:32 PM",
    senderId: "1",
  },
  {
    id: "4",
    content: "It went really well! The client loved our new design direction.",
    timestamp: "2:33 PM",
    senderId: "me",
  },
  
]
import { Socket } from "socket.io-client";
interface Props {
  socket: Socket;
  username: string;
  room: string;
}

export default function ChatTemplate( {socket, username, room}: Props) {
  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [currentContact, setCurrentContact] = useState<Contact>(contacts[0])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Add WebSocket connection
  const sendMessage = async () => {
    if (messageInput !== "") {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      const message: Message = {
        room,
        id: socket.id,
        senderId: username,
        content: messageInput,
        timestamp: timeString,
      };
      setMessages((prev) => [...prev, message]);
      // setCurrentAIMessage(null); // Reset current AI message
      await socket.emit("generate_text", messageInput);
      setMessageInput("");
    }
  };
  // Handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    // Send message through WebSocket
    sendMessage(messageInput)

    // Add user's message to the chat
    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      timestamp: formatTimestamp(new Date()),
      senderId: "me",
    }

    setMessages((prev) => [...prev, newMessage])
    setMessageInput("")

    // Update last message in contacts
    const updatedContacts = contacts.map((contact) =>
      contact.id === currentContact.id ? { ...contact, lastMessage: messageInput, lastMessageTime: "now" } : contact,
    )
    setContacts(updatedContacts)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const filtered = initialContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setContacts(filtered)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Add message received handler
  useEffect(() => {
    if (!socket) return

    socket.onmessage = (event) => {
      try {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: event.data,
          timestamp: formatTimestamp(new Date()),
          senderId: currentContact.id,
        }

        setMessages((prev) => [...prev, newMessage])
      } catch (err) {
        console.error("Error handling message:", err)
      }
    }
  }, [socket, currentContact.id])

  // Add connection status indicator


  return (
    <div className="dark relative">
      <div className="grid lg:grid-cols-[280px_1fr]  h-screen">
        {/* Sidebar */}
        <div className={`border-r bg-zinc-950 h-screen  ${isSidebarOpen ? "block" : "hidden"} lg:block`}>
          <div className="flex h-[60px] items-center px-6 gap-4 border-b">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-semibold text-lg text-zinc-50">Messages</h1>
          </div>
          <div className="p-4 gap-2">
            <form className="flex items-center gap-2" onSubmit={handleSearch}>
              <Input
                placeholder="Search messages..."
                className="bg-zinc-900 border-zinc-800 placeholder:text-zinc-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="icon" variant="ghost" type="submit">
                <Search className="h-4 w-4 text-white" />
              </Button>
            </form>
          </div>
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="px-4 py-2">
              <h2 className="text-xs font-semibold text-zinc-400 pb-2">Recent Chats</h2>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setCurrentContact(contact)
                      setIsSidebarOpen(false)
                    }}
                    className={`w-full hover:bg-zinc-900 p-2 rounded-lg transition-colors text-left flex items-center gap-2
                      ${currentContact.id === contact.id ? "bg-zinc-900" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-zinc-50">{contact.name}</div>
                      <div className="text-xs text-zinc-400 truncate">{contact.lastMessage}</div>
                    </div>
                    <div className="text-xs text-zinc-400">{contact.lastMessageTime}</div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col overflow-hidden bg-zinc-900">
          <div className="flex h-[60px] items-center px-6 gap-4 border-b border-zinc-800">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={currentContact.avatar} />
                <AvatarFallback>
                  {currentContact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-zinc-50">{currentContact.name}</div>
                <div className="text-xs text-zinc-400">{currentContact.isOnline ? "Active now" : "Offline"}</div>
              </div>
            </div>
            <div className="ml-auto">
              <Button size="icon" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1  p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${message.senderId === "me" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={message.senderId === "me" ? "/placeholder.svg?height=32&width=32" : currentContact.avatar}
                    />
                    <AvatarFallback>
                      {message.senderId === "me"
                        ? "ME"
                        : currentContact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[75%] ${
                      message.senderId === "me" ? "bg-blue-600" : "bg-zinc-800"
                    }`}
                  >
                    <p className="text-sm text-zinc-50">{message.content}</p>
                    <span
                      className={`text-xs mt-1 block ${message.senderId === "me" ? "text-zinc-200" : "text-zinc-400"}`}
                    >
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-zinc-800">
            <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
              <Input
                placeholder="Type a message..."
                className="bg-zinc-800 border-zinc-700 placeholder:text-zinc-400 text-white"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <Button size="icon" type="submit">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

