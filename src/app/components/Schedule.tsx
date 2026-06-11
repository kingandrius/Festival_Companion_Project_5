import { useState, useEffect } from "react";
import { Heart, MapPin, Clock, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE INTEGRATION — performances table
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Make sure src/lib/supabase.ts is set up (see that file for instructions).
//
// 2. Add these imports at the top of this file:
//      import { useState, useEffect } from "react";
//      import { supabase } from "../../lib/supabase";
//
// 3. Inside the Schedule() component, replace the static `schedule` array
//    declaration with the following:
//
//      const [schedule, setSchedule] = useState<typeof scheduleShape>([]);
//
//      useEffect(() => {
//        supabase
//          .from("performances")
//          .select("*")
//          .order("start_time")
//          .then(({ data, error }) => {
//            if (error) console.error("Failed to load performances:", error);
//            else if (data) setSchedule(
//              data.map((row) => ({
//                id:         row.id,
//                day:        row.day,
//                artist:     row.artist,
//                subgenre:   row.subgenre,
//                stage:      row.stage,
//                stageColor: row.stage_color,   // Supabase uses snake_case
//                startTime:  row.start_time,
//                endTime:    row.end_time,
//                category:   row.category,
//              }))
//            );
//          });
//      }, []);
//
// 4. (Optional) For real-time updates when the lineup changes:
//      supabase
//        .channel("performances")
//        .on("postgres_changes", { event: "*", schema: "public", table: "performances" },
//            () => { /* re-fetch here */ })
//        .subscribe();
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// DAYS — update labels and IDs to match your event dates.
// ─────────────────────────────────────────────────────────────────────────────
const days = [
  { id: "Friday", label: "Friday" },
  { id: "Saturday", label: "Saturday" },
  { id: "Sunday", label: "Sunday" },
];


// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES — extend this list to match the genres in your lineup.
// ─────────────────────────────────────────────────────────────────────────────
const categories = ["All", "Electronic", "Rock", "Hip-Hop", "R&B", "Indie", "Metal", "Jazz"];

export function Schedule() {
  const [schedule, setSchedule] = useState<{
    id: number;
    day: number;
    artist: string;
    subgenre: string;
    stage: string;
    stageColor: string;
    startTime: string;
    endTime: string;
    category: string;
  }[]>([]);

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
      supabase
        .from("performances")
        .select("*")
        .order("start_time")
        .then(({ data, error }) => {
          if (error) console.error("Failed to load performances:", error);
          else if (data) setSchedule(
            data.map((row) => ({
              id:         row.id,
              day:        row.day,
              artist:     row.artist,
              subgenre:   row.subgenre,
              stage:      row.stage,
              stageColor: row.stage_color,
              startTime:  row.start_time,
              endTime:    row.end_time,
              category:   row.category,
            }))
          );
        });
    }, []);

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
      <header
        className="px-4 py-4 sticky top-0 z-10 border-b"
        style={{
          background: "linear-gradient(to bottom, rgba(16,217,142,0.13), rgba(26,26,36,0) 100%), var(--slate-gray)",
          borderBottomColor: "rgba(16,217,142,0.3)",
          boxShadow: "0 4px 24px -4px rgba(16,217,142,0.15)",
        }}
      >
        <div className="flex items-center gap-3 max-w-screen-sm mx-auto mb-3">
          <span className="text-2xl">🎤</span>
          <h1 className="text-xl text-neon-green font-bold tracking-wider" style={{ textShadow: "0 0 12px rgba(16,217,142,0.7), 0 0 30px rgba(16,217,142,0.3)" }}>EVENT SCHEDULE</h1>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 max-w-screen-sm mx-auto mb-2">
          {days.map((day) => {
            const active = selectedDay === day.id;
            return (
              <motion.button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-colors duration-200 ${
                  active
                    ? "bg-neon-blue text-deep-bg"
                    : "bg-white/5 text-muted-foreground border border-white/10"
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

        {/* Genre filter */}
        <div className="relative max-w-screen-sm mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? "bg-neon-pink text-foreground"
                      : "bg-white/5 text-muted-foreground border border-white/10"
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
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center pr-1 bg-gradient-to-l from-slate-gray via-slate-gray/60 to-transparent w-8">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" strokeWidth={2.5} />
          </div>
        </div>
      </header>

      <section className="px-4 py-6 max-w-screen-sm mx-auto space-y-4 pb-24">
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-3">🎤</p>
            <p className="text-muted-foreground font-semibold">No performances listed yet</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-60">Connect your database to populate the lineup</p>
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
