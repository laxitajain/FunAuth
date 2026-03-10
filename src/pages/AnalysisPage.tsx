import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart3, Upload, Loader2 } from "lucide-react";
import {
  naorShamir22,
  xorScheme,
  colorRGBSplit,
  loadImageFromFile,
  imageDataToURL,
  type CryptoStats,
} from "@/lib/visualCrypto";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface SchemeResult {
  name: string;
  stats: CryptoStats;
  shareURL: string;
}

export default function AnalysisPage() {
  const [results, setResults] = useState<SchemeResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [sourceURL, setSourceURL] = useState<string | null>(null);

  const runAnalysis = useCallback(async (file: File) => {
    setProcessing(true);
    setResults([]);
    const imageData = await loadImageFromFile(file);
    setSourceURL(imageDataToURL(imageData));

    const ns = naorShamir22(imageData);
    const xor = xorScheme(imageData);
    const rgb = colorRGBSplit(imageData);

    setResults([
      { name: "Naor-Shamir (2,2)", stats: ns.stats, shareURL: imageDataToURL(ns.share1) },
      { name: "XOR Computational", stats: xor.stats, shareURL: imageDataToURL(xor.share1) },
      { name: "Color RGB Split", stats: rgb.stats, shareURL: imageDataToURL(rgb.shares[0]) },
    ]);
    setProcessing(false);
  }, []);

  const timeData = results.map((r) => ({ name: r.name.split(" ")[0], time: r.stats.timeMs }));
  const memData = results.map((r) => ({ name: r.name.split(" ")[0], memory: +(r.stats.memoryBytes / 1024).toFixed(1) }));
  const entropyData = results.map((r) => ({
    name: r.name.split(" ")[0],
    share1: r.stats.entropyShare1,
    share2: r.stats.entropyShare2,
  }));

  const radarData = results.length > 0 ? [
    { metric: "Speed", ...Object.fromEntries(results.map((r) => [r.name.split(" ")[0], Math.max(0, 100 - r.stats.timeMs * 10)])) },
    { metric: "Memory Eff.", ...Object.fromEntries(results.map((r) => [r.name.split(" ")[0], Math.max(0, 100 - r.stats.memoryBytes / 5000)])) },
    { metric: "Entropy S1", ...Object.fromEntries(results.map((r) => [r.name.split(" ")[0], r.stats.entropyShare1 * 12.5])) },
    { metric: "Entropy S2", ...Object.fromEntries(results.map((r) => [r.name.split(" ")[0], r.stats.entropyShare2 * 12.5])) },
    { metric: "No Expansion", ...Object.fromEntries(results.map((r) => [r.name.split(" ")[0], r.stats.pixelExpansion === 1 ? 100 : 25])) },
  ] : [];

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl tracking-widest text-primary mb-2">
            PERFORMANCE ANALYSIS
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Compare all visual cryptography schemes side-by-side
          </p>
        </motion.div>

        {/* Upload */}
        <label className="cyber-panel p-6 flex items-center justify-center gap-4 cursor-pointer hover:border-primary transition-colors mb-8 block text-center">
          {processing ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-primary" />
              <span className="font-display text-sm tracking-widest text-foreground">
                {sourceURL ? "RE-ANALYZE WITH NEW IMAGE" : "UPLOAD IMAGE TO ANALYZE"}
              </span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) runAnalysis(f);
          }} />
        </label>

        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Stats Table */}
            <div className="cyber-panel p-6 overflow-x-auto">
              <h3 className="font-display text-sm tracking-widest text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> COMPARISON TABLE
              </h3>
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground">Scheme</th>
                    <th className="text-right py-2 text-muted-foreground">Time (ms)</th>
                    <th className="text-right py-2 text-muted-foreground">Memory (KB)</th>
                    <th className="text-right py-2 text-muted-foreground">Pixel Exp.</th>
                    <th className="text-right py-2 text-muted-foreground">Entropy S1</th>
                    <th className="text-right py-2 text-muted-foreground">Entropy S2</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.name} className="border-b border-border/30">
                      <td className="py-2 text-foreground">{r.name}</td>
                      <td className="py-2 text-right text-neon-cyan">{r.stats.timeMs}</td>
                      <td className="py-2 text-right text-neon-cyan">{(r.stats.memoryBytes / 1024).toFixed(1)}</td>
                      <td className="py-2 text-right text-neon-cyan">{r.stats.pixelExpansion}x</td>
                      <td className="py-2 text-right text-neon-cyan">{r.stats.entropyShare1}</td>
                      <td className="py-2 text-right text-neon-cyan">{r.stats.entropyShare2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="cyber-panel p-6">
                <h3 className="font-display text-xs tracking-widest text-primary mb-4">PROCESSING TIME (ms)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(320 60% 25% / 0.3)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(280 30% 60%)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(280 30% 60%)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(270 40% 8%)", border: "1px solid hsl(320 60% 25%)", color: "hsl(300 100% 90%)", fontFamily: "Share Tech Mono" }} />
                    <Bar dataKey="time" fill="hsl(320 100% 55%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="cyber-panel p-6">
                <h3 className="font-display text-xs tracking-widest text-primary mb-4">MEMORY USAGE (KB)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={memData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(320 60% 25% / 0.3)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(280 30% 60%)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(280 30% 60%)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(270 40% 8%)", border: "1px solid hsl(320 60% 25%)", color: "hsl(300 100% 90%)", fontFamily: "Share Tech Mono" }} />
                    <Bar dataKey="memory" fill="hsl(180 100% 50%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="cyber-panel p-6">
                <h3 className="font-display text-xs tracking-widest text-primary mb-4">SHARE ENTROPY (bits)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={entropyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(320 60% 25% / 0.3)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(280 30% 60%)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(280 30% 60%)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(270 40% 8%)", border: "1px solid hsl(320 60% 25%)", color: "hsl(300 100% 90%)", fontFamily: "Share Tech Mono" }} />
                    <Bar dataKey="share1" fill="hsl(320 100% 55%)" name="Share 1" />
                    <Bar dataKey="share2" fill="hsl(280 100% 60%)" name="Share 2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="cyber-panel p-6">
                <h3 className="font-display text-xs tracking-widest text-primary mb-4">SCHEME COMPARISON RADAR</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(320 60% 25% / 0.3)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(280 30% 60%)", fontSize: 9 }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar name="Naor-Shamir" dataKey="Naor-Shamir" stroke="hsl(320 100% 55%)" fill="hsl(320 100% 55% / 0.2)" />
                    <Radar name="XOR" dataKey="XOR" stroke="hsl(180 100% 50%)" fill="hsl(180 100% 50% / 0.2)" />
                    <Radar name="Color" dataKey="Color" stroke="hsl(280 100% 60%)" fill="hsl(280 100% 60% / 0.2)" />
                    <Tooltip contentStyle={{ background: "hsl(270 40% 8%)", border: "1px solid hsl(320 60% 25%)", color: "hsl(300 100% 90%)", fontFamily: "Share Tech Mono" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Share Previews */}
            <div className="cyber-panel p-6">
              <h3 className="font-display text-xs tracking-widest text-primary mb-4">SHARE PREVIEWS (SHARE 1 FROM EACH SCHEME)</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {sourceURL && (
                  <div>
                    <span className="font-mono text-xs text-muted-foreground block mb-2">ORIGINAL</span>
                    <img src={sourceURL} alt="Original" className="w-full border border-border" />
                  </div>
                )}
                {results.map((r) => (
                  <div key={r.name}>
                    <span className="font-mono text-xs text-muted-foreground block mb-2">{r.name.split("(")[0].trim().toUpperCase()}</span>
                    <img src={r.shareURL} alt={r.name} className="w-full border border-border" style={{ imageRendering: "pixelated" }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
