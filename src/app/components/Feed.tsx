import { Music, MapPin, Clock, Cloud, Sun, CloudRain, CloudSun } from "lucide-react";
import { supabase } from "../../lib/supabase";

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

  // ───────────────────────────────────────────────────────────────────────────
  // SUPABASE INTEGRATION — "Happening Now" from the performances table
  // ───────────────────────────────────────────────────────────────────────────
  //
  // 1. Make sure src/lib/supabase.ts is set up (see that file for instructions).
  //
  // 2. Add these imports at the top of this file:
  //      import { useState, useEffect } from "react";
  //      import { supabase } from "../../lib/supabase";
  //
  // 3. Inside Feed(), replace the const below with:
  //
  //      const [happeningNow, setHappeningNow] = useState<...>([]);
  //
  //      useEffect(() => {
  //        const now = new Date().toTimeString().slice(0, 8); // "HH:MM:SS"
  //        supabase
  //          .from("performances")
  //          .select("*")
  //          .lte("start_time", now)
  //          .gte("end_time", now)
  //          .then(({ data, error }) => {
  //            if (error) console.error(error);
  //            else if (data) setHappeningNow(
  //              data.map((row) => ({
  //                id:     row.id,
  //                artist: row.artist,
  //                genre:  row.subgenre,
  //                stage:  row.stage,
  //                time:   `${row.start_time} - ${row.end_time}`,
  //                color:  row.stage_color,
  //              }))
  //            );
  //          });
  //      }, []);
  // ───────────────────────────────────────────────────────────────────────────
  const { data: happeningNow } = await supabase
  .from("performances")
  .select("*")
  .lte("start_time", new Date().toISOString())
  .gte("end_time",   new Date().toISOString());

  // ───────────────────────────────────────────────────────────────────────────
  // SUPABASE INTEGRATION — Announcements table
  // ───────────────────────────────────────────────────────────────────────────
  //
  // 1. Inside Feed(), replace the const below with:
  //
  //      const [announcements, setAnnouncements] = useState<...>([]);
  //
  //      useEffect(() => {
  //        supabase
  //          .from("announcements")
  //          .select("*")
  //          .order("created_at", { ascending: false })
  //          .limit(10)
  //          .then(({ data, error }) => {
  //            if (error) console.error(error);
  //            else if (data) setAnnouncements(
  //              data.map((row) => ({
  //                id:      row.id,
  //                type:    row.type,
  //                title:   row.title,
  //                message: row.message,
  //                color:   row.color,
  //                // Convert DB timestamp to a human-readable age:
  //                time: formatDistanceToNow(new Date(row.created_at), { addSuffix: true }),
  //                // ^ install date-fns: pnpm add date-fns
  //              }))
  //            );
  //          });
  //
  //        // Real-time: new announcements appear instantly
  //        const channel = supabase
  //          .channel("announcements")
  //          .on("postgres_changes", { event: "INSERT", schema: "public", table: "announcements" },
  //              (payload) => setAnnouncements((prev) => [payload.new as any, ...prev]))
  //          .subscribe();
  //
  //        return () => { supabase.removeChannel(channel); };
  //      }, []);
  // ───────────────────────────────────────────────────────────────────────────
  const { data: announcements } = await supabase
   .from("announcements")
   .select("*")
   .order("created_at", { ascending: false })
   .limit(10);

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
