import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Loader2, Lock } from "lucide-react";
import {
  naorShamir22,
  xorScheme,
  colorRGBSplit,
  loadImageFromFile,
  imageDataToURL,
  imageDataToBlob,
  type ShareResult,
  type ThresholdShareResult,
} from "@/lib/visualCrypto";

type Scheme = "naor-shamir" | "xor" | "color-rgb";

export default function GeneratePage() {
  const [scheme, setScheme] = useState<Scheme>("naor-shamir");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [result, setResult] = useState<ShareResult | null>(null);
  const [colorResult, setColorResult] = useState<ThresholdShareResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setProcessing(true);
    setResult(null);
    setColorResult(null);

    const imageData = await loadImageFromFile(file);
    setSourceImage(imageDataToURL(imageData));

    if (scheme === "naor-shamir") {
      setResult(naorShamir22(imageData));
    } else if (scheme === "xor") {
      setResult(xorScheme(imageData));
    } else {
      setColorResult(colorRGBSplit(imageData));
    }

    setProcessing(false);
  }, [scheme]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const downloadShare = async (imageData: ImageData, name: string) => {
    const blob = await imageDataToBlob(imageData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = result?.stats || colorResult?.stats;

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl tracking-widest text-primary mb-2">
            SHARE GENERATION
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Upload an image to split it into cryptographic shares
          </p>
        </motion.div>

        {/* Scheme Selection */}
        <div className="flex gap-2 mb-8">
          {([
            { id: "naor-shamir" as Scheme, label: "NAOR-SHAMIR (2,2)" },
            { id: "xor" as Scheme, label: "XOR COMPUTATIONAL" },
            { id: "color-rgb" as Scheme, label: "COLOR RGB SPLIT" },
          ]).map((s) => (
            <button
              key={s.id}
              onClick={() => { setScheme(s.id); setResult(null); setColorResult(null); }}
              className={`px-6 py-2.5 rounded-full font-display text-sm tracking-wider border-2 transition-all duration-300 ${
                scheme === s.id
                  ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_hsl(320_100%_55%/0.3)]"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Zone */}
          <div>
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`cyber-panel p-8 flex flex-col items-center justify-center min-h-[300px] cursor-pointer transition-all duration-300 ${
                dragOver ? "border-primary neon-border" : ""
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input id="file-input" type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
              {processing ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : sourceImage ? (
                <div className="text-center">
                  <img src={sourceImage} alt="Source" className="max-h-48 mx-auto mb-4 border border-border" />
                  <p className="font-mono text-xs text-muted-foreground">Click or drop to replace</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-primary mb-4" />
                  <p className="font-display text-sm tracking-widest text-foreground mb-2">DROP IMAGE HERE</p>
                  <p className="font-mono text-xs text-muted-foreground">or click to browse</p>
                </>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          {stats && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="cyber-panel p-6">
              <h3 className="font-display text-sm tracking-widest text-primary mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" /> CRYPTO STATS
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {[
                  ["Scheme", result?.scheme || colorResult?.scheme || ""],
                  ["Processing Time", `${stats.timeMs}ms`],
                  ["Memory Usage", `${(stats.memoryBytes / 1024).toFixed(1)} KB`],
                  ["Pixel Expansion", `${stats.pixelExpansion}x`],
                  ["Entropy (Share 1)", `${stats.entropyShare1} bits`],
                  ["Entropy (Share 2)", `${stats.entropyShare2} bits`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-neon-cyan">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Generated Shares */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h2 className="font-display text-lg tracking-widest text-primary mb-4">GENERATED SHARES</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { data: result.share1, name: "Share 1", label: "SHARE_01" },
                { data: result.share2, name: "Share 2", label: "SHARE_02" },
              ].map((share) => (
                <div key={share.name} className="cyber-panel p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-xs tracking-widest text-foreground">{share.label}</span>
                    <button
                      onClick={() => downloadShare(share.data, share.label.toLowerCase())}
                      className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-border text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_10px_hsl(320_100%_55%/0.3)] transition-all duration-300"
                    >
                      <Download className="h-3 w-3" /> DOWNLOAD
                    </button>
                  </div>
                  <img src={imageDataToURL(share.data)} alt={share.name} className="w-full border border-border" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {colorResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h2 className="font-display text-lg tracking-widest text-primary mb-4">RGB CHANNEL SHARES</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {colorResult.shares.map((share, i) => {
                const labels = ["RED_CHANNEL", "GREEN_CHANNEL", "BLUE_CHANNEL"];
                return (
                  <div key={i} className="cyber-panel p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-xs tracking-widest text-foreground">{labels[i]}</span>
                      <button
                        onClick={() => downloadShare(share, labels[i].toLowerCase())}
                        className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-border text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_10px_hsl(320_100%_55%/0.3)] transition-all duration-300"
                      >
                        <Download className="h-3 w-3" /> DL
                      </button>
                    </div>
                    <img src={imageDataToURL(share)} alt={labels[i]} className="w-full border border-border" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
