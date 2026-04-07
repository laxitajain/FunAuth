import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Lock, Key, BarChart3, QrCode } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { path: "/", label: "HOME", icon: QrCode },
  { path: "/generate", label: "GENERATE", icon: Lock },
  { path: "/overlay", label: "OVERLAY", icon: Key },
  { path: "/qr-auth", label: "QR AUTH", icon: QrCode },
  { path: "/analysis", label: "ANALYSIS", icon: BarChart3 },
];

export default function CyberNav() {
  const location = useLocation();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-lg"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center h-10 w-10 rounded-full shrink-0 overflow-hidden"
        >
          <img
            src={logo}
            alt="FunAuth logo"
            className="h-10 w-10 object-contain"
          />
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2 px-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 font-display text-base tracking-wider transition-all duration-300 rounded-full whitespace-nowrap ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Docs pill */}
        <Link
          to="/docs"
          className={`flex items-center gap-2 px-5 py-2 rounded-full border shrink-0 font-display text-sm tracking-wider transition-all duration-300 ${
            location.pathname === "/docs"
              ? "border-primary text-primary-foreground bg-primary/40"
              : "border-primary/40 bg-primary/20 text-primary hover:bg-primary/30"
          }`}
        >
          DOCS
        </Link>
      </motion.nav>
    </div>
  );
}
