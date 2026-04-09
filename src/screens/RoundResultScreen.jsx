import React, { useState, useEffect } from 'react';
import ColorSwatch from '../components/ColorSwatch';

/**
 * RoundResultScreen - Displays the results of a single round.
 * 
 * @param {Object} props
 * @param {number} props.roundNumber - Current round index.
 * @param {number} props.totalRounds - Total number of rounds.
 * @param {Object} props.targetColor - {h, s, b} The correct color.
 * @param {Array} props.results - [{playerId, playerName, h, s, b, roundScore}]
 * @param {string} props.currentPlayerId - ID of the local player.
 * @param {function} props.onNext - Callback to proceed to the next round.
 */
const RoundResultScreen = ({ 
  roundNumber, 
  totalRounds, 
  targetColor, 
  results = [], 
  currentPlayerId, 
  onNext 
}) => {
  const [countdown, setCountdown] = useState(5);

  // Sort results by score descending
  const sortedResults = [...results].sort((a, b) => (b.roundScore || 0) - (a.roundScore || 0));

  useEffect(() => {
    if (countdown <= 0) {
      onNext();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onNext]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-6 sm:p-10 font-sans overflow-y-auto">
      
      {/* Header Section */}
      <div className="w-full max-w-2xl text-center space-y-2 mb-12 animate-in fade-in slide-in-from-top duration-700">
        <p className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-[0.4em]">
          Round {roundNumber} of {totalRounds}
        </p>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-none">
          Round <span className="text-gray-100">Result</span>
        </h1>
      </div>

      {/* Target Color Display */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 mb-16 animate-in zoom-in duration-1000 delay-200">
        <div className="relative group">
          <div className="absolute -inset-6 bg-gray-50 rounded-[3rem] blur-3xl opacity-50" />
          <ColorSwatch 
            h={targetColor.h} 
            s={targetColor.s} 
            b={targetColor.b} 
            size="md" 
            label="Target Color" 
            className="relative z-10"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="w-full max-w-2xl space-y-4 mb-12">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2">
          Player Performance
        </h3>
        <div className="space-y-3">
          {sortedResults.map((result, index) => {
            const isMe = result.playerId === currentPlayerId;
            return (
              <div
                key={result.playerId}
                className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
                  isMe 
                    ? 'bg-indigo-50 border-indigo-100 shadow-sm' 
                    : 'bg-gray-50 border-gray-100'
                }`}
                style={{ animationDelay: `${400 + index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-sm font-mono font-black text-gray-300">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <ColorSwatch h={result.h} s={result.s} b={result.b} size="sm" className="scale-75" />
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isMe ? 'text-gray-900' : 'text-gray-600'}`}>
                        {result.playerName}
                        {isMe && <span className="ml-2 text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">You</span>}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Guess
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-lg font-mono font-black ${result.roundScore > 8 ? 'text-green-600' : result.roundScore > 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {(result.roundScore || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-1 font-bold uppercase">/ 10</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Next Round Countdown */}
      <div className="mt-auto pt-8 pb-4 animate-in fade-in duration-1000 delay-1000">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i < (5 - countdown) ? 'bg-indigo-500 scale-125' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
            Next round in <span className="text-gray-900">{countdown}</span>...
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoundResultScreen;
