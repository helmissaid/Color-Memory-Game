import React, { useState } from 'react';
import PlayerList from '../components/PlayerList';

/**
 * LobbyScreen - Waiting room before the game starts.
 * 
 * @param {Object} props
 * @param {Object} props.room - {id, code, status, host_player_id}
 * @param {Array} props.players - [{id, name, is_ready, total_score}]
 * @param {Object} props.currentPlayer - {id, name}
 * @param {function} props.onStartGame - Callback to start the game (host only)
 */
const LobbyScreen = ({ room, players = [], currentPlayer, onStartGame }) => {
  const [copied, setCopied] = useState(false);

  const isHost = currentPlayer?.id === room?.host_player_id;
  const canStart = players.length >= 2;

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', room.code);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Waiting Room</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Room <span className="text-indigo-500">{room?.code}</span>
          </h1>
          
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="group flex items-center gap-2 mx-auto px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300">
              {copied ? 'Copied to Clipboard!' : 'Invite Friends'}
            </span>
            {!copied && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Player List Component */}
        <PlayerList 
          players={players} 
          currentPlayerId={currentPlayer?.id} 
          showScores={false}
        />

        {/* Action Section */}
        <div className="pt-4 text-center space-y-6">
          {isHost ? (
            <div className="space-y-4">
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-10 disabled:cursor-not-allowed font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-sm active:scale-[0.98]"
              >
                Start Game
              </button>
              {!canStart && (
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest animate-pulse">
                  Waiting for more players to join...
                </p>
              )}
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center gap-4">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Waiting for host to start the game
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex justify-center pt-8">
          <div className="w-8 h-8 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
