import React, { useState } from 'react';
import VerticalColorPicker from '../components/VerticalColorPicker';
import Timer from '../components/Timer';
import PlayerList from '../components/PlayerList';

/**
 * GuessScreen - Where players try to recreate the memorized color.
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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col lg:flex-row font-sans">
      
      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col p-6 sm:p-10 relative">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8 max-w-2xl mx-auto w-full">
          <div className="space-y-1 animate-in slide-in-from-left duration-700">
            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
              Round {roundNumber} of {totalRounds}
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
              What was <span className="text-indigo-600">The Color?</span>
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

        {/* Vertical Picker Card */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="animate-in zoom-in duration-700 delay-300">
            <VerticalColorPicker
              h={h}
              s={s}
              b={b}
              onChange={handleSliderChange}
              disabled={hasSubmitted}
              roundNumber={roundNumber}
              totalRounds={totalRounds}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      {/* Sidebar - Player Status */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 p-6 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="mb-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
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
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">
              Tip: Trust your first instinct. The longer you wait, the more your memory fades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessScreen;
