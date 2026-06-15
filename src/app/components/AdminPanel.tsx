import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Trash2, Plus, LogOut, ChevronDown, ChevronUp } from "lucide-react";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

const COLOR_OPTIONS = [
  { label: "Blue", value: "neon-blue" },
  { label: "Pink", value: "neon-pink" },
  { label: "Purple", value: "neon-purple" },
  { label: "Green", value: "neon-green" },
];

const STAGE_OPTIONS = ["Main Stage", "Second Stage", "Third Stage", "Tent Stage"];
const DAY_OPTIONS = ["Friday", "Saturday", "Sunday"];
const GENRE_OPTIONS = ["Electronic", "Hip-Hop", "Rock", "Pop", "Jazz", "Techno", "House", "Other"];

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-slate-gray rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(157,78,221,0.3)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <h2 className="font-bold text-foreground tracking-wide">{title}</h2>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

export function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annType, setAnnType] = useState("info");
  const [annColor, setAnnColor] = useState("neon-blue");
  const [annPosting, setAnnPosting] = useState(false);
  const [annFeedback, setAnnFeedback] = useState("");

  // Performance state
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [subgenre, setSubgenre] = useState("");
  const [stage, setStage] = useState("Main Stage");
  const [day, setDay] = useState("Friday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [perfColor, setPerfColor] = useState("neon-blue");
  const [perfCategory, setPerfCategory] = useState("music");
  const [perfPosting, setPerfPosting] = useState(false);
  const [perfFeedback, setPerfFeedback] = useState("");
  const [performances, setPerformances] = useState([]);

  // Food trucks state
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [waitTimes, setWaitTimes] = useState({});
  const [foodFeedback, setFoodFeedback] = useState("");

  // Weather city state
  const [weatherCity, setWeatherCity] = useState("");
  const [weatherCityInput, setWeatherCityInput] = useState("");
  const [weatherCityFeedback, setWeatherCityFeedback] = useState("");

  const handleLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  // Fetch all data on login
  useEffect(() => {
    if (!loggedIn) return;
    fetchAnnouncements();
    fetchPerformances();
    fetchFoodTrucks();
    fetchWeatherCity();
  }, [loggedIn]);

  // --- Announcements ---
  const fetchAnnouncements = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  };

  const postAnnouncement = async () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      setAnnFeedback("Please fill in both title and message.");
      return;
    }
    setAnnPosting(true);
    const { error } = await supabase.from("announcements").insert([{ title: annTitle, message: annMessage, type: annType, color: annColor }]);
    if (error) {
      setAnnFeedback("Failed: " + error.message);
    } else {
      setAnnTitle("");
      setAnnMessage("");
      setAnnFeedback("Posted!");
      fetchAnnouncements();
    }
    setAnnPosting(false);
    setTimeout(() => setAnnFeedback(""), 3000);
  };

  const deleteAnnouncement = async (id) => {
    await supabase.from("announcements").delete().eq("id", id);
    fetchAnnouncements();
  };

  // --- Performances ---
  const fetchPerformances = async () => {
    const { data } = await supabase.from("performances").select("*").order("day").order("start_time");
    if (data) setPerformances(data);
  };

  const postPerformance = async () => {
    if (!artist.trim() || !startTime || !endTime) {
      setPerfFeedback("Please fill in artist, start time and end time.");
      return;
    }
    setPerfPosting(true);
    const { error } = await supabase.from("performances").insert([{
      artist, genre, subgenre, stage, day,
      start_time: startTime,
      end_time: endTime,
      color: perfColor,
      category: perfCategory,
      stage_color: perfColor,
    }]);
    if (error) {
      setPerfFeedback("Failed: " + error.message);
    } else {
      setArtist("");
      setSubgenre("");
      setStartTime("");
      setEndTime("");
      setPerfFeedback("Performance added!");
      fetchPerformances();
    }
    setPerfPosting(false);
    setTimeout(() => setPerfFeedback(""), 3000);
  };

  const deletePerformance = async (id) => {
    await supabase.from("performances").delete().eq("id", id);
    fetchPerformances();
  };

  // --- Food Trucks ---
  const fetchFoodTrucks = async () => {
    const { data } = await supabase.from("food_trucks").select("*").order("name");
    if (data) {
      setFoodTrucks(data);
      const times = {};
      data.forEach((f) => { times[f.id] = f.wait_time || ""; });
      setWaitTimes(times);
    }
  };

  const toggleFoodTruck = async (id, currentOpen) => {
    await supabase.from("food_trucks").update({ open: !currentOpen }).eq("id", id);
    fetchFoodTrucks();
  };

  const updateWaitTime = async (id) => {
    await supabase.from("food_trucks").update({ wait_time: waitTimes[id] }).eq("id", id);
    setFoodFeedback("Wait time updated!");
    setTimeout(() => setFoodFeedback(""), 2000);
  };

  // --- Weather City ---
  const fetchWeatherCity = async () => {
    const { data } = await supabase.from("settings").select("weather_city").eq("id", 1).single();
    if (data) {
      setWeatherCity(data.weather_city);
      setWeatherCityInput(data.weather_city);
    }
  };

  const saveWeatherCity = async () => {
    if (!weatherCityInput.trim()) return;
    const { error } = await supabase.from("settings").update({ weather_city: weatherCityInput }).eq("id", 1);
    if (error) {
      setWeatherCityFeedback("Failed: " + error.message);
    } else {
      setWeatherCity(weatherCityInput);
      setWeatherCityFeedback("City updated!");
    }
    setTimeout(() => setWeatherCityFeedback(""), 3000);
  };

  const inputClass = "w-full bg-deep-bg border border-slate-gray-light rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-purple";
  const selectClass = "bg-deep-bg border border-slate-gray-light rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-neon-purple";

  // Login screen
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-deep-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-slate-gray rounded-2xl p-6" style={{ border: "1px solid rgba(157,78,221,0.4)" }}>
          <h1 className="text-xl font-bold text-neon-purple mb-6 text-center tracking-wider">ADMIN LOGIN</h1>
          <div className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className={inputClass} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className={inputClass} />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button onClick={handleLogin} className="w-full bg-neon-purple text-white font-bold py-3 rounded-xl transition-all active:scale-95">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-bg pb-10">
      <header
        className="px-4 py-4 sticky top-0 z-10 border-b flex items-center justify-between mb-4"
        style={{
          background: "linear-gradient(to bottom, rgba(157,78,221,0.13), rgba(26,26,36,0) 100%), var(--slate-gray)",
          borderBottomColor: "rgba(157,78,221,0.3)",
        }}
      >
        <h1 className="text-xl font-bold text-neon-purple tracking-wider">ADMIN PANEL</h1>
        <button onClick={() => setLoggedIn(false)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </header>

      <div className="px-4 max-w-screen-sm mx-auto space-y-4">

        {/* Announcements */}
        <Section title="📢 ANNOUNCEMENTS">
          <input type="text" placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className={inputClass} />
          <textarea placeholder="Message" value={annMessage} onChange={(e) => setAnnMessage(e.target.value)} rows={3} className={inputClass + " resize-none"} />
          <div className="flex gap-3">
            <select value={annType} onChange={(e) => setAnnType(e.target.value)} className={selectClass + " flex-1"}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="emergency">Emergency</option>
              <option value="update">Update</option>
            </select>
            <select value={annColor} onChange={(e) => setAnnColor(e.target.value)} className={selectClass + " flex-1"}>
              {COLOR_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {annFeedback && <p className="text-sm text-neon-green">{annFeedback}</p>}
          <button onClick={postAnnouncement} disabled={annPosting} className="w-full flex items-center justify-center gap-2 bg-neon-purple text-white font-bold py-3 rounded-xl active:scale-95 disabled:opacity-50">
            <Plus className="w-5 h-5" /> {annPosting ? "Posting..." : "Post Announcement"}
          </button>
          <div className="space-y-2 pt-2">
            {announcements.length === 0 && <p className="text-muted-foreground text-sm text-center py-2">No announcements yet</p>}
            {announcements.map((a) => (
              <div key={a.id} className="bg-deep-bg rounded-xl p-3 border-l-4 flex items-start justify-between gap-3" style={{ borderLeftColor: `var(--${a.color})` }}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                </div>
                <button onClick={() => deleteAnnouncement(a.id)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Add Performance */}
        <Section title="🎤 ADD PERFORMANCE">
          <input type="text" placeholder="Artist name" value={artist} onChange={(e) => setArtist(e.target.value)} className={inputClass} />
          <div className="flex gap-3">
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectClass + " flex-1"}>
              {GENRE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <input type="text" placeholder="Subgenre" value={subgenre} onChange={(e) => setSubgenre(e.target.value)} className={selectClass + " flex-1"} />
          </div>
          <div className="flex gap-3">
            <select value={stage} onChange={(e) => setStage(e.target.value)} className={selectClass + " flex-1"}>
              {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={day} onChange={(e) => setDay(e.target.value)} className={selectClass + " flex-1"}>
              {DAY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Start time</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={selectClass + " w-full"} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">End time</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={selectClass + " w-full"} />
            </div>
          </div>
          <div className="flex gap-3">
            <select value={perfColor} onChange={(e) => setPerfColor(e.target.value)} className={selectClass + " flex-1"}>
              {COLOR_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="text" placeholder="Category (e.g. music)" value={perfCategory} onChange={(e) => setPerfCategory(e.target.value)} className={selectClass + " flex-1"} />
          </div>
          {perfFeedback && <p className="text-sm text-neon-green">{perfFeedback}</p>}
          <button onClick={postPerformance} disabled={perfPosting} className="w-full flex items-center justify-center gap-2 bg-neon-blue text-deep-bg font-bold py-3 rounded-xl active:scale-95 disabled:opacity-50">
            <Plus className="w-5 h-5" /> {perfPosting ? "Adding..." : "Add Performance"}
          </button>
          <div className="space-y-2 pt-2">
            {performances.length === 0 && <p className="text-muted-foreground text-sm text-center py-2">No performances yet</p>}
            {performances.map((p) => (
              <div key={p.id} className="bg-deep-bg rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{p.artist}</p>
                  <p className="text-xs text-muted-foreground">{p.day} · {p.stage} · {p.genre}</p>
                </div>
                <button onClick={() => deletePerformance(p.id)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Food Trucks */}
        <Section title="🍔 FOOD TRUCKS">
          {foodFeedback && <p className="text-sm text-neon-green">{foodFeedback}</p>}
          {foodTrucks.length === 0 && <p className="text-muted-foreground text-sm text-center py-2">No food trucks found</p>}
          {foodTrucks.map((f) => (
            <div key={f.id} className="bg-deep-bg rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground text-sm">{f.emoji} {f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.cuisine} · {f.location}</p>
                </div>
                <button
                  onClick={() => toggleFoodTruck(f.id, f.open)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${f.open ? "bg-neon-green text-deep-bg" : "bg-slate-gray-light text-muted-foreground"}`}
                >
                  {f.open ? "OPEN" : "CLOSED"}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Wait time (e.g. 10 mins)"
                  value={waitTimes[f.id] || ""}
                  onChange={(e) => setWaitTimes((prev) => ({ ...prev, [f.id]: e.target.value }))}
                  className="flex-1 bg-slate-gray border border-slate-gray-light rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-purple"
                />
                <button
                  onClick={() => updateWaitTime(f.id)}
                  className="px-3 py-2 bg-neon-purple text-white text-xs font-bold rounded-lg active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </Section>

        {/* Weather City */}
        <Section title="🌤️ WEATHER CITY">
          <p className="text-sm text-muted-foreground">
            Currently showing: <span className="text-foreground font-bold">{weatherCity || "Loading..."}</span>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter city name (e.g. Amsterdam)"
              value={weatherCityInput}
              onChange={(e) => setWeatherCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveWeatherCity()}
              className={inputClass + " flex-1"}
            />
            <button
              onClick={saveWeatherCity}
              className="px-4 py-3 bg-neon-blue text-deep-bg font-bold rounded-xl active:scale-95 whitespace-nowrap"
            >
              Save
            </button>
          </div>
          {weatherCityFeedback && <p className="text-sm text-neon-green">{weatherCityFeedback}</p>}
        </Section>

      </div>
    </div>
  );
}