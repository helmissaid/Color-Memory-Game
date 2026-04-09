import React, { useState } from 'react';

/**
 * Leaderboard component to display game results and all-time high scores.
 * 
 * @param {Object} props
 * @param {Array} props.players - [{id, name, total_score}] sorted by score
 * @param {Array} props.allTime - [{id, player_name, total_score, played_at}] top 20
 * @param {string} props.currentPlayerId - ID of the local player for highlighting
 */
const Leaderboard = ({ players = [], allTime = [], currentPlayerId }) => {
  const [activeTab, setActiveTab] = useState('this-game');

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl">
      {/* Tabs */}
      <div className="flex p-2 bg-gray-50 gap-2">
        <button
          onClick={() => setActiveTab('this-game')}
          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'this-game'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
          }`}
        >
          This Game
        </button>
        <button
          onClick={() => setActiveTab('all-time')}
          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'all-time'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {activeTab === 'this-game' ? (
            players.length > 0 ? (
              players.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-2`}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-xl flex justify-center items-center font-bold">
                      {getRankIcon(index)}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-base font-bold ${player.id === currentPlayerId ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {player.name}
                        {player.id === currentPlayerId && <span className="ml-2 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">You</span>}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-black text-indigo-600">
                      {(player.total_score || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1 font-bold uppercase">/ 50</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 italic">No data available</div>
            )
          ) : (
            allTime.length > 0 ? (
              allTime.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-2`}
                  style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-sm font-mono font-bold text-gray-300">
                      #{index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {entry.player_name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formatDate(entry.played_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-black text-indigo-600">
                      {(entry.total_score || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 italic">Loading high scores...</div>
            )
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
