"use client"

import { useState, useRef, useCallback } from 'react'

export interface Attachment {
  name: string
  type: string
  size: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachment?: Attachment
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export const INITIAL_MESSAGE: Message = {
  id: generateId(),
  role: 'assistant',
  content:
    "Hey — I'm Vera. I'll be your audience. Whenever you're ready, go ahead.",
}

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const messagesRef = useRef<Message[]>([INITIAL_MESSAGE])
  messagesRef.current = messages

  const addMessage = useCallback(
    (content: string, attachment?: Attachment): string => {
      const id = generateId()
      const message: Message = {
        id,
        role: 'user',
        content,
        ...(attachment ? { attachment } : {}),
      }
      const updated = [...messagesRef.current, message]
      messagesRef.current = updated
      setMessages(updated)
      return id
    },
    []
  )

  const resetMessages = useCallback(() => {
    setMessages([INITIAL_MESSAGE])
    messagesRef.current = [INITIAL_MESSAGE]
  }, [])

  return {
    messages,
    setMessages,
    messagesRef,
    addMessage,
    resetMessages,
    generateId,
  }
}
