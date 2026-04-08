import React, { useState, useEffect } from 'react';
import ColorSwatch from '../components/ColorSwatch';
import Timer from '../components/Timer';

/**
 * MemorizeScreen - Displays the target color for the player to memorize.
 * 
 * @param {Object} props
 * @param {Object} props.color - {h, s, b} The color to memorize.
 * @param {number} props.roundNumber - Current round index.
 * @param {number} props.totalRounds - Total number of rounds.
 * @param {function} props.onTimeUp - Callback when the 5-second timer ends.
 */
const MemorizeScreen = ({ color, roundNumber, totalRounds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(5);

  // Local timer just to trigger visual effects in sync with the Timer component
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isEnding = timeLeft <= 2;

  return (
    <div className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col font-sans">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 sm:p-10 flex justify-between items-start pointer-events-none">
        <div className="space-y-1 animate-in slide-in-from-top duration-700">
          <p className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.3em]">
            Round {roundNumber} of {totalRounds}
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            Memorize <span className="text-indigo-500">This Color</span>
          </h2>
        </div>
        
        <div className="pointer-events-auto animate-in zoom-in duration-500 delay-200">
          <Timer seconds={5} onComplete={onTimeUp} key={roundNumber} />
        </div>
      </div>

      {/* Main Color Display Area */}
      <div className="flex-1 p-4 sm:p-10 pt-24 sm:pt-32 pb-20">
        <div 
          className={`w-full h-full rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden border-4 sm:border-8 transition-all duration-300 shadow-2xl ${
            isEnding 
              ? 'border-red-500/40 scale-[0.98] shadow-red-500/10 animate-pulse' 
              : 'border-white/5 scale-100 shadow-black/50'
          }`}
        >
          <ColorSwatch h={color.h} s={color.s} b={color.b} size="full" className="h-full" />
        </div>
      </div>

      {/* Bottom Hint Overlay */}
      <div className="absolute bottom-8 left-0 w-full text-center z-20 pointer-events-none">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
            Don't look away
          </p>
        </div>
      </div>

      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default MemorizeScreen;
