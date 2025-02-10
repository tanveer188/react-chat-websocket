export interface Message {
    id: string
    content: string
    timestamp: string
    senderId: string
  }
  
  export interface Contact {
    id: string
    name: string
    avatar: string
    lastMessage: string
    lastMessageTime: string
    isOnline?: boolean
  }
  
  