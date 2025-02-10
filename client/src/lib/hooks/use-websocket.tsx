import { useEffect, useRef, useState, useCallback } from "react"

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url)

      socket.onopen = () => {
        console.log("Connected to WebSocket")
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }

      socket.onclose = () => {
        console.log("Disconnected from WebSocket")
        setIsConnected(false)

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`)
            connect()
          }, 1000 * Math.min(reconnectAttempts.current, 5)) // Exponential backoff up to 5 seconds
        }
      }

      socket.onerror = () => {
        setError("WebSocket connection failed. Retrying...")
      }

      ws.current = socket
    } catch (err) {
      setError("Failed to create WebSocket connection")
      console.error("WebSocket creation error:", err)
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  useEffect(() => {
    const cleanup = connect()
    return () => {
      cleanup()
      // Reset state on unmount
      setIsConnected(false)
      setError(null)
      reconnectAttempts.current = 0
    }
  }, [connect])

  const sendMessage = useCallback((message: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket is not connected")
      return
    }

    try {
      ws.current.send(message)
    } catch (err) {
      setError("Failed to send message")
      console.error("Send message error:", err)
    }
  }, [])

  return {
    sendMessage,
    isConnected,
    error,
    socket: ws.current,
  }
}

