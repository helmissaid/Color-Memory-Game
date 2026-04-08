/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGameSupabase } from './hooks/useGameSupabase';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import MemorizeScreen from './screens/MemorizeScreen';
import GuessScreen from './screens/GuessScreen';
import RoundResultScreen from './screens/RoundResultScreen';
import FinalResultScreen from './screens/FinalResultScreen';
import { calculateScore } from './utils/scoring';

/**
 * App - Main Application Component
 * Handles routing between different game screens based on Supabase room status.
 * Completely free of Socket.io logic.
 */
export default function App() {
  const {
    room,
    players,
    currentPlayer,
    error,
    createRoom,
    joinRoom,
    startGame,
    submitGuess,
    resetGame
  } = useGameSupabase();

  // Error Toast for displaying database or logic errors
  const renderError = () => {
    if (!error) return null;
    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
        <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      </div>
    );
  };

  // If no room is active, show the Home Screen
  if (!room) {
    return (
      <div className="min-h-screen bg-[#050505]">
        {renderError()}
        <HomeScreen onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      </div>
    );
  }

  // Render the appropriate screen based on room status
  const renderScreen = () => {
    switch (room.status) {
      case 'lobby':
        return (
          <LobbyScreen
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            onStartGame={startGame}
          />
        );
      case 'memorize':
        return (
          <MemorizeScreen
            color={room.target_color}
            roundNumber={room.current_round}
            totalRounds={room.total_rounds}
            onTimeUp={() => {}} // Timeouts are handled by host or server-side logic
          />
        );
      case 'guess':
        return (
          <GuessScreen
            roundNumber={room.current_round}
            totalRounds={room.total_rounds}
            players={players}
            currentPlayerId={currentPlayer?.player_id}
            submittedIds={players.filter(p => p.current_guess).map(p => p.player_id)}
            onSubmit={(h, s, b) => {
              const score = calculateScore(
                room.target_color.h, room.target_color.s, room.target_color.b,
                h, s, b
              );
              submitGuess(h, s, b, score);
            }}
            hasSubmitted={!!currentPlayer?.current_guess}
          />
        );
      case 'result':
        return (
          <RoundResultScreen
            roundNumber={room.current_round}
            totalRounds={room.total_rounds}
            targetColor={room.target_color}
            results={players.map(p => ({
              playerId: p.player_id,
              playerName: p.name,
              h: p.current_guess?.h || 0,
              s: p.current_guess?.s || 0,
              b: p.current_guess?.b || 0,
              roundScore: p.round_score || 0
            }))}
            currentPlayerId={currentPlayer?.player_id}
            onNext={() => {}} 
          />
        );
      case 'gameover':
        return (
          <FinalResultScreen
            players={players}
            answers={[]} // History can be fetched from database if needed
            allTimeLeaderboard={[]} 
            currentPlayerId={currentPlayer?.player_id}
            onPlayAgain={resetGame}
          />
        );
      default:
        return (
          <div className="min-h-screen flex items-center justify-center text-white font-mono">
            Unknown State: {room.status}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {renderError()}
      {renderScreen()}
    </div>
  );
}
