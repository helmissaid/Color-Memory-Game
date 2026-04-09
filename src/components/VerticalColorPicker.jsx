import React from 'react';

/**
 * VerticalColorPicker - A minimalist color picker inspired by the provided design.
 * 
 * @param {Object} props
 * @param {number} props.h - Hue (0-360)
 * @param {number} props.s - Saturation (0-100)
 * @param {number} props.b - Brightness (0-100)
 * @param {function} props.onChange - Callback function(h, s, b)
 * @param {boolean} props.disabled - Whether the picker is disabled
 * @param {number} props.roundNumber - Current round
 * @param {number} props.totalRounds - Total rounds
 * @param {function} props.onSubmit - Callback for submission
 */
const VerticalColorPicker = ({ h, s, b, onChange, disabled, roundNumber, totalRounds, onSubmit }) => {
  const handleHueChange = (e) => {
    onChange(parseInt(e.target.value), s, b);
  };

  const handleSatChange = (e) => {
    onChange(h, parseInt(e.target.value), b);
  };

  const handleBriChange = (e) => {
    onChange(h, s, parseInt(e.target.value));
  };

  const sliderContainerStyle = "relative w-8 h-full rounded-full overflow-hidden flex flex-col items-center justify-center";
  const sliderInputStyle = "absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20";
  
  // Custom thumb indicator
  const Thumb = ({ value, max = 100 }) => {
    const percentage = (value / max) * 100;
    return (
      <div 
        className="absolute w-4 h-4 bg-white rounded-full shadow-md border border-gray-200 pointer-events-none z-10"
        style={{ top: `calc(${percentage}% - 8px)` }}
      />
    );
  };

  return (
    <div className="w-full max-w-2xl aspect-[4/3] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex">
      {/* Sliders Section */}
      <div className="flex gap-2 p-4 bg-gray-50/50">
        {/* Hue Slider */}
        <div className={sliderContainerStyle} style={{ background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}>
          <input
            type="range"
            min="0"
            max="360"
            value={h}
            onChange={handleHueChange}
            disabled={disabled}
            className={sliderInputStyle}
          />
          <Thumb value={h} max={360} />
        </div>

        {/* Saturation Slider */}
        <div className={sliderContainerStyle} style={{ background: `linear-gradient(to bottom, hsl(${h}, 100%, 50%), hsl(${h}, 0%, 50%))` }}>
          <input
            type="range"
            min="0"
            max="100"
            value={100 - s} // Invert because gradient is top to bottom (full color to gray)
            onChange={(e) => onChange(h, 100 - parseInt(e.target.value), b)}
            disabled={disabled}
            className={sliderInputStyle}
          />
          <Thumb value={100 - s} />
        </div>

        {/* Brightness Slider */}
        <div className={sliderContainerStyle} style={{ background: `linear-gradient(to bottom, hsl(${h}, ${s}%, 100%), #000)` }}>
          <input
            type="range"
            min="0"
            max="100"
            value={100 - b} // Invert because gradient is top to bottom (white to black)
            onChange={(e) => onChange(h, s, 100 - parseInt(e.target.value))}
            disabled={disabled}
            className={sliderInputStyle}
          />
          <Thumb value={100 - b} />
        </div>
      </div>

      {/* Preview Section */}
      <div 
        className="flex-1 relative transition-colors duration-200"
        style={{ backgroundColor: `hsl(${h}, ${s}%, ${b}%)` }}
      >
        {/* Top Info */}
        <div className="absolute top-6 left-8 right-8 flex justify-between items-start">
          <span className="text-white/80 font-bold text-sm drop-shadow-sm">
            {roundNumber}/{totalRounds}
          </span>
          <span className="text-white/80 font-black text-sm tracking-tighter drop-shadow-sm">
            ColorMemory.gg
          </span>
        </div>

        {/* Submit Button */}
        {!disabled && (
          <button
            onClick={onSubmit}
            className="absolute bottom-8 right-8 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-900 group-hover:text-indigo-600 transition-colors" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}

        {disabled && (
          <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Submitted</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerticalColorPicker;
