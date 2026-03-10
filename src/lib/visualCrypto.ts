// Visual Cryptography Engine - Client-side implementation
// Supports: (2,2) Naor-Shamir, XOR-based, Color RGB splitting

export interface ShareResult {
  share1: ImageData;
  share2: ImageData;
  width: number;
  height: number;
  scheme: string;
  stats: CryptoStats;
}

export interface ThresholdShareResult {
  shares: ImageData[];
  width: number;
  height: number;
  scheme: string;
  stats: CryptoStats;
}

export interface CryptoStats {
  timeMs: number;
  memoryBytes: number;
  pixelExpansion: number;
  entropyShare1: number;
  entropyShare2: number;
}

function calculateEntropy(imageData: ImageData): number {
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = Math.round(0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]);
    histogram[gray]++;
  }
  const total = imageData.data.length / 4;
  let entropy = 0;
  for (const count of histogram) {
    if (count > 0) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
  }
  return Math.round(entropy * 1000) / 1000;
}

// Naor-Shamir (2,2) Visual Cryptography - pixel expansion 2x2
export function naorShamir22(imageData: ImageData): ShareResult {
  const start = performance.now();
  const { width, height, data } = imageData;
  const newW = width * 2;
  const newH = height * 2;

  const share1Data = new Uint8ClampedArray(newW * newH * 4);
  const share2Data = new Uint8ClampedArray(newW * newH * 4);

  // Naor-Shamir basis matrices for (2,2)
  // White pixel: both shares get same pattern
  // Black pixel: shares get complementary patterns
  const patterns = [
    [[1, 0], [0, 1]], // pattern A
    [[0, 1], [1, 0]], // pattern B
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const isBlack = gray < 128;

      const patternIdx = Math.random() < 0.5 ? 0 : 1;
      const s1Pattern = patterns[patternIdx];
      const s2Pattern = isBlack ? patterns[1 - patternIdx] : patterns[patternIdx];

      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const newIdx = ((y * 2 + dy) * newW + (x * 2 + dx)) * 4;
          const val1 = s1Pattern[dy][dx] ? 0 : 255;
          const val2 = s2Pattern[dy][dx] ? 0 : 255;

          share1Data[newIdx] = share1Data[newIdx + 1] = share1Data[newIdx + 2] = val1;
          share1Data[newIdx + 3] = 255;
          share2Data[newIdx] = share2Data[newIdx + 1] = share2Data[newIdx + 2] = val2;
          share2Data[newIdx + 3] = 255;
        }
      }
    }
  }

  const share1 = new ImageData(share1Data, newW, newH);
  const share2 = new ImageData(share2Data, newW, newH);
  const timeMs = performance.now() - start;

  return {
    share1,
    share2,
    width: newW,
    height: newH,
    scheme: "Naor-Shamir (2,2)",
    stats: {
      timeMs: Math.round(timeMs * 100) / 100,
      memoryBytes: share1Data.byteLength + share2Data.byteLength,
      pixelExpansion: 4,
      entropyShare1: calculateEntropy(share1),
      entropyShare2: calculateEntropy(share2),
    },
  };
}

// XOR-based computational visual cryptography (no pixel expansion)
export function xorScheme(imageData: ImageData): ShareResult {
  const start = performance.now();
  const { width, height, data } = imageData;

  const share1Data = new Uint8ClampedArray(width * height * 4);
  const share2Data = new Uint8ClampedArray(width * height * 4);

  // Generate random share1, compute share2 = share1 XOR original
  for (let i = 0; i < data.length; i += 4) {
    const r1 = Math.random() < 0.5 ? 0 : 255;
    const g1 = Math.random() < 0.5 ? 0 : 255;
    const b1 = Math.random() < 0.5 ? 0 : 255;

    const gray = data[i] < 128 ? 0 : 255;

    share1Data[i] = r1;
    share1Data[i + 1] = g1;
    share1Data[i + 2] = b1;
    share1Data[i + 3] = 255;

    share2Data[i] = r1 ^ gray;
    share2Data[i + 1] = g1 ^ gray;
    share2Data[i + 2] = b1 ^ gray;
    share2Data[i + 3] = 255;
  }

  const share1 = new ImageData(share1Data, width, height);
  const share2 = new ImageData(share2Data, width, height);
  const timeMs = performance.now() - start;

  return {
    share1,
    share2,
    width,
    height,
    scheme: "XOR-Based",
    stats: {
      timeMs: Math.round(timeMs * 100) / 100,
      memoryBytes: share1Data.byteLength + share2Data.byteLength,
      pixelExpansion: 1,
      entropyShare1: calculateEntropy(share1),
      entropyShare2: calculateEntropy(share2),
    },
  };
}

