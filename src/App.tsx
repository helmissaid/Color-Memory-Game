/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
 * Strictly follows the provided database schema.
 * No Socket.io.
 */
export default function App() {
  const {
    room,
    players,
    answers,
    currentPlayer,
    error,
    createRoom,
    joinRoom,
    startGame,
    submitGuess,
    nextRound,
    resetGame,
    TOTAL_ROUNDS,
    getTargetColor
  } = useGameSupabase();

  const [phase, setPhase] = useState('memorize'); // 'memorize' | 'guess' | 'result'

  // Sync phase based on room status and answers
  useEffect(() => {
    if (!room || room.status !== 'playing') return;

    const currentRoundAnswers = answers.filter(a => a.round_number === room.current_round);
    const allSubmitted = currentRoundAnswers.length === players.length && players.length > 0;

    if (allSubmitted) {
      setPhase('result');
    } else {
      // If we just entered a new round, start with memorize
      setPhase('memorize');
    }
  }, [room?.current_round, room?.status, answers, players.length]);

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
      <div className="min-h-screen bg-[#050505]">
        {renderError()}
        <HomeScreen onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      </div>
    );
  }

  const renderScreen = () => {
    const targetColor = room.seed ? getTargetColor(room.seed, room.current_round) : { h: 0, s: 0, b: 0 };
    const currentRoundAnswers = answers.filter(a => a.round_number === room.current_round);
    const hasSubmitted = currentRoundAnswers.some(a => a.player_id === currentPlayer?.id);

    switch (room.status) {
      case 'waiting':
        return (
          <LobbyScreen
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            onStartGame={startGame}
          />
        );
      case 'playing':
        if (phase === 'memorize') {
          return (
            <MemorizeScreen
              color={targetColor}
              roundNumber={room.current_round}
              totalRounds={TOTAL_ROUNDS}
              onTimeUp={() => setPhase('guess')}
            />
          );
        }
        if (phase === 'guess') {
          return (
            <GuessScreen
              roundNumber={room.current_round}
              totalRounds={TOTAL_ROUNDS}
              players={players}
              currentPlayerId={currentPlayer?.id}
              submittedIds={currentRoundAnswers.map(a => a.player_id)}
              onSubmit={(h, s, b) => {
                const score = calculateScore(
                  targetColor.h, targetColor.s, targetColor.b,
                  h, s, b
                );
                submitGuess(h, s, b, score);
              }}
              hasSubmitted={hasSubmitted}
            />
          );
        }
        if (phase === 'result') {
          return (
            <RoundResultScreen
              roundNumber={room.current_round}
              totalRounds={TOTAL_ROUNDS}
              targetColor={targetColor}
              results={currentRoundAnswers.map(a => {
                const p = players.find(player => player.id === a.player_id);
                return {
                  playerId: a.player_id,
                  playerName: p?.name || 'Unknown',
                  h: a.guess_h,
                  s: a.guess_s,
                  b: a.guess_b,
                  roundScore: a.round_score
                };
              })}
              currentPlayerId={currentPlayer?.id}
              onNext={nextRound} 
            />
          );
        }
        return null;
      case 'finished':
        return (
          <FinalResultScreen
            players={players}
            answers={answers}
            allTimeLeaderboard={[]} // Can be fetched separately if needed
            currentPlayerId={currentPlayer?.id}
            onPlayAgain={resetGame}
          />
        );
      default:
        return <div className="text-white">Unknown State: {room.status}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {renderError()}
      {renderScreen()}
    </div>
  );
}
