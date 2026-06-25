import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Convert sRGB to linear RGB
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

// Convert linear RGB to XYZ (D65)
function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const z = lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041;

  return [x, y, z];
}

// Convert XYZ to OKLab
function xyzToOklab(x: number, y: number, z: number): [number, number, number] {
  // XYZ to LMS (corrected matrix from OKLab paper)
  const lmsX = x * 0.8189330101 + y * 0.3618667424 + z * -0.1288597137;
  const lmsY = x * 0.0329845436 + y * 0.9293118715 + z * 0.0361456387;
  const lmsZ = x * 0.0482003018 + y * 0.2643662691 + z * 0.633851707;

  // Linear to non-linear LMS
  const lmsL = Math.cbrt(lmsX);
  const lmsM = Math.cbrt(lmsY);
  const lmsS = Math.cbrt(lmsZ);

  // LMS to OKLab
  const L = lmsL * 0.2104542553 + lmsM * 0.793617785 + lmsS * -0.0040720468;
  const a = lmsL * 1.9779984951 + lmsM * -2.428592205 + lmsS * 0.4505937099;
  const b = lmsL * 0.0259040371 + lmsM * 0.7827717662 + lmsS * -0.8086757669;

  return [L, a, b];
}

// Convert OKLab to OKLCH
function oklabToOklch(
  L: number,
  a: number,
  b: number,
): [number, number, number] {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

/**
 * Convert a hex color string (e.g., "#8b5cf6") to an OKLCH CSS string
 * (e.g., "0.65 0.22 280").
 */
export function hexToOklch(hex: string): string {
  // Parse hex
  let clean = hex.trim();
  if (clean.startsWith("#")) clean = clean.slice(1);

  let r: number;
  let g: number;
  let b: number;
  if (clean.length === 3) {
    r = Number.parseInt(clean[0] + clean[0], 16);
    g = Number.parseInt(clean[1] + clean[1], 16);
    b = Number.parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = Number.parseInt(clean.slice(0, 2), 16);
    g = Number.parseInt(clean.slice(2, 4), 16);
    b = Number.parseInt(clean.slice(4, 6), 16);
  } else {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const [x, y, z] = rgbToXyz(r, g, b);
  const [L, a, bVal] = xyzToOklab(x, y, z);
  const [l, c, h] = oklabToOklch(L, a, bVal);

  // Use high precision to prevent color drift
  // Blue must stay Blue, Green must stay Green, etc.
  const lStr = l.toFixed(5);
  const cStr = c.toFixed(5);
  const hStr = h.toFixed(2);

  return `${lStr} ${cStr} ${hStr}`;
}
