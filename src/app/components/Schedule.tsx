import { useState } from "react";
import { Heart, MapPin, Clock } from "lucide-react";
import { motion } from "motion/react";

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE SHAPE — replace this array with a real fetch from your backend.
// Each row in your `performances` table should match this structure:
//
// {
//   id: number,           // unique performance ID
//   day: number,          // 1 = Friday, 2 = Saturday, 3 = Sunday
//   artist: string,       // e.g. "Electric Pulse"
//   subgenre: string,     // e.g. "Techno / House"
//   stage: string,        // e.g. "Main Stage"
//   stageColor: string,   // CSS token without var(): "neon-blue" | "neon-pink" | "neon-green" | "neon-yellow"
//   startTime: string,    // e.g. "8:00 PM"
//   endTime: string,      // e.g. "9:30 PM"
//   category: string,     // must match one of the entries in `categories` below
// }
//
// Example fetch (replace with your actual DB client):
//   const schedule = await supabase.from("performances").select("*").order("start_time");
// ─────────────────────────────────────────────────────────────────────────────
const schedule: {
  id: number;
  day: number;
  artist: string;
  subgenre: string;
  stage: string;
  stageColor: string;
  startTime: string;
  endTime: string;
  category: string;
}[] = [
  // TODO: populate from database
];

// ─────────────────────────────────────────────────────────────────────────────
// DAYS — update labels and IDs to match your event dates.
// ─────────────────────────────────────────────────────────────────────────────
const days = [
  { id: 1, label: "Friday" },
  { id: 2, label: "Saturday" },
  { id: 3, label: "Sunday" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES — extend this list to match the genres in your lineup.
// ─────────────────────────────────────────────────────────────────────────────
const categories = ["All", "Electronic", "Rock", "Hip-Hop", "R&B", "Indie", "Metal", "Jazz"];

export function Schedule() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredSchedule = schedule.filter(
    (show) =>
      show.day === selectedDay &&
      (selectedCategory === "All" || show.category === selectedCategory)
  );

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-deep-bg">
      <header className="bg-slate-gray border-b border-slate-gray-light px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">🎤</span>
          <h1 className="text-xl text-neon-green font-bold tracking-wider">EVENT SCHEDULE</h1>
        </div>
      </header>

      <div className="sticky top-[60px] z-10 bg-deep-bg border-b border-slate-gray-light">
        <div className="flex gap-2 px-4 py-3 max-w-screen-sm mx-auto">
          {days.map((day) => {
            const active = selectedDay === day.id;
            return (
              <motion.button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors duration-200 ${
                  active
                    ? "bg-neon-blue text-deep-bg"
                    : "bg-slate-gray text-muted-foreground border border-slate-gray-light"
                }`}
                whileTap={{ scale: 0.86, y: 2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                {day.label}
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-3 px-4 pb-3 max-w-screen-sm mx-auto overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors duration-200 ${
                  active
                    ? "bg-neon-pink text-foreground"
                    : "bg-slate-gray text-muted-foreground"
                }`}
                whileTap={{ scale: 0.82 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <motion.span
                  animate={active ? { scale: [0.88, 1.14, 1] } : {}}
                  transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                  style={{ display: "block" }}
                >
                  {category}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <section className="px-4 py-6 max-w-screen-sm mx-auto space-y-4 pb-24">
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-3">🎤</p>
            <p className="text-muted-foreground font-semibold">No performances listed yet</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-60">CONNECT OUR DATABASE TO POPULATE!</p>
          </div>
        ) : (
          filteredSchedule.map((show) => {
            const isFavorited = favorites.includes(show.id);

            return (
              <div
                key={show.id}
                className="bg-slate-gray rounded-xl p-4 border-l-4"
                style={{ borderLeftColor: `var(--${show.stageColor})` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {show.artist}
                    </h3>
                    <p className="text-sm text-muted-foreground">{show.subgenre}</p>
                  </div>

                  <button
                    onClick={() => toggleFavorite(show.id)}
                    className="p-2 rounded-lg hover:bg-slate-gray-light transition-colors active:scale-90"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isFavorited
                          ? "fill-neon-pink text-neon-pink"
                          : "text-muted-foreground"
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {show.startTime} – {show.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: `var(--${show.stageColor})` }} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: `var(--${show.stageColor})` }}
                    >
                      {show.stage}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
