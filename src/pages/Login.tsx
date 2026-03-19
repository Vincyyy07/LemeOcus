import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Zap, ArrowRight } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin
          },
        });
        if (error) throw error;
        navigate("/onboarding", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, hsl(232 30% 4%) 0%, hsl(263 40% 8%) 100%)" }}>

        {/* Orbs */}
        <motion.div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] -top-20 -left-20 opacity-60"
          style={{ background: "hsl(263 90% 68% / 0.25)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] -bottom-10 -right-10 opacity-50"
          style={{ background: "hsl(180 85% 58% / 0.2)" }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(263 90% 68% / 0.4), hsl(180 85% 58% / 0.2))",
                border: "1px solid hsl(263 90% 68% / 0.5)",
                boxShadow: "0 0 20px hsl(263 90% 68% / 0.3)",
              }}>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(263 90% 80%), hsl(180 85% 70%))" }}>
              LemeOcus
            </span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <motion.h1
            className="font-display text-5xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(263 90% 80%), hsl(180 85% 70%))" }}>
              Let me focus,
            </span>
            <br />
            <span className="text-foreground/90">for real.</span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-lg leading-relaxed max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Track your tasks, build daily habits, and get a monthly report of how well you're actually doing.
          </motion.p>

          {/* Feature chips */}
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {["Daily Tasks ✅", "Habit Streaks 🔥", "Monthly Reports 📊"].map((f) => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{
                  background: "hsl(263 90% 68% / 0.12)",
                  border: "1px solid hsl(263 90% 68% / 0.25)",
                  color: "hsl(263 90% 80%)",
                }}>
                {f}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <p className="text-xs text-muted-foreground/50 relative z-10">
          LemeOcus · let me focus · your focus, your flow
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* BG orbs for mobile */}
        <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] -top-40 -left-40 opacity-30 lg:hidden"
          style={{ background: "hsl(263 90% 68% / 0.3)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(263 90% 68% / 0.3), hsl(180 85% 58% / 0.2))", border: "1px solid hsl(263 90% 68% / 0.4)" }}>
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-xl bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(263 90% 80%), hsl(180 85% 70%))" }}>
              LemeOcus
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-display text-3xl font-bold mb-1">
                {isLogin ? "Welcome back 👋" : "Join LemeOcus 🎯"}
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                {isLogin ? "Sign in to your focus space." : "Create your account — it's free."}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Username</label>
                <input
                  type="text"
                  placeholder="How should we call you?"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60 transition-all"
                  style={{
                    background: "hsl(232 24% 9%)",
                    border: "1px solid hsl(232 18% 18%)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "hsl(263 90% 68% / 0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "hsl(232 18% 18%)"; }}
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60 transition-all"
                style={{
                  background: "hsl(232 24% 9%)",
                  border: "1px solid hsl(232 18% 18%)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "hsl(263 90% 68% / 0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = "hsl(232 18% 18%)"; }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60 transition-all"
                  style={{ background: "hsl(232 24% 9%)", border: "1px solid hsl(232 18% 18%)" }}
                  onFocus={(e) => { e.target.style.borderColor = "hsl(263 90% 68% / 0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "hsl(232 18% 18%)"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2 mt-2 transition-all"
              style={{
                background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(263 90% 55%))",
                boxShadow: "0 0 20px hsl(263 90% 68% / 0.3), 0 4px 12px hsl(263 90% 68% / 0.2)",
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLogin ? "Sign in" : "Create account"}
            </motion.button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:underline underline-offset-2 transition-all">
              {isLogin ? "Create an account →" : "Sign in →"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
