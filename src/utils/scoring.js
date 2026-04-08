import { hsbToLab } from './colorConvert';

/**
 * Calculates the CIEDE2000 color difference between two CIELAB colors.
 * Implementation of the full CIEDE2000 formula.
 * @param {Object} lab1 - { l, a, b }
 * @param {Object} lab2 - { l, a, b }
 * @returns {number} The color difference (dE00)
 */
function ciede2000(lab1, lab2) {
  const L1 = lab1.l;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.l;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);

  const avgC = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = (Math.atan2(b1, a1p) * 180) / Math.PI + (Math.atan2(b1, a1p) < 0 ? 360 : 0);
  const h2p = (Math.atan2(b2, a2p) * 180) / Math.PI + (Math.atan2(b2, a2p) < 0 ? 360 : 0);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h2p - h1p) <= 180) {
      dhp = h2p - h1p;
    } else if (h2p - h1p > 180) {
      dhp = h2p - h1p - 360;
    } else if (h2p - h1p < -180) {
      dhp = h2p - h1p + 360;
    }
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2 * Math.PI) / 180);

  const avgLp = (L1 + L2) / 2;
  const avgCp = (C1p + C2p) / 2;

  let avghp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) {
      avghp = (h1p + h2p) / 2;
    } else if (h1p + h2p < 360) {
      avghp = (h1p + h2p + 360) / 2;
    } else if (h1p + h2p >= 360) {
      avghp = (h1p + h2p - 360) / 2;
    }
  }

  const T = 1 - 0.17 * Math.cos((avghp - 30) * Math.PI / 180) +
            0.24 * Math.cos((2 * avghp) * Math.PI / 180) +
            0.32 * Math.cos((3 * avghp + 6) * Math.PI / 180) -
            0.20 * Math.cos((4 * avghp - 63) * Math.PI / 180);

  const dTheta = 30 * Math.exp(-Math.pow((avghp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(avgLp - 50, 2)) / Math.sqrt(20 + Math.pow(avgLp - 50, 2));
  const SC = 1 + 0.045 * avgCp;
  const SH = 1 + 0.015 * avgCp * T;
  const RT = -Math.sin((2 * dTheta * Math.PI) / 180) * RC;

  const dE00 = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE00;
}

/**
 * Calculates the score for a round based on target and guess colors.
 * @returns {number} Score from 0 to 10.
 */
export function calculateScore(targetH, targetS, targetB, guessH, guessS, guessB) {
  const targetLab = hsbToLab(targetH, targetS, targetB);
  const guessLab = hsbToLab(guessH, guessS, guessB);

  const dE00 = ciede2000(targetLab, guessLab);

  // Base score calculation
  const baseScore = 10 / (1 + Math.pow(dE00 / 25.25, 1.55));

  // Hue adjustment
  const hueDiff = Math.min(Math.abs(targetH - guessH), 360 - Math.abs(targetH - guessH));
  const avgSat = (targetS + guessS) / 2;

  // Hue Recovery
  const hueAccuracy = Math.max(0, 1 - Math.pow(hueDiff / 25, 1.5));
  const satWeight = Math.min(1, avgSat / 30);
  const recovery = (10 - baseScore) * hueAccuracy * satWeight * 0.25;

  // Hue Penalty
  const huePenFactor = Math.max(0, (hueDiff - 30) / 150);
  const satWeightPen = Math.min(1, avgSat / 40);
  const penalty = baseScore * huePenFactor * satWeightPen * 0.15;

  const finalScore = Math.max(0, Math.min(10, baseScore + recovery - penalty));

  return parseFloat(finalScore.toFixed(2));
}
