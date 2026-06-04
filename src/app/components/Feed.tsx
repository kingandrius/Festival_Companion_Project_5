import { useState, useEffect } from "react";
import { Music, MapPin, Clock, Cloud, Sun, CloudRain, CloudSun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "motion/react";

// Fallback weather data
const defaultWeatherData = {
  city: "Eindhoven",
  country: "NL",
  condition: "Partly Cloudy",
  conditionCode: "partly-cloudy",
  tempC: 19,
};

async function fetchWeather(city: string = "Eindhoven") {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY as string;
  if (!apiKey) {
    console.error("VITE_WEATHER_API_KEY is not set");
    return null;
  }
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const current = data.list[0];
    
    return {
      city: data.city.name,
      country: data.city.country,
      condition: current.weather[0].main,
      conditionCode: current.weather[0].main.toLowerCase().replace(" ", "-"),
      tempC: Math.round(current.main.temp),
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

function WeatherIcon({ code, className }: { code: string; className?: string }) {
  if (code === "rain") return <CloudRain className={className} />;
  if (code === "sunny") return <Sun className={className} />;
  if (code === "partly-cloudy") return <CloudSun className={className} />;
  return <Cloud className={className} />;
}

export function Feed() {
  const { theme, toggleTheme } = useTheme();
  const [weather, setWeather] = useState(defaultWeatherData);

  useEffect(() => {
    fetchWeather().then((data) => {
      if (data) setWeather(data);
    });
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // DATABASE SHAPE — replace with a query that returns performances currently
  // in progress (start_time <= now <= end_time).
  //
  // {
  //   id: number,
  //   artist: string,       // e.g. "Electric Pulse"
  //   genre: string,        // e.g. "Electronic"
  //   stage: string,        // e.g. "Main Stage"
  //   time: string,         // e.g. "8:00 PM - 9:30 PM"
  //   color: string,        // CSS token: "neon-blue" | "neon-pink" | "neon-green" | "neon-yellow"
  // }
  //
  // Example fetch:
  //   const happeningNow = await supabase
  //     .from("performances")
  //     .select("*")
  //     .lte("start_time", new Date().toISOString())
  //     .gte("end_time",   new Date().toISOString());
  // ───────────────────────────────────────────────────────────────────────────
  const happeningNow: {
    id: number;
    artist: string;
    genre: string;
    stage: string;
    time: string;
    color: string;
  }[] = [
    // TODO: populate from database
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // DATABASE SHAPE — replace with a query from your `announcements` table,
  // ordered by created_at descending.
  //
  // {
  //   id: number,
  //   type: string,         // "food" | "alert" | "info"
  //   title: string,        // short headline
  //   message: string,      // body text
  //   time: string,         // human-readable age, e.g. "5 mins ago"
  //   color: string,        // CSS token: "neon-green" | "neon-pink" | "neon-purple"
  // }
  //
  // Example fetch:
  //   const announcements = await supabase
  //     .from("announcements")
  //     .select("*")
  //     .order("created_at", { ascending: false })
  //     .limit(10);
  // ───────────────────────────────────────────────────────────────────────────
  const announcements: {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    color: string;
  }[] = [
    // TODO: populate from database
  ];

  const w = weather;

  return (
    <div className="min-h-screen bg-deep-bg">
      <header className="bg-slate-gray border-b border-slate-gray-light px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-screen-sm mx-auto">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-neon-blue" strokeWidth={2.5} />
            <h1 className="text-xl tracking-wider text-neon-blue font-bold">
              FESTIVAL<span className="text-neon-pink">BUDDY</span>
            </h1>
          </div>
          {/* Inline dark/light toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-gray-light rounded-xl transition-colors active:scale-95"
          >
            <Sun
              className="w-4 h-4 transition-colors duration-200"
              style={{ color: theme === "light" ? "var(--neon-yellow)" : "var(--muted-foreground)" }}
              strokeWidth={2}
            />
            <div
              className="relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
              style={{ backgroundColor: theme === "dark" ? "var(--neon-blue)" : "var(--slate-gray-light)" }}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: theme === "dark" ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
            <Moon
              className="w-4 h-4 transition-colors duration-200"
              style={{ color: theme === "dark" ? "var(--neon-blue)" : "var(--muted-foreground)" }}
              strokeWidth={2}
            />
          </button>
        </div>
      </header>

      <section className="px-4 pt-5 max-w-screen-sm mx-auto">
        {/* Weather bar */}
        <div className="bg-slate-gray border border-slate-gray-light rounded-2xl px-6 py-6 mb-5 flex items-center gap-5">
          <WeatherIcon code={w.conditionCode} className="w-16 h-16 text-neon-blue flex-shrink-0" />
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-foreground">{w.tempC}°C</span>
              <span className="text-xl text-neon-pink">{w.condition}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-neon-blue" />
              <span className="text-sm text-neon-blue font-medium">{w.city}, {w.country}</span>
            </div>
          </div>
        </div>

        <h2 className="text-lg mb-4 text-neon-blue font-bold tracking-wide">
          HAPPENING NOW
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {happeningNow.length === 0 && (
            <div className="w-full py-6 text-center">
              <p className="text-muted-foreground text-sm">No performances on right now</p>
            </div>
          )}
          {happeningNow.map((show) => (
            <div
              key={show.id}
              className="flex-shrink-0 w-72 bg-slate-gray rounded-xl p-4 border-2 snap-center"
              style={{ borderColor: `var(--${show.color})` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3
                    className="font-bold text-lg mb-1"
                    style={{ color: `var(--${show.color})` }}
                  >
                    {show.artist}
                  </h3>
                  <p className="text-sm text-muted-foreground">{show.genre}</p>
                </div>
                <Music className="w-6 h-6 opacity-50" style={{ color: `var(--${show.color})` }} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{show.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{show.stage}</span>
                </div>
              </div>

              <div className="mt-4 h-1.5 rounded-full bg-slate-gray-light overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "45%",
                    backgroundColor: `var(--${show.color})`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-6 max-w-screen-sm mx-auto">
        <h2 className="text-lg mb-4 text-neon-green font-bold tracking-wide">
          ANNOUNCEMENTS
        </h2>

        <div className="space-y-3">
          {announcements.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted-foreground text-sm">No announcements yet</p>
            </div>
          )}
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-slate-gray rounded-xl p-4 border-l-4"
              style={{ borderLeftColor: `var(--${announcement.color})` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground">{announcement.title}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {announcement.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {announcement.message}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
