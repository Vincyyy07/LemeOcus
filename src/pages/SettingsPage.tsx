import { motion } from "framer-motion";
import { Moon, Sun, Bell, User, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// Persist settings in localStorage
const getSetting = (key: string, fallback: number | boolean) => {
  const v = localStorage.getItem(`lemeocu_${key}`);
  if (v === null) return fallback;
  if (typeof fallback === "boolean") return v === "true";
  return Number(v);
};

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<boolean>(
    () => getSetting("notifications", true) as boolean
  );

  const handleNotifications = (v: boolean) => {
    setNotifications(v);
    localStorage.setItem("lemeocu_notifications", String(v));
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const isDark = theme === "dark";

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 max-w-2xl">
      <motion.h1 variants={fadeUp} className="font-display text-3xl font-bold">Settings</motion.h1>

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-7 space-y-7">

        {/* Theme toggle — light / dark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark
              ? <Moon className="w-5 h-5 text-primary" />
              : <Sun className="w-5 h-5 text-primary" />
            }
            <div>
              <p className="text-sm font-medium">{isDark ? "Dark" : "Light"} Theme</p>
              <p className="text-xs text-muted-foreground">
                {isDark ? "Switch to a lighter look" : "Switch to a darker look"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toggleTheme();
              toast.success(isDark ? "Switched to light theme ☀️" : "Switched to dark theme 🌙");
            }}
            className={cn(
              "w-12 h-6 rounded-full relative transition-all duration-300",
              isDark ? "toggle-on" : "bg-muted border border-border"
            )}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div
              className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full toggle-thumb flex items-center justify-center",
                isDark ? "right-0.5 bg-white/95" : "left-0.5 bg-primary/80"
              )}
            >
              {isDark
                ? <Moon className="w-2.5 h-2.5 text-primary" />
                : <Sun className="w-2.5 h-2.5 text-white" />
              }
            </div>
          </button>
        </div>

        {/* Separator */}
        <div className="h-px bg-border/40" />

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">Daily reminders and streaks</p>
            </div>
          </div>
          <button
            onClick={() => handleNotifications(!notifications)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-all duration-300",
              notifications ? "bg-success/80 border border-success/40" : "bg-muted border border-border"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full toggle-thumb",
                notifications ? "right-0.5 bg-white" : "left-0.5 bg-muted-foreground/60"
              )}
            />
          </button>
        </div>

        {/* Separator */}
        <div className="h-px bg-border/40" />

        {/* Account */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center border border-primary/20">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Account</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? "—"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg text-destructive hover:bg-destructive/8 border border-destructive/15 hover:border-destructive/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
