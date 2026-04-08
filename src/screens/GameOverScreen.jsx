import React from 'react';
import Leaderboard from '../components/Leaderboard';

/**
 * GameOverScreen - Final screen showing the leaderboard and play again option.
 * 
 * @param {Object} props
 * @param {Array} props.players - Final game results: [{id, name, total_score}] sorted.
 * @param {Array} props.allTime - Top 20 all-time high scores.
 * @param {string} props.currentPlayerId - ID of the local player.
 * @param {function} props.onPlayAgain - Callback to return to home or lobby.
 */
const GameOverScreen = ({ players = [], allTime = [], currentPlayerId, onPlayAgain }) => {
  const winner = players[0];
  const isWinner = winner?.id === currentPlayerId;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 sm:p-10 font-sans overflow-y-auto">
      
      {/* Celebration / Header Section */}
      <div className="w-full max-w-2xl text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Tournament Ended</span>
        </div>
        
        {isWinner ? (
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-500">
              Champion!
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
              You dominated the spectrum
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase italic leading-none text-white/20">
              Game <span className="text-white">Over</span>
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
              Final Standings
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard Component */}
      <div className="w-full max-w-2xl mb-12 animate-in zoom-in fade-in duration-700 delay-300">
        <Leaderboard 
          players={players} 
          allTime={allTime} 
          currentPlayerId={currentPlayerId} 
        />
      </div>

      {/* Action Section */}
      <div className="w-full max-w-md space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
        <button
          onClick={onPlayAgain}
          className="w-full bg-white text-black hover:bg-gray-200 font-black py-5 rounded-3xl transition-all shadow-2xl uppercase tracking-widest text-sm active:scale-[0.98]"
        >
          Play Again
        </button>
        
        <div className="text-center">
          <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">
            Thanks for playing Color Memory
          </p>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default GameOverScreen;
