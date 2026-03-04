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
        background: "linear-gradient(180deg, hsl(228 34% 3%) 0%, hsl(228 30% 5%) 60%, hsl(228 28% 4%) 100%)",
        borderRight: "1px solid hsl(228 20% 10%)",
      }}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Sidebar top glow */}
      <div
        className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(262 85% 68% / 0.09) 0%, transparent 70%)",
        }}
      />

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(262 92% 70% / 0.2), hsl(182 88% 60% / 0.15), transparent)",
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 relative z-10">
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
          style={{
            background: "linear-gradient(135deg, hsl(262 85% 68% / 0.20), hsl(182 80% 55% / 0.12))",
            border: "1px solid hsl(262 85% 68% / 0.35)",
            boxShadow: "0 0 12px hsl(262 85% 68% / 0.22)",
          }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
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
                className="font-display font-bold text-[17px] bg-clip-text text-transparent leading-none"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(262 92% 82%), hsl(182 88% 72%))",
                }}
              >
                LemeOcus
              </span>
              <p className="text-[9px] text-muted-foreground/50 leading-none font-semibold tracking-[0.18em] uppercase mt-0.5">
                let me focus
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gradient divider */}
      <div
        className="mx-4 h-px mb-3"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(262 92% 70% / 0.35), hsl(182 88% 60% / 0.2), transparent)",
        }}
      />

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 space-y-0.5 relative z-10">
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
                    background: "linear-gradient(135deg, hsl(262 85% 68% / 0.18), hsl(182 80% 55% / 0.10))",
                    border: "1px solid hsl(262 85% 68% / 0.28)",
                    boxShadow: "0 0 10px hsl(262 85% 68% / 0.12)",
                  }}
                  transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
                />
              )}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "hsl(228 22% 12% / 0.85)" }}
                />
              )}

              {/* Active left accent bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, hsl(262 85% 68%), hsl(182 80% 55%))",
                    boxShadow: "0 0 5px hsl(262 85% 68% / 0.5)",
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                />
              )}

              <item.icon
                className={cn(
                  "w-4 h-4 relative z-10 shrink-0 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
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
      <div className="px-3 pb-4 space-y-1.5 relative z-10">
        <div
          className="h-px mx-1 mb-3"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(228 20% 17%), transparent)",
          }}
        />

        {/* User info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2.5 rounded-xl mb-1 gradient-border"
              style={{
                background: "linear-gradient(135deg, hsl(228 22% 10%), hsl(228 26% 8%))",
                border: "1px solid hsl(228 20% 14%)",
              }}
            >
              <p className="text-[9px] text-muted-foreground/45 uppercase tracking-[0.14em] font-semibold">
                Signed in as
              </p>
              <p className="text-[11px] text-muted-foreground/75 truncate mt-0.5">
                {user?.email ?? "—"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive transition-all duration-200 group relative overflow-hidden"
        >
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "hsl(355 82% 62% / 0.08)" }}
          />
          <LogOut className="w-4 h-4 relative z-10 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium relative z-10"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-9 rounded-xl text-muted-foreground/50 hover:text-foreground transition-all duration-200 hover:bg-secondary/35"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
