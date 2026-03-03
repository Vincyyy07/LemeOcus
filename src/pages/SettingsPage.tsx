import { motion } from "framer-motion";
import { Moon, Bell, User, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
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
  const navigate = useNavigate();

  const [ambientIntensity, setAmbientIntensity] = useState<number>(
    () => getSetting("ambient", 60) as number
  );
  const [notifications, setNotifications] = useState<boolean>(
    () => getSetting("notifications", true) as boolean
  );

  const handleAmbient = (v: number) => {
    setAmbientIntensity(v);
    localStorage.setItem("lemeocu_ambient", String(v));
  };

  const handleNotifications = (v: boolean) => {
    setNotifications(v);
    localStorage.setItem("lemeocu_notifications", String(v));
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 max-w-2xl">
      <motion.h1 variants={fadeUp} className="font-display text-3xl font-bold">Settings</motion.h1>

      <motion.div variants={fadeUp} className="glass rounded-xl p-6 space-y-6">

        {/* Theme — always dark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Dark Theme</p>
              <p className="text-xs text-muted-foreground">Always on for optimal focus</p>
            </div>
          </div>
          <div className="w-10 h-6 rounded-full bg-primary/30 relative cursor-default" title="Dark mode is always on">
            <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-primary" />
          </div>
        </div>

        {/* Ambient intensity */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Ambient Intensity</p>
              <p className="text-xs text-muted-foreground">Glow effect strength</p>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={ambientIntensity}
            onChange={(e) => handleAmbient(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">{ambientIntensity}%</p>
        </div>

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
              "w-10 h-6 rounded-full relative transition-colors",
              notifications ? "bg-success/30" : "bg-secondary"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full transition-all",
              notifications ? "right-0.5 bg-success" : "left-0.5 bg-muted-foreground"
            )} />
          </button>
        </div>

        {/* Account — real user email */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/30">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
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
          className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
