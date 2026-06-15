import { Music, MapPin, Clock, Cloud, Sun, CloudRain, CloudSun } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function getWeatherCode(condition: string, description: string): string {
  const main = condition.toLowerCase();
  if (main.includes("rain")) return "rain";
  if (main.includes("clear")) return "sunny";
  if (main.includes("clouds")) {
    if (description.includes("broken") || description.includes("scattered")) {
      return "partly-cloudy";
    }
    return "cloud";
  }
  return "cloud";
}

function WeatherIcon({ code, className }: { code: string; className?: string }) {
  if (code === "rain") return <CloudRain className={className} />;
  if (code === "sunny") return <Sun className={className} />;
  if (code === "partly-cloudy") return <CloudSun className={className} />;
  return <Cloud className={className} />;
}

export function Feed() {
  type PerformanceNow = {
    id: number | string;
    artist: string;
    genre: string;
    stage: string;
    time: string;
    color: string;
  };

  const [happeningNow, setHappeningNow] = useState<PerformanceNow[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [weatherCity, setWeatherCity] = useState<string | null>(null);

  const [weather, setWeather] = useState<{
    city: string;
    country: string;
    condition: string;
    conditionCode: string;
    tempC: number;
    loading: boolean;
    error: string | null;
  }>({
    city: "",
    country: "",
    condition: "Loading...",
    conditionCode: "cloud",
    tempC: 0,
    loading: true,
    error: null,
  });

  function format(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Fetch city from settings table
  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("settings")
        .select("weather_city")
        .eq("id", 1)
        .single();
      if (!error && data) {
        setWeatherCity(data.weather_city);
      } else {
        setWeatherCity("Eindhoven"); // fallback
      }
    }
    fetchSettings();
  }, []);

  // UPDATED fetchPerformances with earliest fallback
  useEffect(() => {
    async function fetchPerformances() {
      const now = new Date().toISOString();

      // 1. Live now
      const { data: nowData, error: nowError } = await supabase
        .from("performances")
        .select("*")
        .lte("start_time", now)
        .gte("end_time", now);

      if (nowError) {
        console.error(nowError);
        return;
      }

      if (nowData && nowData.length > 0) {
        setIsLive(true);
        setHappeningNow(
          nowData.map((p) => ({
            ...p,
            time: `${format(p.start_time)} - ${format(p.end_time)}`,
          }))
        );
        return;
      }

      // 2. Upcoming (future)
      const { data: upcomingData, error: upcomingError } = await supabase
        .from("performances")
        .select("*")
        .gt("start_time", now)
        .order("start_time", { ascending: true })
        .limit(3);

      if (upcomingError) {
        console.error(upcomingError);
        return;
      }

      if (upcomingData && upcomingData.length > 0) {
        setIsLive(false);
        setHappeningNow(
          upcomingData.map((p) => ({
            ...p,
            time: `${format(p.start_time)} - ${format(p.end_time)}`,
          }))
        );
        return;
      }

      // 3. No live, no future → show earliest performances (e.g., Friday's openers)
      const { data: earliestData, error: earliestError } = await supabase
        .from("performances")
        .select("*")
        .order("start_time", { ascending: true })
        .limit(3);

      if (earliestError) {
        console.error(earliestError);
        setHappeningNow([]);
        return;
      }

      if (earliestData && earliestData.length > 0) {
        setIsLive(false);
        setHappeningNow(
          earliestData.map((p) => ({
            ...p,
            time: `${format(p.start_time)} - ${format(p.end_time)}`,
          }))
        );
      } else {
        setHappeningNow([]);
      }
    }

    fetchPerformances();
    const interval = setInterval(fetchPerformances, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather once city is known
  useEffect(() => {
    if (!weatherCity) return;

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      setWeather((prev) => ({ ...prev, loading: false, error: "API key missing. Set VITE_WEATHER_API_KEY in .env" }));
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${apiKey}&units=metric`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const condition = data.weather[0].main;
        const description = data.weather[0].description;
        const code = getWeatherCode(condition, description);
        setWeather({
          city: data.name,
          country: data.sys.country,
          condition: description.replace(/\b\w/g, (l: string) => l.toUpperCase()),
          conditionCode: code,
          tempC: Math.round(data.main.temp),
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        console.error("Weather fetch error:", err);
        setWeather((prev) => ({ ...prev, loading: false, error: "Failed to load weather" }));
      });
  }, [weatherCity]);

  type Announcement = {
    id: number | string;
    type: string;
    title: string;
    message: string;
    color: string;
    time: string;
  };

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) { console.error(error); return; }
      if (data) {
        setAnnouncements(data.map((a) => ({ ...a, time: timeAgo(a.created_at) })));
      }
    }
    fetchAnnouncements();
  }, []);

  function timeAgo(iso: string) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  return (
    <div className="min-h-screen bg-deep-bg">
      <header
        className="px-4 py-4 sticky top-0 z-10 border-b"
        style={{
          background: "linear-gradient(to bottom, rgba(0,217,255,0.13), rgba(26,26,36,0) 100%), var(--slate-gray)",
          borderBottomColor: "rgba(0,217,255,0.3)",
          boxShadow: "0 4px 24px -4px rgba(0,217,255,0.15)",
        }}
      >
        <div className="flex items-center justify-between max-w-screen-sm mx-auto mb-4">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-neon-blue" strokeWidth={2.5} />
            <h1
              className="text-xl tracking-wider text-neon-blue font-bold"
              style={{ textShadow: "0 0 12px rgba(0,217,255,0.7), 0 0 30px rgba(0,217,255,0.3)" }}
            >
              FESTIVAL
              <span className="text-neon-pink" style={{ textShadow: "0 0 12px rgba(255,20,147,0.7), 0 0 30px rgba(255,20,147,0.3)" }}>
                BUDDY
              </span>
            </h1>
          </div>
        </div>

        <div className="max-w-screen-sm mx-auto bg-white/5 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
          {weather.loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cloud className="w-5 h-5 animate-pulse" />
              <span className="text-sm">Loading weather...</span>
            </div>
          ) : weather.error ? (
            <div className="flex items-center gap-2 text-red-400">
              <Cloud className="w-5 h-5" />
              <span className="text-sm">{weather.error}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <WeatherIcon code={weather.conditionCode} className="w-9 h-9 text-neon-blue flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-2xl font-bold text-foreground">{weather.tempC}°C</span>
                  <p className="text-sm text-neon-pink truncate">{weather.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-neon-blue" />
                <span className="text-xs text-neon-blue font-medium">{weather.city}, {weather.country}</span>
              </div>
            </>
          )}
        </div>
      </header>

      <section className="px-4 pt-5 max-w-screen-sm mx-auto">
        <h2 className="text-lg mb-4 text-neon-blue font-bold tracking-wide">
          {isLive ? "HAPPENING NOW" : "UP NEXT"}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {happeningNow.length === 0 && (
            <div className="w-full py-6 text-center">
              <p className="text-muted-foreground text-sm">No performances scheduled</p>
            </div>
          )}
          {happeningNow.map((show) => (
            <div key={show.id} className="flex-shrink-0 w-72 bg-slate-gray rounded-xl p-4 border-2 snap-center" style={{ borderColor: `var(--${show.color})` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: `var(--${show.color})` }}>{show.artist}</h3>
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
                <div className="h-full rounded-full" style={{ width: "45%", backgroundColor: `var(--${show.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-6 max-w-screen-sm mx-auto">
        <h2 className="text-lg mb-4 text-neon-green font-bold tracking-wide">ANNOUNCEMENTS</h2>
        <div className="space-y-3">
          {announcements.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted-foreground text-sm">No announcements yet</p>
            </div>
          )}
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-slate-gray rounded-xl p-4 border-l-4" style={{ borderLeftColor: `var(--${announcement.color})` }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground">{announcement.title}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{announcement.time}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{announcement.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}