// Color Visual Cryptography - RGB channel splitting
export function colorRGBSplit(imageData: ImageData): ThresholdShareResult {
  const start = performance.now();
  const { width, height, data } = imageData;

  const shareR = new Uint8ClampedArray(width * height * 4);
  const shareG = new Uint8ClampedArray(width * height * 4);
  const shareB = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    // Red channel share with noise
    const noiseR = Math.floor(Math.random() * 50);
    shareR[i] = data[i];
    shareR[i + 1] = noiseR;
    shareR[i + 2] = noiseR;
    shareR[i + 3] = 255;

    // Green channel share with noise
    const noiseG = Math.floor(Math.random() * 50);
    shareG[i] = noiseG;
    shareG[i + 1] = data[i + 1];
    shareG[i + 2] = noiseG;
    shareG[i + 3] = 255;

    // Blue channel share with noise
    const noiseB = Math.floor(Math.random() * 50);
    shareB[i] = noiseB;
    shareB[i + 1] = noiseB;
    shareB[i + 2] = data[i + 2];
    shareB[i + 3] = 255;
  }

  const shares = [
    new ImageData(shareR, width, height),
    new ImageData(shareG, width, height),
    new ImageData(shareB, width, height),
  ];
  const timeMs = performance.now() - start;

  return {
    shares,
    width,
    height,
    scheme: "Color RGB Split",
    stats: {
      timeMs: Math.round(timeMs * 100) / 100,
      memoryBytes: shareR.byteLength * 3,
      pixelExpansion: 1,
      entropyShare1: calculateEntropy(shares[0]),
      entropyShare2: calculateEntropy(shares[1]),
    },
  };
}

// Overlay two shares (OR operation for Naor-Shamir, XOR for computational)
export function overlayShares(
  share1: ImageData,
  share2: ImageData,
  mode: "or" | "xor" = "or"
): ImageData {
  const result = new Uint8ClampedArray(share1.data.length);
  for (let i = 0; i < share1.data.length; i += 4) {
    if (mode === "or") {
      // OR: if either pixel is black (0), result is black
      result[i] = Math.min(share1.data[i], share2.data[i]);
      result[i + 1] = Math.min(share1.data[i + 1], share2.data[i + 1]);
      result[i + 2] = Math.min(share1.data[i + 2], share2.data[i + 2]);
    } else {
      result[i] = share1.data[i] ^ share2.data[i];
      result[i + 1] = share1.data[i + 1] ^ share2.data[i + 1];
      result[i + 2] = share1.data[i + 2] ^ share2.data[i + 2];
    }
    result[i + 3] = 255;
  }
  return new ImageData(result, share1.width, share1.height);
}

// Overlay RGB shares
export function overlayRGBShares(shares: ImageData[]): ImageData {
  const result = new Uint8ClampedArray(shares[0].data.length);
  for (let i = 0; i < shares[0].data.length; i += 4) {
    result[i] = shares[0].data[i]; // R from red share
    result[i + 1] = shares[1].data[i + 1]; // G from green share
    result[i + 2] = shares[2].data[i + 2]; // B from blue share
    result[i + 3] = 255;
  }
  return new ImageData(result, shares[0].width, shares[0].height);
}

// Load image from file to ImageData
export function loadImageFromFile(file: File, maxDim = 256): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (maxDim > 0 && (w > maxDim || h > maxDim)) {
          const scale = maxDim / Math.max(w, h);
          w = Math.floor(w * scale);
          h = Math.floor(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(ctx.getImageData(0, 0, w, h));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert ImageData to data URL
export function imageDataToURL(imageData: ImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

// Convert ImageData to Blob for download
export function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}
