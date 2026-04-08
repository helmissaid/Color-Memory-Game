/**
 * Deterministic Pseudo-Random Number Generator using mulberry32.
 * Used to ensure all players in a game session see the same colors.
 */

/**
 * mulberry32 PRNG algorithm.
 * @param {number} a - The seed value.
 * @returns {function} A function that returns a random number between 0 and 1.
 */
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates 5 deterministic colors based on a seed.
 * @param {number} seed - The seed for the PRNG.
 * @returns {Array} Array of 5 color objects: [{h, s, b}, ...]
 */
export function generateColors(seed) {
  const rand = mulberry32(seed);
  const colors = [];

  for (let i = 0; i < 5; i++) {
    colors.push({
      // Hue: 0 - 360
      h: Math.floor(rand() * 361),
      // Saturation: 40 - 100
      s: Math.floor(rand() * 61) + 40,
      // Brightness: 30 - 90
      b: Math.floor(rand() * 61) + 30,
    });
  }

  return colors;
}
