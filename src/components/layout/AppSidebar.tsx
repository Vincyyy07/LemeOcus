import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  BarChart3,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Habits", url: "/habits", icon: Repeat },
  { title: "Statistics", url: "/statistics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: BarChart2 },
  { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("See you soon 👋");
    navigate("/login", { replace: true });
  };

  return (
    <motion.aside
      className="h-screen sticky top-0 flex flex-col z-30 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(232 30% 4%) 0%, hsl(232 28% 5%) 100%)",
        borderRight: "1px solid hsl(232 18% 12%)",
      }}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Sidebar ambient glow */}
      <div
        className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(263 90% 68% / 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 relative z-10">
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
          style={{
            background: "linear-gradient(135deg, hsl(263 90% 68% / 0.3), hsl(180 85% 58% / 0.2))",
            border: "1px solid hsl(263 90% 68% / 0.4)",
            boxShadow: "0 0 16px hsl(263 90% 68% / 0.3)",
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Zap className="w-4 h-4 text-primary" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span
                className="font-display font-bold text-lg bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(263 90% 80%), hsl(180 85% 70%))",
                }}
              >
                LemeOcus
              </span>
              <p className="text-[9px] text-muted-foreground/60 leading-none font-medium tracking-widest uppercase">
                let me focus
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div
        className="mx-4 h-px mb-3"
        style={{ background: "linear-gradient(90deg, transparent, hsl(263 90% 68% / 0.3), transparent)" }}
      />

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <RouterNavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, hsl(263 90% 68% / 0.3), hsl(180 85% 58% / 0.15))",
                    border: "1px solid hsl(263 90% 68% / 0.35)",
                    boxShadow: "0 0 16px hsl(263 90% 68% / 0.2), inset 0 0 8px hsl(263 90% 68% / 0.05)",
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "hsl(232 20% 13% / 0.8)" }}
                />
              )}
              <item.icon
                className={cn(
                  "w-4 h-4 relative z-10 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "relative z-10 text-sm font-medium",
                      isActive ? "text-foreground" : ""
                    )}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2 relative z-10">
        {/* Divider */}
        <div
          className="h-px mx-1 mb-3"
          style={{ background: "linear-gradient(90deg, transparent, hsl(232 18% 18%), transparent)" }}
        />

        {/* User info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 rounded-xl"
              style={{ background: "hsl(232 20% 10%)", border: "1px solid hsl(232 18% 15%)" }}
            >
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Signed in as</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email ?? "—"}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive transition-all duration-200 group relative overflow-hidden"
        >
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/8" />
          <LogOut className="w-4 h-4 relative z-10 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium relative z-10">
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-9 rounded-xl text-muted-foreground hover:text-foreground transition-all hover:bg-secondary/40"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
