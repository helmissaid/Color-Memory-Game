import React, { useState, useEffect } from 'react';

/**
 * HomeScreen - The entry point of the game.
 * Allows players to enter their name and either create or join a room.
 * 
 * @param {Object} props
 * @param {function} props.onCreateRoom - Callback when creating a new room.
 * @param {function} props.onJoinRoom - Callback when joining an existing room.
 */
const HomeScreen = ({ onCreateRoom, onJoinRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  // Handle auto-filling room code from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setRoomCode(room.toUpperCase());
    }
  }, []);

  const handleCreate = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && roomCode.length === 6) {
      onJoinRoom(playerName.trim(), roomCode.toUpperCase());
    }
  };

  const isNameValid = playerName.trim().length > 0;
  const isRoomCodeValid = roomCode.length === 6;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-12 animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase italic leading-none">
            Color <span className="text-indigo-600">Memory</span>
          </h1>
          <p className="text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
            How well can you remember colors?
          </p>
        </div>

        {/* Main Form Card */}
        <div className="space-y-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          
          {/* Player Name Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Your Identity
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              maxLength={20}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-bold text-lg shadow-sm"
            />
          </div>

          <div className="space-y-4">
            {/* Create Room Button */}
            <button
              disabled={!isNameValid}
              onClick={handleCreate}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-sm active:scale-[0.98]"
            >
              Create New Room
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Join Room Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Join with Code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="XXXXXX"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all font-mono font-black text-center tracking-[0.4em] text-lg shadow-sm"
                />
                <button
                  disabled={!isNameValid || !isRoomCodeValid}
                  onClick={handleJoin}
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed font-black px-8 rounded-2xl transition-all uppercase tracking-widest text-sm active:scale-[0.98]"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center pt-4">
          <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.3em]">
            Real-time Multiplayer • CIEDE2000 Accuracy
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
