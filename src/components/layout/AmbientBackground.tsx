import { motion } from "framer-motion";

const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

      {/* Primary violet orb — top-left */}
      <motion.div
        className="ambient-orb w-[600px] h-[600px] -top-64 -left-56"
        style={{ background: "hsl(262 85% 68% / 0.10)" }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cyan orb — right */}
      <motion.div
        className="ambient-orb w-[450px] h-[450px] top-1/3 -right-40"
        style={{ background: "hsl(182 80% 55% / 0.08)" }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Green orb — bottom */}
      <motion.div
        className="ambient-orb w-[320px] h-[320px] -bottom-32 left-1/4"
        style={{ background: "hsl(145 72% 48% / 0.07)" }}
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Noise texture */}
      <div
        className="fixed inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />
    </div>
  );
};

export default AmbientBackground;
