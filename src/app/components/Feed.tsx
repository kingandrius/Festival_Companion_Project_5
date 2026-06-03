import { useState } from "react";
import { Music, MapPin, Clock, Cloud, Sun, CloudRain, CloudSun, Settings, Moon, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "motion/react";

// Mock weather data — replace fetchWeather() with a real API call (e.g. OpenWeatherMap)
// GET https://api.openweathermap.org/data/2.5/forecast?q=Eindhoven&appid=YOUR_KEY&units=metric
const weatherData = {
  city: "Eindhoven",
  country: "NL",
  condition: "Partly Cloudy",
  conditionCode: "partly-cloudy",
  tempC: 19,
};

function WeatherIcon({ code, className }: { code: string; className?: string }) {
  if (code === "rain") return <CloudRain className={className} />;
  if (code === "sunny") return <Sun className={className} />;
  if (code === "partly-cloudy") return <CloudSun className={className} />;
  return <Cloud className={className} />;
}

export function Feed() {
  const { theme, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const w = weatherData;

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
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-slate-gray-light rounded-lg transition-colors active:scale-95"
          >
            <Settings className="w-6 h-6 text-foreground" strokeWidth={2} />
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

      {/* Settings bottom sheet */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-slate-gray border-t border-slate-gray-light rounded-t-3xl max-w-screen-sm mx-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              <div className="pt-3 pb-2 px-4">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-foreground text-lg">Settings</h2>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="p-2 hover:bg-slate-gray-light rounded-lg transition-colors active:scale-90"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-10 space-y-4">
                {/* Dark / Light mode row */}
                <div className="flex items-center justify-between bg-deep-bg rounded-2xl px-4 py-4">
                  <div className="flex items-center gap-3">
                    {theme === "dark"
                      ? <Moon className="w-5 h-5 text-neon-blue" strokeWidth={2} />
                      : <Sun className="w-5 h-5 text-neon-yellow" strokeWidth={2} />
                    }
                    <div>
                      <p className="text-foreground font-semibold">
                        {theme === "dark" ? "Dark Mode" : "Light Mode"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {theme === "dark" ? "Switch to a lighter look" : "Switch to a darker look"}
                      </p>
                    </div>
                  </div>

                  {/* Toggle pill */}
                  <button
                    onClick={toggleTheme}
                    className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0"
                    style={{ backgroundColor: theme === "dark" ? "var(--neon-blue)" : "var(--slate-gray-light)" }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ x: theme === "dark" ? 28 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
