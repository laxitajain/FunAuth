import { motion } from "framer-motion";
import { BookOpen, Lock, Eye, QrCode, BarChart3, Layers, Palette, Zap } from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "What is Visual Cryptography?",
    icon: BookOpen,
    content: `Visual cryptography is a cryptographic technique that encodes a secret image into multiple shares (transparencies), each of which appears as random noise. The secret can only be revealed when the correct combination of shares is physically overlaid — no computation required for the classical scheme.

This concept was introduced by Moni Naor and Adi Shamir in 1994. It provides information-theoretic security: each individual share reveals absolutely no information about the secret image, regardless of the computational power of an attacker.

FunAuth implements visual cryptography as an authentication mechanism. Instead of passwords, users authenticate by presenting their cryptographic share, which the server overlays with its own share to verify identity.`,
  },
  {
    id: "naor-shamir",
    title: "Naor-Shamir (2,2) Scheme",
    icon: Lock,
    content: `The classical (2,2) Visual Cryptography Scheme (VCS) by Naor and Shamir splits a secret binary image into exactly 2 shares. Each pixel of the original image is expanded into a 2×2 subpixel block in each share.

For a white pixel, both shares receive the same randomly chosen pattern (either diagonal or anti-diagonal). For a black pixel, the shares receive complementary patterns.

When overlaid (OR operation), white pixels produce blocks that are 50% black (two of four subpixels), while black pixels produce fully black blocks (all four subpixels). This contrast difference allows the human eye to perceive the secret.

Key properties:
• Perfect secrecy — each share individually is indistinguishable from random noise
• No computation needed — simple physical stacking reveals the secret
• Pixel expansion factor: 4× (each pixel becomes a 2×2 block)
• Contrast loss: the reconstructed image appears darker than the original`,
  },
  {
    id: "xor",
    title: "XOR-Based Computational Scheme",
    icon: Zap,
    content: `The XOR-based scheme is a computational visual cryptography approach that eliminates pixel expansion entirely. Share 1 is generated as pure random noise. Share 2 is computed as the XOR of Share 1 and the original secret image.

Reconstruction: Secret = Share1 ⊕ Share2

This scheme provides perfect secrecy (each share is uniformly random) and produces a perfect reconstruction of the original with no contrast loss. However, it requires digital computation — you cannot simply overlay transparencies physically.

Key properties:
• Perfect secrecy — shares are computationally indistinguishable from random
• No pixel expansion (1:1 ratio)
• Perfect reconstruction — no contrast loss
• Requires computation (XOR operation) to decode
• Works with grayscale and color images natively`,
  },
  {
    id: "color-rgb",
    title: "Color RGB Channel Splitting",
    icon: Palette,
    content: `Color Visual Cryptography extends the concept to full-color images by splitting the image into separate channel shares — one for Red, one for Green, and one for Blue.

Each share contains the true pixel values for its respective color channel, with random noise added to the other two channels. This makes each individual share appear as a noisy, color-shifted version of the image that doesn't clearly reveal the original.

Reconstruction is performed by taking the R channel from the red share, the G channel from the green share, and the B channel from the blue share, producing a faithful color reproduction.

Key properties:
• Preserves full color information
• No pixel expansion
• Each share has partial color information obscured by noise
• Requires all three shares for faithful reconstruction
• Noise level is configurable for security vs. visual quality tradeoff`,
  },
  {
    id: "overlay",
    title: "Share Overlay & Reconstruction",
    icon: Layers,
    content: `The overlay process is the core of visual cryptography verification. Depending on the scheme used, different operations are applied:

OR Overlay (Naor-Shamir): The shares are stacked, and for each subpixel, if either share has a black subpixel, the result is black. This simulates physically stacking printed transparencies.

XOR Overlay (Computational): Each pixel value is XORed between the two shares. This is a bitwise operation: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. It produces a perfect reconstruction.

RGB Merge: The respective color channels are extracted from each of the three shares and combined into a single output image.

In FunAuth's overlay tool, you upload previously generated shares and select the appropriate overlay mode to reconstruct the secret image.`,
  },
  {
    id: "qr-auth",
    title: "QR Code Authentication Flow",
    icon: QrCode,
    content: `FunAuth's QR authentication demonstrates a real-world application of visual cryptography for secure login:

1. Challenge Generation: The server generates a unique secret string and encodes it as a QR code. This QR code is then split into two shares using the XOR scheme.

2. Share Distribution: Share 1 (the server share) is stored securely on the server. Share 2 (the user share) is given to the user during registration — this acts as their authentication credential.

3. Authentication: When the user wants to authenticate, they upload their share. The server performs an XOR overlay of the user's share with its stored server share to reconstruct the QR code.

4. Verification: The reconstructed image is compared against the original QR code. If the pixel match rate exceeds a threshold (85%), authentication succeeds.

This approach is resistant to replay attacks (each challenge is unique) and the user's share alone reveals nothing about the secret.`,
  },
  {
    id: "analysis",
    title: "Performance Metrics",
    icon: BarChart3,
    content: `FunAuth provides detailed performance analysis comparing all three schemes across multiple metrics:

Processing Time: Measured in milliseconds, this captures how long each scheme takes to generate shares from the source image. Naor-Shamir is typically slower due to 2×2 expansion and pattern selection.

Memory Usage: Total bytes consumed by all generated shares. The Naor-Shamir scheme uses 4× more memory due to pixel expansion.

Pixel Expansion Rate: The ratio of output pixels to input pixels. Naor-Shamir has 4× expansion (each pixel becomes 2×2), while XOR and RGB maintain 1:1.

Shannon Entropy: Measures the randomness/information content of each share in bits. Higher entropy indicates more randomness, which correlates with better security. Ideally, shares should have maximum entropy (≈8 bits for 8-bit pixel values), indicating they appear as pure noise.

The radar chart provides a normalized comparison across speed, memory efficiency, entropy, and expansion characteristics.`,
  },
  {
    id: "security",
    title: "Security Considerations",
    icon: Eye,
    content: `Visual cryptography provides information-theoretic security for the (2,2) scheme — meaning that even with unlimited computational power, a single share reveals absolutely nothing about the secret image. This is mathematically provable, not based on computational hardness assumptions.

However, practical implementations should consider:

• Share management: If an attacker obtains both shares, the secret is trivially revealed. Shares must be stored and transmitted securely.

• Pixel expansion trade-off: The Naor-Shamir scheme's 4× expansion increases file sizes and may introduce artifacts when downscaled.

• Contrast degradation: The OR-based reconstruction loses contrast. The reconstructed image is always darker than the original.

• Channel leakage in RGB: The noise level in non-primary channels affects security. Lower noise = more visual information leaked per share.

• QR authentication threshold: The 85% match threshold balances false acceptance rate (FAR) and false rejection rate (FRR). This can be tuned based on security requirements.`,
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl tracking-widest text-primary mb-3">
            Documentation
          </h1>
          <p className="font-body text-lg text-muted-foreground">
            Theory, schemes, and implementation details behind FunAuth's visual cryptography system.
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-panel p-6 mb-12"
        >
          <h2 className="font-display text-sm tracking-widest text-primary mb-4">TABLE OF CONTENTS</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <span className="font-mono text-xs text-primary/60">{String(i + 1).padStart(2, "0")}</span>
                <s.icon className="h-4 w-4 text-primary/60" />
                <span className="font-body text-sm">{s.title}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s, i) => (
            <motion.section
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full border border-primary/30 bg-primary/10">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-mono text-xs text-primary/50">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="font-display text-xl tracking-wider text-foreground">{s.title}</h2>
              </div>
              <div className="cyber-panel p-6 ml-4 border-l-2 border-primary/20">
                {s.content.split("\n\n").map((paragraph, pi) => (
                  <p key={pi} className="font-body text-sm text-muted-foreground leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
