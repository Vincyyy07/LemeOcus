import { motion } from "framer-motion";

const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary violet orb — top left */}
      <motion.div
        className="ambient-orb w-[700px] h-[700px] -top-64 -left-64"
        style={{ background: "hsl(263 90% 68% / 0.18)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Cyan orb — right */}
      <motion.div
        className="ambient-orb w-[500px] h-[500px] top-1/3 -right-40"
        style={{ background: "hsl(180 85% 58% / 0.14)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Pink orb — center */}
      <motion.div
        className="ambient-orb w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "hsl(320 80% 65% / 0.07)" }}
        animate={{ x: [0, 25, -15, 0], y: [0, -20, 15, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Green orb — bottom */}
      <motion.div
        className="ambient-orb w-[350px] h-[350px] -bottom-32 left-1/4"
        style={{ background: "hsl(142 78% 52% / 0.1)" }}
        animate={{ x: [0, 20, 0], y: [0, -25, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tiny floating particle accents */}
      <motion.div
        className="ambient-orb w-[120px] h-[120px] top-1/4 left-1/3"
        style={{ background: "hsl(263 90% 68% / 0.12)" }}
        animate={{ x: [0, 15, -10, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ambient-orb w-[80px] h-[80px] top-2/3 right-1/3"
        style={{ background: "hsl(180 85% 58% / 0.15)" }}
        animate={{ x: [0, -10, 5, 0], y: [0, 15, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Noise overlay for texture */}
      <div
        className="fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />
    </div>
  );
};

export default AmbientBackground;
