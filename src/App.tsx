/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import MemorizeScreen from './screens/MemorizeScreen';
import GuessScreen from './screens/GuessScreen';
import RoundResultScreen from './screens/RoundResultScreen';
import FinalResultScreen from './screens/FinalResultScreen';

export default function App() {
  const {
    room,
    players,
    currentPlayer,
    highScores,
    error,
    createRoom,
    joinRoom,
    startGame,
    submitGuess,
    resetGame
  } = useGameSocket();

  // Error Toast
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

  if (!room) {
    return (
      <>
        {renderError()}
        <HomeScreen onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      </>
    );
  }

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
            roundNumber={room.round}
            totalRounds={room.total_rounds}
            onTimeUp={() => {}} // Handled by server timeout
          />
        );
      case 'guess':
        return (
          <GuessScreen
            roundNumber={room.round}
            totalRounds={room.total_rounds}
            players={players}
            currentPlayerId={currentPlayer?.id}
            submittedIds={room.submitted_ids}
            onSubmit={(h, s, b) => submitGuess(h, s, b)}
            hasSubmitted={room.submitted_ids.includes(currentPlayer?.id)}
          />
        );
      case 'result':
        return (
          <RoundResultScreen
            roundNumber={room.round}
            totalRounds={room.total_rounds}
            targetColor={room.target_color}
            results={players.map(p => ({
              playerId: p.id,
              playerName: p.name,
              h: p.current_guess?.h || 0,
              s: p.current_guess?.s || 0,
              b: p.current_guess?.b || 0,
              roundScore: p.round_score || 0
            }))}
            currentPlayerId={currentPlayer?.id}
            onNext={() => {}} // Handled by server timeout
          />
        );
      case 'gameover':
        return (
          <FinalResultScreen
            players={players}
            answers={room.answers || []}
            allTimeLeaderboard={highScores}
            currentPlayerId={currentPlayer?.id}
            onPlayAgain={resetGame}
          />
        );
      default:
        return <div className="text-white">Unknown State</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {renderError()}
      {renderScreen()}
    </div>
  );
}

