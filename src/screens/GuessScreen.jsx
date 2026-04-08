import React, { useState } from 'react';
import SliderGroup from '../components/SliderGroup';
import ColorSwatch from '../components/ColorSwatch';
import Timer from '../components/Timer';
import PlayerList from '../components/PlayerList';

/**
 * GuessScreen - Where players try to recreate the memorized color.
 * 
 * @param {Object} props
 * @param {number} props.roundNumber - Current round index.
 * @param {number} props.totalRounds - Total number of rounds.
 * @param {Array} props.players - List of players in the room.
 * @param {string} props.currentPlayerId - ID of the local player.
 * @param {Array} props.submittedIds - IDs of players who have submitted.
 * @param {function} props.onSubmit - Callback function(h, s, b) when submitting.
 * @param {boolean} props.hasSubmitted - Whether the local player has already submitted.
 */
const GuessScreen = ({ 
  roundNumber, 
  totalRounds, 
  players, 
  currentPlayerId, 
  submittedIds, 
  onSubmit, 
  hasSubmitted 
}) => {
  // Initial state for the sliders (neutral gray/blue)
  const [h, setH] = useState(200);
  const [s, setS] = useState(50);
  const [b, setB] = useState(50);

  const handleSliderChange = (newH, newS, newB) => {
    setH(newH);
    setS(newS);
    setB(newB);
  };

  const handleSubmit = () => {
    if (!hasSubmitted) {
      onSubmit(h, s, b);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row font-sans">
      
      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col p-6 sm:p-10 relative">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1 animate-in slide-in-from-left duration-700">
            <p className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.3em]">
              Round {roundNumber} of {totalRounds}
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
              What was <span className="text-indigo-500">The Color?</span>
            </h2>
          </div>
          
          <div className="animate-in zoom-in duration-500 delay-200">
            {!hasSubmitted && (
              <Timer 
                seconds={30} 
                onComplete={handleSubmit} 
                key={roundNumber} 
              />
            )}
          </div>
        </div>

        {/* Preview & Sliders */}
        <div className="flex-1 flex flex-col items-center justify-center gap-12 max-w-2xl mx-auto w-full">
          
          {/* Preview Swatch */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <ColorSwatch h={h} s={s} b={b} size="md" label="Your Guess" className="relative z-10" />
          </div>

          {/* Sliders */}
          <SliderGroup 
            h={h} 
            s={s} 
            b={b} 
            onChange={handleSliderChange} 
            disabled={hasSubmitted} 
          />

          {/* Submit Button */}
          <div className="w-full max-w-md pt-4">
            {hasSubmitted ? (
              <div className="w-full py-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                  Waiting for others...
                </p>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-sm active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                Submit Guess
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Player Status */}
      <div className="w-full lg:w-80 bg-black/40 border-t lg:border-t-0 lg:border-l border-white/5 p-6 backdrop-blur-xl flex flex-col">
        <div className="mb-6">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">
            Submission Status
          </h3>
          <PlayerList 
            players={players} 
            currentPlayerId={currentPlayerId} 
            showScores={false} 
            submittedIds={submittedIds}
          />
        </div>
        
        <div className="mt-auto hidden lg:block">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">
              Tip: Trust your first instinct. The longer you wait, the more your memory fades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessScreen;
