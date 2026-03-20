import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer } from "react-timer-hook";
import { X, Pause, Play, CheckCircle2, Volume2, VolumeX, Link } from "lucide-react";
import { useFocus } from "@/context/FocusContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { logTaskCompletion } from "@/hooks/use-tasks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DURATIONS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "50 min", seconds: 50 * 60 },
  { label: "90 min", seconds: 90 * 60 },
];

/** Extract a YouTube video ID from any standard YouTube URL */
const getYtId = (url: string): string | null => {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
};

const buildExpiry = (seconds: number) => {
  const t = new Date();
  t.setSeconds(t.getSeconds() + seconds);
  return t;
};

const pad = (n: number) => String(n).padStart(2, "0");

export const FocusMode = () => {
  const { focusSession, endFocus } = useFocus();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [isPaused, setIsPaused] = useState(false);

  // YouTube ambient sound state
  const [ytUrl, setYtUrl] = useState("https://youtu.be/qycqF1CWcXg?si=oxlC25iKIDUeIdUq");
  const [ytInput, setYtInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const ytId = getYtId(ytUrl);

  const expiryRef = useRef(buildExpiry(selectedDuration.seconds));

  const { seconds, minutes, pause, resume, restart } = useTimer({
    expiryTimestamp: expiryRef.current,
    autoStart: true,
    onExpire: () => handleComplete(),
  });

  // ── Auto fullscreen when Focus Mode opens ──────────────────────────────────
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => { });
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => { });
      }
    };
  }, []);

  const handleSelectDuration = (dur: typeof DURATIONS[0]) => {
    setSelectedDuration(dur);
    setIsPaused(false);
    const newExpiry = buildExpiry(dur.seconds);
    expiryRef.current = newExpiry;
    restart(newExpiry, true);
  };

  const togglePause = () => {
    if (isPaused) { resume(); setIsPaused(false); }
    else { pause(); setIsPaused(true); }
  };

  // ── Sound toggle ───────────────────────────────────────────────────────────
  const handleSoundToggle = () => {
    if (!ytUrl) {
      // No URL yet — show the input field
      setShowUrlInput((v) => !v);
      return;
    }
    setSoundOn((v) => !v);
  };

  const handleUrlSubmit = () => {
    const id = getYtId(ytInput.trim());
    if (!id) {
      toast.error("Couldn't find a YouTube video ID in that link.");
      return;
    }
    setYtUrl(ytInput.trim());
    setShowUrlInput(false);
    setSoundOn(true);
  };

  // ── Complete / Exit ────────────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!focusSession || !user) return;
      const { error } = await supabase
        .from("tasks")
        .update({ done: true })
        .eq("id", focusSession.taskId);
      if (error) throw error;
      await logTaskCompletion(focusSession.taskId, user.id, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task_logs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleComplete = async () => {
    await toggleMutation.mutateAsync();
    toast.success("🎉 Task completed! Great work.");
    endFocus();
  };

  const handleExit = () => endFocus();

  if (!focusSession) return null;

  const totalSecs = selectedDuration.seconds;
  const elapsed = totalSecs - (minutes * 60 + seconds);
  const progress = Math.min(elapsed / totalSecs, 1);
  const circumference = 2 * Math.PI * 110;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="focus-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(262 85% 8%) 0%, hsl(228 32% 4%) 45%, hsl(240 60% 8%) 100%)",
        }}
      >
        {/* Hidden YouTube iframe — plays audio from the background */}
        {ytId && soundOn && (
          <iframe
            key={ytId}
            className="absolute w-0 h-0 pointer-events-none opacity-0"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&controls=0&mute=0`}
            allow="autoplay"
            title="ambient-sound"
          />
        )}

        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="focus-orb focus-orb-1" />
          <div className="focus-orb focus-orb-2" />
          <div className="focus-orb focus-orb-3" />
        </div>

        {/* Top-right controls */}
        <div className="absolute top-5 right-5 flex gap-3 items-start">
          {/* YouTube URL input popover */}
          <AnimatePresence>
            {showUrlInput && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="flex gap-2 items-center bg-black/60 border border-white/15 rounded-xl px-3 py-2 backdrop-blur-xl"
              >
                <Link className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <input
                  autoFocus
                  value={ytInput}
                  onChange={(e) => setYtInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  placeholder="Paste YouTube link…"
                  className="bg-transparent outline-none text-sm text-white placeholder:text-white/30 w-52"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
                >
                  Play
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sound button */}
          <button
            onClick={handleSoundToggle}
            title={!ytUrl ? "Add YouTube ambient link" : soundOn ? "Stop ambient sound" : "Play ambient sound"}
            className={cn(
              "p-2.5 rounded-xl border transition-all duration-200 backdrop-blur-sm",
              soundOn
                ? "bg-accent/20 border-accent/40 text-accent"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
            )}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Exit button */}
          <button
            onClick={handleExit}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/25 transition-all duration-200 backdrop-blur-sm"
            title="Exit focus mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duration chips */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-10"
        >
          {DURATIONS.map((d) => (
            <button
              key={d.label}
              onClick={() => handleSelectDuration(d)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                selectedDuration.label === d.label
                  ? "bg-primary/30 border-primary/60 text-white shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25"
              )}
            >
              {d.label}
            </button>
          ))}
        </motion.div>

        {/* Task title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl md:text-2xl font-semibold text-white/80 mb-10 text-center px-8 max-w-xl tracking-wide"
        >
          {focusSession.taskTitle}
        </motion.h1>

        {/* Circular progress timer */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 22 }}
          className="relative mb-12"
          style={{ width: 264, height: 264 }}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 264 264">
            <circle cx="132" cy="132" r="110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="132" cy="132" r="110"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{
                transition: "stroke-dashoffset 1s linear",
                filter: "drop-shadow(0 0 8px hsl(var(--primary)/0.6))",
              }}
            />
          </svg>

          <div
            className={cn("absolute inset-4 rounded-full focus-timer-pulse", isPaused && "animation-paused")}
            style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.08) 0%, transparent 70%)" }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono text-6xl font-bold tabular-nums text-white leading-none"
              style={{ textShadow: "0 0 30px hsl(var(--primary)/0.4)" }}
            >
              {pad(minutes)}:{pad(seconds)}
            </span>
            <span className="text-white/40 text-xs mt-2 uppercase tracking-widest">
              {isPaused ? "Paused" : "Focusing"}
            </span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={togglePause}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/15 bg-white/[0.08] hover:bg-white/[0.12] hover:border-white/25 text-white text-sm font-medium transition-all duration-200"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {isPaused ? (
              <><Play className="w-4 h-4 fill-current" /> Resume</>
            ) : (
              <><Pause className="w-4 h-4 fill-current" /> Pause</>
            )}
          </button>

          <button
            onClick={handleComplete}
            disabled={toggleMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 75% 54%))",
              boxShadow: "0 4px 20px hsl(var(--primary)/0.4)",
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Task
          </button>
        </motion.div>

        <p className="absolute bottom-6 text-white/20 text-xs tracking-wider">
          Press <kbd className="font-mono">Esc</kbd> to exit
        </p>

        <EscListener onEsc={handleExit} />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

const EscListener = ({ onEsc }: { onEsc: () => void }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEsc();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEsc]);
  return null;
};

export default FocusMode;
