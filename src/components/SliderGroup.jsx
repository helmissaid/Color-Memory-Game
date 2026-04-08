import React from 'react';

/**
 * SliderGroup component for selecting HSB color values.
 * 
 * @param {Object} props
 * @param {number} props.h - Hue (0-360)
 * @param {number} props.s - Saturation (0-100)
 * @param {number} props.b - Brightness (0-100)
 * @param {function} props.onChange - Callback function(h, s, b)
 * @param {boolean} props.disabled - Whether the sliders are disabled
 */
const SliderGroup = ({ h, s, b, onChange, disabled }) => {
  const handleHueChange = (e) => {
    onChange(parseInt(e.target.value), s, b);
  };

  const handleSatChange = (e) => {
    onChange(h, parseInt(e.target.value), b);
  };

  const handleBriChange = (e) => {
    onChange(h, s, parseInt(e.target.value));
  };

  // Common slider styles for the track
  const sliderBaseClass = "w-full h-3 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
  
  // Custom thumb styling via CSS-in-JS for cross-browser support with Tailwind classes
  const thumbStyles = `
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      background: white;
      border: 3px solid #1f2937;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    input[type=range]::-moz-range-thumb {
      width: 24px;
      height: 24px;
      background: white;
      border: 3px solid #1f2937;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
  `;

  return (
    <div className="w-full max-w-md space-y-8 p-6 bg-gray-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
      <style>{thumbStyles}</style>

      {/* Hue Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Hue</label>
          <span className="text-lg font-mono font-bold text-white">{h}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={h}
          onChange={handleHueChange}
          disabled={disabled}
          className={sliderBaseClass}
          style={{
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
          }}
        />
      </div>

      {/* Saturation Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Saturation</label>
          <span className="text-lg font-mono font-bold text-white">{s}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={s}
          onChange={handleSatChange}
          disabled={disabled}
          className={sliderBaseClass}
          style={{
            background: `linear-gradient(to right, hsl(${h}, 0%, 50%), hsl(${h}, 100%, 50%))`
          }}
        />
      </div>

      {/* Brightness Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Brightness</label>
          <span className="text-lg font-mono font-bold text-white">{b}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={b}
          onChange={handleBriChange}
          disabled={disabled}
          className={sliderBaseClass}
          style={{
            background: `linear-gradient(to right, #000, hsl(${h}, ${s}%, 50%))`
          }}
        />
      </div>
    </div>
  );
};

export default SliderGroup;
