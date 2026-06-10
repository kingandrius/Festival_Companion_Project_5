import { useState } from "react";
import { MapPin, Clock, Star, ChevronRight, Search, Flame } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface FoodTruck {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  location: string;
  waitTime: string;
  rating: number;
  priceRange: string;
  tags: string[];
  emoji: string;
  popular: string;
  open: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE INTEGRATION — food_trucks table
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Make sure src/lib/supabase.ts is set up (see that file for instructions).
//
// 2. Add these imports at the top of this file:
//      import { useEffect } from "react";
//      import { supabase } from "../../lib/supabase";
//
// 3. Inside the Food() component, add state and a fetch after the existing
//    useState declarations:
//
//      const [foodTrucks, setFoodTrucks] = useState<FoodTruck[]>([]);
//
//      useEffect(() => {
//        supabase
//          .from("food_trucks")
//          .select("*")
//          .order("name")
//          .then(({ data, error }) => {
//            if (error) console.error("Failed to load food trucks:", error);
//            else if (data) setFoodTrucks(
//              data.map((row) => ({
//                id:         row.id,
//                name:       row.name,
//                cuisine:    row.cuisine,
//                description:row.description,
//                location:   row.location,
//                waitTime:   row.wait_time,    // Supabase uses snake_case
//                rating:     row.rating,
//                priceRange: row.price_range,
//                tags:       row.tags ?? [],
//                emoji:      row.emoji,
//                popular:    row.popular,
//                open:       row.open,
//              }))
//            );
//          });
//      }, []);
//
//    Then remove the `const foodTrucks: FoodTruck[] = []` line below,
//    since it will be replaced by the useState above.
//
// 4. To update wait times in real-time (e.g. from a dashboard):
//      supabase
//        .channel("food_trucks")
//        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "food_trucks" },
//            (payload) => setFoodTrucks((prev) =>
//              prev.map((t) => t.id === payload.new.id ? { ...t, ...payload.new } : t)
//            ))
//        .subscribe();
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CUISINE FILTERS — update to match the categories in your food truck lineup.
// The filter logic below checks truck.cuisine and truck.tags, so make sure
// the values you use here align with your data.
// ─────────────────────────────────────────────────────────────────────────────
const cuisineFilters = ["All", "BBQ", "Vegan", "Asian", "Mexican", "Desserts"];

export function Food() {
  const [foodTrucks, setFoodTrucks] = useState<FoodTruck[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTruck, setSelectedTruck] = useState<FoodTruck | null>(null);

  useEffect(() => {
    async function fetchFoodTrucks() {
      const { data, error } = await supabase
        .from("food_trucks")
        .select("*")
        .order("name");

      if (error) console.error(error);
      else setFoodTrucks(data.map(truck => ({
        ...truck,
        waitTime:   truck.wait_time,
        priceRange: truck.price_range,
      })));
    }

    fetchFoodTrucks();
  }, []);

  const filtered = foodTrucks.filter((truck) => {
    const matchesSearch =
      truck.name.toLowerCase().includes(search.toLowerCase()) ||
      truck.cuisine.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "BBQ" && truck.cuisine.includes("BBQ")) ||
      (activeFilter === "Vegan" && truck.tags.some((t) => t.includes("Vegan") || t.includes("Plant"))) ||
      (activeFilter === "Asian" &&
        ["Korean", "Japanese", "Hawaiian", "Indian"].some((c) => truck.cuisine.includes(c))) ||
      (activeFilter === "Mexican" && truck.cuisine.includes("Mexican")) ||
      (activeFilter === "Desserts" && truck.tags.some((t) => t === "Sweet" || t === "Dessert"));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-deep-bg">
      {/* Header */}
      <header
        className="px-4 pt-4 pb-3 sticky top-0 z-10 border-b"
        style={{
          background: "linear-gradient(to bottom, rgba(16,217,142,0.13), rgba(26,26,36,0) 100%), var(--slate-gray)",
          borderBottomColor: "rgba(16,217,142,0.3)",
          boxShadow: "0 4px 24px -4px rgba(16,217,142,0.15)",
        }}
      >
        <div className="max-w-screen-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl text-neon-green font-bold tracking-wider" style={{ textShadow: "0 0 12px rgba(16,217,142,0.7), 0 0 30px rgba(16,217,142,0.3)" }}>FOOD & DRINKS</h1>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food trucks..."
              className="w-full bg-deep-bg border border-slate-gray-light rounded-xl pl-9 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent text-sm"
            />
          </div>

          {/* Filters */}
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {cuisineFilters.map((filter) => {
                const active = activeFilter === filter;
                return (
                  <motion.button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "bg-neon-green text-deep-bg font-semibold"
                        : "bg-deep-bg border border-slate-gray-light text-muted-foreground"
                    }`}
                    whileTap={{ scale: 0.82 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  >
                    <motion.span
                      animate={active ? { scale: [0.88, 1.14, 1] } : {}}
                      transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                      style={{ display: "block" }}
                    >
                      {filter}
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
            {/* Scroll hint */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center pr-1 bg-gradient-to-l from-slate-gray via-slate-gray/60 to-transparent w-10">
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </header>

      {/* Truck list */}
      <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-3 pb-24">
        {foodTrucks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-3">🍽️</p>
            <p className="text-muted-foreground font-semibold">No food trucks listed yet</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-60">Connect your database to populate the food guide</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{filtered.length} trucks available</p>

            {filtered.map((truck) => (
              <button
                key={truck.id}
                onClick={() => setSelectedTruck(truck)}
                className="w-full text-left bg-slate-gray border border-slate-gray-light rounded-2xl p-4 transition-all active:scale-[0.98] hover:border-neon-green/40"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0 w-12 h-12 bg-deep-bg rounded-xl flex items-center justify-center">
                    {truck.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground truncate">{truck.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-foreground">{truck.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neon-green">{truck.cuisine}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{truck.priceRange}</span>
                      {!truck.open && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-red-400">Closed</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{truck.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{truck.location}</span>
                      </div>
                      {truck.open && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neon-blue" />
                          <span className="text-xs text-neon-blue">{truck.waitTime} wait</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>

                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {truck.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-deep-bg rounded-full text-xs text-muted-foreground border border-slate-gray-light"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Bottom sheet detail */}
      {selectedTruck && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setSelectedTruck(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full bg-slate-gray rounded-t-3xl border-t border-slate-gray-light max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-gray pt-3 pb-2 px-4">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <div className="flex items-center gap-3">
                <div className="text-4xl w-14 h-14 bg-deep-bg rounded-xl flex items-center justify-center flex-shrink-0">
                  {selectedTruck.emoji}
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">{selectedTruck.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neon-green">{selectedTruck.cuisine}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{selectedTruck.priceRange}</span>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm">{selectedTruck.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 pb-8 space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">{selectedTruck.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-deep-bg rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-neon-blue" />
                    <span className="text-xs text-muted-foreground">Location</span>
                  </div>
                  <p className="text-sm text-foreground">{selectedTruck.location}</p>
                </div>
                <div className="bg-deep-bg rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-neon-green" />
                    <span className="text-xs text-muted-foreground">Wait Time</span>
                  </div>
                  <p className="text-sm text-foreground">
                    {selectedTruck.open ? selectedTruck.waitTime : "Closed now"}
                  </p>
                </div>
              </div>

              <div className="bg-deep-bg rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Most Popular</span>
                </div>
                <p className="text-foreground font-semibold">{selectedTruck.popular}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedTruck.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-full text-xs text-neon-green"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
