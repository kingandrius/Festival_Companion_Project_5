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

interface FoodTruck {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  location: string;
  wait_time: string | null;
  rating: number;
  price_range: string;
  tags: string[];
  emoji: string;
  popular: string;
  open: boolean;
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
  const [foodTruckContext, setFoodTruckContext] = useState<string>("");

  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      const { data, error } = await supabase
        .from("schedule")
        .select("*");
      if (error) {
        console.error("❌ Failed to fetch schedule:", error.message);
        return;
      }
      const formatted = data
        .map(
          (s) =>
            `- ${s.artist} (${s.genre}) at ${s.stage} - ${s.start_time} to ${s.end_time}`
        )
        .join("\n");
      setScheduleContext(formatted);
      console.log("✅ Schedule loaded from Supabase");
    };
    fetchSchedule();
  }, []);

  // Fetch food truck data
  useEffect(() => {
    const fetchFoodTrucks = async () => {
      const { data, error } = await supabase
        .from("food_trucks")
        .select("*");
      if (error) {
        console.error("❌ Failed to fetch food trucks:", error.message);
        return;
      }
      const formatted = data
        .map(
          (f) =>
            `- ${f.name} (${f.cuisine}) at ${f.location} - Price: ${f.price_range}, Rating: ${f.rating}/5, Emoji: ${f.emoji}`
        )
        .join("\n");
      setFoodTruckContext(formatted);
      console.log("✅ Food trucks loaded from Supabase");
    };
    fetchFoodTrucks();
  }, []);

  const systemPrompt = `You are a helpful Festival AI Guide. Help users with questions about artists, schedules, stages, food stalls, and recommendations.  
  Here is the full festival schedule:
  ${scheduleContext || "Schedule not available yet."}
  Here are the food truck details:
  ${foodTruckContext || "Food truck data not available yet."}`;

  const sendMessage = async () => {
    if (inputValue.trim() === "") return;
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

  const callGroq = async (input: string, history: Message[]): Promise<string> => {
    // Replace with actual Groq integration
    return "This is a placeholder response from the AI.";
  };

  const getCurrentTime = (): string => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <Bot size={24} color="white" />
          </div>
          <h1 className="text-xl font-bold text-white">Festival AI Guide</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.text}
                <div className="text-xs text-right mt-1 opacity-70">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-gray-700 text-white">
                <Loader2 className="animate-spin" size={20} />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t">
        <div className="max-w-screen-sm mx-auto flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me anything..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}