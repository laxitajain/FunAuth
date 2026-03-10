import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { QrCode, Shield, CheckCircle2, XCircle, Upload, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import {
  xorScheme,
  overlayShares,
  imageDataToURL,
} from "@/lib/visualCrypto";

export default function QRAuthPage() {
  const [step, setStep] = useState<"generate" | "verify" | "result">("generate");
  const [qrImageData, setQrImageData] = useState<ImageData | null>(null);
  const [serverShare, setServerShare] = useState<ImageData | null>(null);
  const [serverShareURL, setServerShareURL] = useState<string | null>(null);
  const [userShareURL, setUserShareURL] = useState<string | null>(null);
  const [challengeQR, setChallengeQR] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  // Step 1: Generate a QR code secret and split it
  const generateChallenge = useCallback(async () => {
    const secret = `FUNAUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Generate QR code as canvas
    const qrDataURL = await QRCode.toDataURL(secret, {
      width: 200,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // Load QR into ImageData
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = qrDataURL;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    // Split using XOR scheme
    const result = xorScheme(imageData);

    setQrImageData(imageData);
    setServerShare(result.share1);
    setServerShareURL(imageDataToURL(result.share1));
    setUserShareURL(imageDataToURL(result.share2));
    setChallengeQR(qrDataURL);
    setStep("verify");
    setVerified(null);
  }, []);

  // Step 2: User uploads their share for verification
  const handleVerify = useCallback(async (file: File) => {
    if (!serverShare) return;

    // Load uploaded share
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const uploadedData = ctx.getImageData(0, 0, img.width, img.height);

        // Check dimensions match
        if (uploadedData.width !== serverShare.width || uploadedData.height !== serverShare.height) {
          setVerified(false);
          setStep("result");
          return;
        }

        // Overlay and check
        const reconstructed = overlayShares(serverShare, uploadedData, "xor");
        
        // Simple verification: compare reconstructed with original QR
        let matchPixels = 0;
        const total = reconstructed.data.length / 4;
        if (qrImageData) {
          for (let i = 0; i < reconstructed.data.length; i += 4) {
            const rGray = reconstructed.data[i];
            const oGray = qrImageData.data[i];
            if (Math.abs(rGray - oGray) < 30) matchPixels++;
          }
        }
        
        setVerified(matchPixels / total > 0.85);
        setStep("result");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [serverShare, qrImageData]);

  const reset = () => {
    setStep("generate");
    setQrImageData(null);
    setServerShare(null);
    setServerShareURL(null);
    setUserShareURL(null);
    setChallengeQR(null);
    setVerified(null);
  };

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl tracking-widest text-primary mb-2">
            QR AUTHENTICATION
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Challenge-response authentication using visual cryptography
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-12">
          {["GENERATE", "VERIFY", "RESULT"].map((s, i) => {
            const stepIdx = ["generate", "verify", "result"].indexOf(step);
            const active = i <= stepIdx;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`h-8 w-8 flex items-center justify-center border font-display text-xs ${
                  active ? "border-primary text-primary neon-border" : "border-border text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className={`font-display text-xs tracking-widest ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                  {s}
                </span>
                {i < 2 && <div className={`flex-1 h-px ${active ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Generate */}
        {step === "generate" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="cyber-panel p-12 max-w-lg mx-auto">
              <QrCode className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-lg tracking-widest text-foreground mb-4">
                GENERATE CHALLENGE
              </h2>
              <p className="font-mono text-xs text-muted-foreground mb-8 leading-relaxed">
                The server generates a secret QR code, splits it into two shares using XOR visual cryptography.
                Share 1 stays on the server, Share 2 is given to the user.
              </p>
              <button
                onClick={generateChallenge}
                className="px-10 py-3.5 rounded-full bg-transparent text-primary font-display text-base tracking-widest border-2 border-primary hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(320_100%_55%/0.3)] transition-all duration-300"
              >
                GENERATE SECRET
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Download & Verify */}
        {step === "verify" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="cyber-panel p-4 text-center">
                <span className="font-display text-xs tracking-widest text-muted-foreground mb-3 block">
                  ORIGINAL QR (SECRET)
                </span>
                {challengeQR && <img src={challengeQR} alt="QR" className="mx-auto border border-border" style={{ imageRendering: "pixelated" }} />}
              </div>
              <div className="cyber-panel p-4 text-center">
                <span className="font-display text-xs tracking-widest text-muted-foreground mb-3 block">
                  SERVER SHARE (KEPT)
                </span>
                {serverShareURL && <img src={serverShareURL} alt="Server Share" className="mx-auto border border-border" style={{ imageRendering: "pixelated" }} />}
              </div>
              <div className="cyber-panel p-4 text-center">
                <span className="font-display text-xs tracking-widest text-neon-cyan mb-3 block">
                  USER SHARE (DOWNLOAD)
                </span>
                {userShareURL && (
                  <>
                    <img src={userShareURL} alt="User Share" className="mx-auto border border-secondary mb-3" style={{ imageRendering: "pixelated" }} />
                    <a
                      href={userShareURL}
                      download="user_share.png"
                      className="inline-block px-5 py-2 rounded-full border-2 border-secondary text-secondary font-display text-xs tracking-widest hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_hsl(180_100%_50%/0.4)] transition-all duration-300"
                    >
                      DOWNLOAD SHARE
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="cyber-panel p-8 text-center max-w-lg mx-auto">
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-display text-sm tracking-widest text-foreground mb-4">
                UPLOAD YOUR SHARE TO AUTHENTICATE
              </h3>
              <label className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-primary bg-transparent text-primary font-display text-sm tracking-widest cursor-pointer hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(320_100%_55%/0.3)] transition-all duration-300">
                <Upload className="h-4 w-4" /> SELECT SHARE FILE
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleVerify(f);
                }} />
              </label>
            </div>
          </motion.div>
        )}

        {/* Step 3: Result */}
        {step === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="cyber-panel p-12 max-w-lg mx-auto">
              {verified ? (
                <>
                  <CheckCircle2 className="h-20 w-20 text-neon-cyan mx-auto mb-6" />
                  <h2 className="font-display text-2xl tracking-widest text-neon-cyan mb-4">
                    AUTHENTICATED
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    Visual cryptography verification successful. Access granted.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
                  <h2 className="font-display text-2xl tracking-widest text-destructive mb-4">
                    AUTH FAILED
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    Share verification failed. The uploaded share does not match.
                  </p>
                </>
              )}
              <button
                onClick={reset}
                className="mt-8 px-8 py-3 rounded-full font-display text-sm tracking-widest border-2 border-border text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_hsl(320_100%_55%/0.3)] transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" /> TRY AGAIN
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
