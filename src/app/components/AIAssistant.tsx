import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hey there! I'm your Festival AI Guide. Ask me anything about artists, food, directions, or schedule recommendations!",
      timestamp: "2:15 PM",
    },
    {
      id: 2,
      sender: "user",
      text: "What's the best vegan food near the main stage?",
      timestamp: "2:16 PM",
    },
    {
      id: 3,
      sender: "ai",
      text: "Greens & Grains truck is right behind the sound booth at Main Stage! They have amazing vegan bowls and wraps. Currently showing a short queue of about 3 minutes. 🌱",
      timestamp: "2:16 PM",
    },
    {
      id: 4,
      sender: "user",
      text: "Who's performing after Electric Pulse?",
      timestamp: "2:18 PM",
    },
    {
      id: 5,
      sender: "ai",
      text: "After Electric Pulse (ends 9:30 PM), Thunder Kings takes the Main Stage at 9:45 PM with an alternative rock set! If you're into electronic, Cyber Dreams starts at Digital Arena at 9:45 PM too.",
      timestamp: "2:18 PM",
    },
  ]);

  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() === "") return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const aiResponse: Message = {
      id: messages.length + 2,
      sender: "ai",
      text: "I'd love to help with that! This is a demo response. In a live app, I'd provide real-time festival information.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage, aiResponse]);
    setInputValue("");
  };

  return (
    <div className="h-screen bg-deep-bg flex flex-col">
      <header
        className="px-4 py-4 sticky top-0 z-10 border-b"
        style={{
          background: "linear-gradient(to bottom, rgba(157,78,221,0.13), rgba(26,26,36,0) 100%), var(--slate-gray)",
          borderBottomColor: "rgba(157,78,221,0.3)",
          boxShadow: "0 4px 24px -4px rgba(157,78,221,0.15)",
        }}
      >
        <div className="flex items-center gap-3 max-w-screen-sm mx-auto">
          <div className="p-2 bg-neon-purple rounded-full">
            <Bot className="w-6 h-6 text-deep-bg" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl text-neon-purple font-bold tracking-wider" style={{ textShadow: "0 0 12px rgba(157,78,221,0.7), 0 0 30px rgba(157,78,221,0.3)" }}>
            AI FESTIVAL GUIDE
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28 max-w-screen-sm mx-auto w-full space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.sender === "user"
                  ? "bg-neon-blue"
                  : "bg-neon-purple"
              }`}
            >
              {message.sender === "user" ? (
                <User className="w-5 h-5 text-deep-bg" strokeWidth={2.5} />
              ) : (
                <Bot className="w-5 h-5 text-deep-bg" strokeWidth={2.5} />
              )}
            </div>

            <div
              className={`flex-1 max-w-[75%] ${
                message.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-neon-blue text-deep-bg rounded-tr-sm"
                    : "bg-slate-gray text-foreground border border-slate-gray-light rounded-tl-sm"
                }`}
              >
                <p className="leading-relaxed">{message.text}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-2 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-10 bg-deep-bg border-t border-slate-gray-light px-4 py-4">
        <div className="max-w-screen-sm mx-auto">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about artists, food, or directions..."
              className="flex-1 bg-slate-gray border border-slate-gray-light rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="bg-neon-blue p-3 rounded-xl transition-all active:scale-95 hover:shadow-lg hover:shadow-neon-blue/50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={inputValue.trim() === ""}
            >
              <Send className="w-6 h-6 text-deep-bg" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
