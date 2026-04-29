import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const BookingChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I’m BookingAgent Pro. I can help you choose a service and book an appointment.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/.netlify/functions/chat-handler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      const result = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            result.reply ||
            "Thanks! I received your message. The booking assistant will respond shortly.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, I could not reach the booking assistant. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="chat"
      className="fixed bottom-24 right-6 z-30 flex h-[32rem] w-[min(24rem,calc(100vw-3rem))] flex-col rounded-2xl border bg-card shadow-soft"
    >
      <div className="flex items-center gap-3 border-b p-4">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent" />
        </span>

        <div>
          <p className="font-display font-bold">AI Assistant</p>
          <p className="text-xs text-muted-foreground">
            BookingAgent Pro
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <Bot className="mt-2 h-4 w-4 text-primary" />
            )}

            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.content}
            </div>

            {message.role === "user" && (
              <User className="mt-2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}

        {loading && (
          <div className="text-sm text-muted-foreground">
            Assistant is thinking…
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t p-3">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Ask about services or booking..."
        />

        <Button onClick={sendMessage} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};