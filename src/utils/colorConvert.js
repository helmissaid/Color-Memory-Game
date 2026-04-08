/**
 * Color conversion utilities for the Color Memory game.
 * Converts between HSB, RGB, XYZ, and CIELAB color spaces.
 */

/**
 * Converts HSB color to RGB.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} b - Brightness (0-100)
 * @returns {Object} { r, g, b } (0-255)
 */
export function hsbToRgb(h, s, b) {
  s /= 100;
  b /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return {
    r: Math.round(255 * f(5)),
    g: Math.round(255 * f(3)),
    b: Math.round(255 * f(1)),
  };
}

/**
 * Converts RGB color to XYZ.
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Object} { x, y, z }
 */
export function rgbToXyz(r, g, b) {
  let _r = r / 255;
  let _g = g / 255;
  let _b = b / 255;

  // sRGB gamma correction
  _r = _r > 0.04045 ? Math.pow((_r + 0.055) / 1.055, 2.4) : _r / 12.92;
  _g = _g > 0.04045 ? Math.pow((_g + 0.055) / 1.055, 2.4) : _g / 12.92;
  _b = _b > 0.04045 ? Math.pow((_b + 0.055) / 1.055, 2.4) : _b / 12.92;

  _r *= 100;
  _g *= 100;
  _b *= 100;

  // Observer = 2°, Illuminant = D65
  const x = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
  const y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
  const z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;

  return { x, y, z };
}

/**
 * Converts XYZ color to CIELAB.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Object} { l, a, b }
 */
export function xyzToLab(x, y, z) {
  // Reference white D65
  const xn = 95.047;
  const yn = 100.000;
  const zn = 108.883;

  let _x = x / xn;
  let _y = y / yn;
  let _z = z / zn;

  const f = (t) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);

  _x = f(_x);
  _y = f(_y);
  _z = f(_z);

  const l = 116 * _y - 16;
  const a = 500 * (_x - _y);
  const b = 200 * (_y - _z);

  return { l, a, b };
}

/**
 * Convenience function to convert HSB directly to CIELAB.
 * @param {number} h
 * @param {number} s
 * @param {number} b
 * @returns {Object} { l, a, b }
 */
export function hsbToLab(h, s, b) {
  const rgb = hsbToRgb(h, s, b);
  const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}
