"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket, Sparkles, User } from "lucide-react"
import { useAPI } from "@/APIContext"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  streaming?: boolean
}

export function ChatInterface() {
  const { chat } = useAPI()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [chatUuid, setChatUuid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const streamingTimers = useRef<Array<ReturnType<typeof setInterval>>>([])

  useEffect(() => {
    return () => {
      streamingTimers.current.forEach((timer) => clearInterval(timer))
      streamingTimers.current = []
    }
  }, [])

  const createMessageId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

  const scrollToBottom = () => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const ensureChat = useCallback(async () => {
    if (chatUuid) return chatUuid

    setIsInitializing(true)
    try {
      const response = await chat.create()
      const newUuid = response?.data?.chat_uuid
      if (!newUuid) {
        throw new Error("Chat service did not return an identifier.")
      }
      setChatUuid(newUuid)
      setError(null)
      return newUuid
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to start the chat session."
      setError(message)
      throw err
    } finally {
      setIsInitializing(false)
    }
  }, [chat, chatUuid])

  useEffect(() => {
    ensureChat().catch((err) => {
      console.error("Failed to initialise chat", err)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setError(null)
    setMessages((prev) => [...prev, { id: createMessageId("user"), role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const activeChatUuid = await ensureChat()
      const response = await chat.sendMessage(activeChatUuid, {
        message: userMessage,
        metodo: "local",
      })

      const assistantReply = response?.data?.answer
      if (typeof assistantReply !== "string" || assistantReply.trim().length === 0) {
        throw new Error("The chat service returned an empty response.")
      }

      const cleanedAnswer = assistantReply.replace(/\\n/g, "\n")
      streamAssistantMessage(cleanedAnswer)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch a response right now."
      setError(message)
      setMessages((prev) => [...prev, { id: createMessageId("assistant"), role: "assistant", content: message }])
    } finally {
      setIsLoading(false)
    }
  }

  const streamAssistantMessage = (text: string) => {
    const messageId = createMessageId("assistant")
    const characters = Array.from(text)
    const total = characters.length
    setMessages((prev) => [...prev, { id: messageId, role: "assistant", content: "", streaming: true }])

    let index = 0
    const step = Math.max(1, Math.floor(total / 120))

    const timer = setInterval(() => {
      index = Math.min(total, index + step)
      const nextContent = characters.slice(0, index).join("")
      setMessages((prev) => {
        const updated = prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: nextContent,
                streaming: index < total,
              }
            : message,
        )
        return updated
      })

      if (index >= total) {
        clearInterval(timer)
        streamingTimers.current = streamingTimers.current.filter((stored) => stored !== timer)
      }
    }, 18)

    streamingTimers.current.push(timer)
  }

  const suggestedQuestions = [
    "How does microgravity affect plant growth?",
    "What are the effects of space radiation on cells?",
    "Tell me about recent ISS biology experiments",
    "How do astronauts' bodies adapt to space?",
  ]

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        {messages.length === 0 ? (
          // Initial state - similar to Dora AI
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-4">
              <h1 className="font-mono text-5xl md:text-6xl font-bold text-balance">
                <span className="text-foreground">Stellar Mind AI</span>{" "}
                <span className="text-muted-foreground">Chatbot</span>
              </h1>
              <p className="font-mono text-xl md:text-2xl text-muted-foreground text-balance">
                One question away from discovery
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-3xl">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about space biology research..."
                  className="w-full px-6 py-5 pr-32 font-mono text-lg bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || isInitializing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 font-mono gap-2"
                >
                  Generate
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {error ? (
              <p className="text-sm font-mono text-red-300">{error}</p>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl mt-8">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-4 py-3 text-left font-mono text-sm bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl hover:bg-card/50 hover:border-primary/50 transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat messages view
          <div className="flex flex-col space-y-6">
            <div
              ref={messagesContainerRef}
              className="mb-28 flex-1 space-y-6 overflow-y-auto pb-28 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[72vh]"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" ? (
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/40 bg-purple-500/20 text-purple-100"
                      aria-hidden
                    >
                      <Rocket className="h-4 w-4" />
                    </span>
                  ) : null}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 font-mono text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-sky-500/20 text-sky-100"
                        : "border border-border/50 bg-card/60 text-slate-100 backdrop-blur"
                    }`}
                  >
                    <div className="whitespace-pre-line text-left">
                      {message.content}
                      {message.streaming ? <span className="ml-1 inline-block animate-pulse">▮</span> : null}
                    </div>
                  </div>

                  {message.role === "user" ? (
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/40 bg-sky-500/30 text-sky-100"
                      aria-hidden
                    >
                      <User className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-center gap-3 rounded-2xl border border-border/50 bg-card/60 px-4 py-3 font-mono backdrop-blur">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/40 bg-purple-500/20 text-purple-100" aria-hidden>
                      <Rocket className="h-4 w-4 animate-pulse" />
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed input at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/80 p-4 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
                <div className="relative group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="w-full px-6 py-4 pr-32 font-mono text-lg bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading || isInitializing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 font-mono gap-2"
                  >
                    Send
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
              {error ? (
                <p className="mt-3 text-center text-sm font-mono text-red-300">{error}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
