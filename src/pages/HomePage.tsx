import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import cyberpunkBg from "@/assets/cyberpunk-bg.jpg";
import logo from "@/assets/logo.png";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={cyberpunkBg}
          alt="Cyberpunk cityscape"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-wider text-primary mb-4">
            FunAuth
          </h1>
          <p className="font-display text-lg md:text-xl tracking-[0.3em] text-foreground/80 mb-2">
            VISUAL CRYPTOGRAPHY AUTHENTICATION
          </p>
          <p className="font-mono text-sm text-muted-foreground max-w-xl mx-auto mb-8">
            Secure image-based authentication using classical Naor-Shamir (2,2)
            visual cryptography, XOR computational schemes, and color RGB
            splitting.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/generate"
              className="px-10 py-3.5 rounded-full bg-transparent text-primary font-display text-base tracking-widest border-2 border-primary hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(320_100%_55%/0.3)] transition-all duration-300"
            >
              START ENCRYPTING
            </Link>
            <Link
              to="/qr-auth"
              className="px-10 py-3.5 rounded-full bg-transparent text-secondary font-display text-base tracking-widest border-2 border-secondary hover:bg-secondary/10 hover:shadow-[0_0_20px_hsl(180_100%_50%/0.3)] transition-all duration-300"
            >
              QR AUTH DEMO
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
