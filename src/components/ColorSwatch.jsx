import React from 'react';

/**
 * ColorSwatch component to display a color based on HSB values.
 * 
 * @param {Object} props
 * @param {number} props.h - Hue (0-360)
 * @param {number} props.s - Saturation (0-100)
 * @param {number} props.b - Brightness (0-100)
 * @param {string} [props.size='md'] - 'sm', 'md', 'lg', 'full'
 * @param {string} [props.label] - Optional label below the swatch
 * @param {string} [props.className] - Optional additional Tailwind classes
 */
const ColorSwatch = ({ h, s, b, size = 'md', label, className = '' }) => {
  // Convert HSB (HSV) to HSL for CSS representation
  // L = V * (1 - S / 2)
  // S_hsl = (L === 0 || L === 1) ? 0 : (V - L) / Math.min(L, 1 - L)
  const v = b / 100;
  const s_hsb = s / 100;
  
  const l_hsl = v * (1 - s_hsb / 2);
  const s_hsl = (l_hsl === 0 || l_hsl === 1) 
    ? 0 
    : (v - l_hsl) / Math.min(l_hsl, 1 - l_hsl);
  
  const backgroundColor = `hsl(${h}, ${s_hsl * 100}%, ${l_hsl * 100}%)`;

  const sizeMap = {
    sm: 'w-[60px] h-[60px]',
    md: 'w-[120px] h-[120px]',
    lg: 'w-[200px] h-[200px]',
    full: 'w-full h-full'
  };

  const containerClasses = size === 'full' 
    ? 'w-full h-full flex flex-col' 
    : 'inline-flex flex-col items-center gap-2';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div 
        className={`${sizeMap[size] || sizeMap.md} rounded-2xl shadow-xl transition-all duration-500 ease-out border border-white/10`}
        style={{ backgroundColor }}
      />
      {label && (
        <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-widest mt-1">
          {label}
        </span>
      )}
    </div>
  );
};

export default ColorSwatch;
