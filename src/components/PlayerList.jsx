import React from 'react';

/**
 * PlayerList component to display players in a room.
 * 
 * @param {Object} props
 * @param {Array} props.players - List of player objects: [{id, name, is_ready, total_score}]
 * @param {string} props.currentPlayerId - ID of the local player
 * @param {boolean} props.showScores - Whether to display total scores
 * @param {Array} props.submittedIds - List of player IDs who have submitted their answers
 */
const PlayerList = ({ players = [], currentPlayerId, showScores = false, submittedIds = [] }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
          Players <span className="text-indigo-600 ml-1">({players.length})</span>
        </h3>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {players.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-300 italic text-sm">
            Waiting for players to join...
          </div>
        ) : (
          players.map((player) => {
            const isMe = player.id === currentPlayerId;
            const hasSubmitted = submittedIds.includes(player.id);

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between px-6 py-4 transition-all duration-300 ${
                  isMe ? 'bg-indigo-50' : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className="relative">
                    <div className={`w-2.5 h-2.5 rounded-full ${player.is_ready ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'bg-gray-200'}`} />
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm tracking-wide ${isMe ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500 text-white rounded-md uppercase font-black tracking-tighter">
                        You
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Submission Status */}
                  {submittedIds.length > 0 && (
                    <div className="w-8 flex justify-center">
                      {hasSubmitted ? (
                        <span className="text-green-500 text-lg font-bold animate-in zoom-in duration-300">✓</span>
                      ) : (
                        <div className="flex gap-1">
                          <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Score */}
                  {showScores && (
                    <div className="text-right min-w-[40px]">
                      <span className="text-sm font-mono font-black text-indigo-600">
                        {player.total_score || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlayerList;
