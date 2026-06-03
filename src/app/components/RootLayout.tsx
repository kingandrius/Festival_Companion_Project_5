import { Outlet, Link, useLocation } from "react-router";
import { Radio, Calendar, MapPin, Bot, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";

export function RootLayout() {
  const location = useLocation();
  const { theme } = useTheme();

  const navItems = [
    { path: "/", label: "Feed", icon: Radio },
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/map", label: "Map", icon: MapPin },
    { path: "/food", label: "Food", icon: Utensils },
    { path: "/assistant", label: "AI", icon: Bot },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`${theme} h-screen w-screen bg-deep-bg flex flex-col overflow-hidden`}>
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-gray border-t border-neon-blue/40" style={{ boxShadow: "0 -4px 24px -4px rgba(0,217,255,0.18), 0 -1px 0 rgba(0,217,255,0.35)" }}>
        <div className="flex items-center justify-around h-20 max-w-screen-sm mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <motion.div
                  className="flex flex-col items-center justify-center h-16 gap-1 rounded-xl relative"
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  {/* Active glow pill behind icon */}
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-x-1 top-1.5 h-8 rounded-lg bg-neon-blue/15"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon with bounce on activation */}
                  <motion.div
                    animate={active ? { y: [-4, 0] } : { y: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 18 }}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors duration-150 ${
                        active ? "text-neon-blue drop-shadow-[0_0_6px_var(--neon-blue)]" : "text-muted-foreground"
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.div>

                  <motion.span
                    animate={{ opacity: active ? 1 : 0.5 }}
                    className={`text-xs transition-colors duration-150 ${
                      active ? "text-neon-blue font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
