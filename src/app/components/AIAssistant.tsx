import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import Groq from "groq-sdk";
import { supabase } from "../../lib/supabase";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface Performance {
  id: number;
  artist: string;
  subgenre: string;
  genre: string;
  stage: string;
  stage_color: string;
  start_time: string;
  end_time: string;
  day: string;
  category: string;
  color: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hey there! I'm your Festival AI Guide. Ask me anything about artists, food, directions, or schedule recommendations!",
      timestamp: getCurrentTime(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState<Groq | null>(null);
  const [scheduleContext, setScheduleContext] = useState<string>("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Groq client
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ Groq API key missing. Add VITE_GROQ_API_KEY to .env");
      return;
    }
    console.log("✅ Groq API key loaded");
    setClient(new Groq({ apiKey, dangerouslyAllowBrowser: true }));
  }, []);

  // Fetch schedule from Supabase on mount
  useEffect(() => {
    const fetchSchedule = async () => {
      const { data, error } = await supabase
        .from("performances")
        .select("*")
        .order("day")
        .order("start_time");

      if (error) {
        console.error("❌ Failed to fetch schedule:", error.message);
        return;
      }

      const formatted = (data as Performance[])
        .map((p) => {
          const start = new Date(p.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const end = new Date(p.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return `- ${p.day} | ${p.stage} | ${start} - ${end} | ${p.artist} (${p.genre}/${p.subgenre}) [${p.category}]`;
        })
        .join("\n");

      setScheduleContext(formatted);
      console.log("✅ Schedule loaded from Supabase");
    };

    fetchSchedule();
  }, []);

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const callGroq = async (userMessage: string, history: Message[]) => {
    if (!client) throw new Error("Groq client not initialized");

    const historyMessages = history.map((msg) => ({
      role: (msg.sender === "user" ? "user" : "assistant") as "user" | "assistant",
      content: msg.text,
    }));

    const systemPrompt = `You are a helpful Festival AI Guide. Help users with questions about artists, schedules, stages, food stalls, and recommendations.

Here is the full festival schedule:
${scheduleContext || "Schedule not available yet."}

Use this schedule to answer questions accurately. When recommending artists, consider the user's taste if they mention it. Keep responses friendly and concise.`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: userMessage },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");
    return text;
  };

  const handleSend = async () => {
    if (inputValue.trim() === "" || isLoading || !client) return;

    const userMsg: Message = {
      id: messages.length + 1,
      sender: "user",
      text: inputValue,
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiText = await callGroq(inputValue, [...messages, userMsg]);
      const aiMsg: Message = {
        id: messages.length + 2,
        sender: "ai",
        text: aiText,
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Groq error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "ai",
          text: "Sorry, I'm having trouble right now. Please try again later.",
          timestamp: getCurrentTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-deep-bg flex flex-col">
      <header
        className="px-4 py-4 sticky top-0 z-10 border-b"
        style={{
          background:
            "linear-gradient(to bottom, rgba(157,78,221,0.13), rgba(26,26,36,0) 100%), var(--slate-gray)",
          borderBottomColor: "rgba(157,78,221,0.3)",
          boxShadow: "0 4px 24px -4px rgba(157,78,221,0.15)",
        }}
      >
        <div className="flex items-center gap-3 max-w-screen-sm mx-auto">
          <div className="p-2 bg-neon-purple rounded-full">
            <Bot className="w-6 h-6 text-deep-bg" strokeWidth={2.5} />
          </div>
          <h1
            className="text-xl text-neon-purple font-bold tracking-wider"
            style={{
              textShadow:
                "0 0 12px rgba(157,78,221,0.7), 0 0 30px rgba(157,78,221,0.3)",
            }}
          >
            AI FESTIVAL GUIDE
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28 max-w-screen-sm mx-auto w-full space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.sender === "user" ? "bg-neon-blue" : "bg-neon-purple"
              }`}
            >
              {message.sender === "user" ? (
                <User className="w-5 h-5 text-deep-bg" />
              ) : (
                <Bot className="w-5 h-5 text-deep-bg" />
              )}
            </div>
            <div
              className={`flex-1 max-w-[75%] ${message.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-neon-blue text-deep-bg rounded-tr-sm"
                    : "bg-slate-gray text-foreground border border-slate-gray-light rounded-tl-sm"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-2 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-purple flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-deep-bg animate-spin" />
            </div>
            <div className="bg-slate-gray rounded-2xl px-4 py-3 border border-slate-gray-light">
              <p className="text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-neon-blue p-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 text-deep-bg animate-spin" />
              ) : (
                <Send className="w-6 h-6 text-deep-bg" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}