import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AmbientBackground from "./AmbientBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full">
      <AmbientBackground />
      <AppSidebar />
      <main className="flex-1 relative z-10 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8 max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AppLayout;
