import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Layers, Upload } from "lucide-react";
import {
  overlayShares,
  overlayRGBShares,
  loadImageFromFile,
  imageDataToURL,
} from "@/lib/visualCrypto";

export default function OverlayPage() {
  const [shares, setShares] = useState<ImageData[]>([]);
  const [shareURLs, setShareURLs] = useState<string[]>([]);
  const [overlayURL, setOverlayURL] = useState<string | null>(null);
  const [mode, setMode] = useState<"or" | "xor" | "rgb">("or");

  const addShare = useCallback(async (file: File) => {
    const data = await loadImageFromFile(file, 0); // No scaling — preserve original share dimensions
    setShares((prev) => [...prev, data]);
    setShareURLs((prev) => [...prev, imageDataToURL(data)]);
    setOverlayURL(null);
  }, []);

  const doOverlay = useCallback(() => {
    if (mode === "rgb" && shares.length >= 3) {
      const result = overlayRGBShares(shares.slice(0, 3));
      setOverlayURL(imageDataToURL(result));
    } else if (shares.length >= 2) {
      const result = overlayShares(shares[0], shares[1], mode as "or" | "xor");
      setOverlayURL(imageDataToURL(result));
    }
  }, [shares, mode]);

  const reset = () => {
    setShares([]);
    setShareURLs([]);
    setOverlayURL(null);
  };

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl tracking-widest text-primary mb-2">
            OVERLAY PREVIEW
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Upload shares and overlay them to reconstruct the secret
          </p>
        </motion.div>

        {/* Mode */}
        <div className="flex gap-2 mb-8">
          {([
            { id: "or" as const, label: "OR (NAOR-SHAMIR)" },
            { id: "xor" as const, label: "XOR (COMPUTATIONAL)" },
            { id: "rgb" as const, label: "RGB MERGE" },
          ]).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-6 py-2.5 rounded-full font-display text-sm tracking-wider border-2 transition-all duration-300 ${
                mode === m.id
                  ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_hsl(320_100%_55%/0.3)]"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Shares */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm tracking-widest text-foreground">
                LOADED SHARES ({shares.length})
              </h3>
              {shares.length > 0 && (
                <button onClick={reset} className="font-mono text-xs text-muted-foreground hover:text-primary">
                  RESET
                </button>
              )}
            </div>

            {shareURLs.map((url, i) => (
              <div key={i} className="cyber-panel p-3">
                <span className="font-display text-xs tracking-widest text-muted-foreground mb-2 block">
                  SHARE_{String(i + 1).padStart(2, "0")}
                </span>
                <img src={url} alt={`Share ${i + 1}`} className="w-full border border-border" />
              </div>
            ))}

            <label className="cyber-panel p-6 flex flex-col items-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="h-8 w-8 text-primary mb-2" />
              <span className="font-display text-xs tracking-widest text-foreground">ADD SHARE</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) addShare(f);
                e.target.value = "";
              }} />
            </label>
          </div>

          {/* Overlay Result */}
          <div>
            <button
              onClick={doOverlay}
              disabled={shares.length < 2}
              className={`w-full mb-4 px-6 py-3.5 rounded-full font-display text-base tracking-widest border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                shares.length >= 2
                  ? "border-primary text-primary bg-transparent hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(320_100%_55%/0.3)]"
                  : "border-border text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Layers className="h-4 w-4" /> OVERLAY SHARES
            </button>

            {overlayURL && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="cyber-panel p-4">
                <span className="font-display text-xs tracking-widest text-neon-cyan mb-3 block">
                  RECONSTRUCTED SECRET
                </span>
                <img src={overlayURL} alt="Reconstructed" className="w-full border border-secondary" />
              </motion.div>
            )}

            {!overlayURL && shares.length < 2 && (
              <div className="cyber-panel p-12 flex flex-col items-center justify-center text-center">
                <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-mono text-xs text-muted-foreground">
                  Upload at least 2 shares to overlay
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
