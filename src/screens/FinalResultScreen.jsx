import React, { useState } from 'react';
import Leaderboard from '../components/Leaderboard';
import ColorSwatch from '../components/ColorSwatch';

/**
 * FinalResultScreen - Detailed game results with score breakdown.
 * 
 * @param {Object} props
 * @param {Array} props.players - [{id, name, total_score}]
 * @param {Array} props.answers - [{player_id, round_number, target_h, target_s, target_b, guess_h, guess_s, guess_b, round_score}]
 * @param {string} props.currentPlayerId - ID of the local player
 * @param {Array} props.allTimeLeaderboard - Top scores
 * @param {function} props.onPlayAgain - Callback to restart
 */
const FinalResultScreen = ({ 
  players = [], 
  answers = [], 
  currentPlayerId, 
  allTimeLeaderboard = [], 
  onPlayAgain 
}) => {
  const [expandedPlayerId, setExpandedPlayerId] = useState(currentPlayerId);
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleShare = () => {
    const me = players.find(p => p.id === currentPlayerId);
    const scoreText = `Color Memory 🎨\n${me?.name || 'Player'}: ${(me?.total_score || 0).toFixed(2)}/50\nPlay at ${window.location.origin}`;
    
    navigator.clipboard.writeText(scoreText);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-6 sm:p-10 font-sans overflow-y-auto">
      
      {/* Header */}
      <div className="w-full max-w-2xl text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top duration-1000">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-indigo-600">
          Game Over!
        </h1>
        <p className="text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
          The spectrum has been settled
        </p>
      </div>

      {/* Leaderboard Section */}
      <div className="w-full max-w-2xl mb-16 animate-in zoom-in duration-700 delay-300">
        <Leaderboard 
          players={players} 
          allTime={allTimeLeaderboard} 
          currentPlayerId={currentPlayerId} 
        />
      </div>

      {/* Score Breakdown Section */}
      <div className="w-full max-w-2xl space-y-6 mb-16">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Score Breakdown
          </h3>
          <span className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">Click a player to expand</span>
        </div>

        <div className="space-y-3">
          {players.map((player) => {
            const isExpanded = expandedPlayerId === player.id;
            const playerAnswers = answers.filter(a => a.player_id === player.id).sort((a, b) => a.round_number - b.round_number);

            return (
              <div 
                key={player.id} 
                className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                  isExpanded ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
              >
                {/* Accordion Header */}
                <button 
                  onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${player.id === currentPlayerId ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                    <span className={`font-bold ${player.id === currentPlayerId ? 'text-gray-900' : 'text-gray-400'}`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-black text-indigo-600">
                      {(player.total_score || 0).toFixed(2)}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-5 gap-2">
                      {playerAnswers.map((ans) => (
                        <div key={ans.round_number} className="space-y-3 p-3 bg-white rounded-2xl border border-gray-100 flex flex-col items-center shadow-sm">
                          <span className="text-[8px] font-black text-gray-300 uppercase">R{ans.round_number}</span>
                          <div className="flex flex-col gap-1">
                            <ColorSwatch h={ans.target_h} s={ans.target_s} b={ans.target_b} size="sm" className="scale-75" />
                            <ColorSwatch h={ans.guess_h} s={ans.guess_s} b={ans.guess_b} size="sm" className="scale-75" />
                          </div>
                          <span className="text-[10px] font-mono font-black text-indigo-600">
                            {ans.round_score.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md space-y-4 pb-20">
        <button
          onClick={handleShare}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-sm active:scale-[0.98]"
        >
          {shareFeedback ? 'Copied to Clipboard!' : 'Share Score'}
        </button>
        <button
          onClick={onPlayAgain}
          className="w-full bg-gray-900 text-white hover:bg-gray-800 font-black py-5 rounded-3xl transition-all shadow-2xl uppercase tracking-widest text-sm active:scale-[0.98]"
        >
          Play Again
        </button>
      </div>

      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default FinalResultScreen;
