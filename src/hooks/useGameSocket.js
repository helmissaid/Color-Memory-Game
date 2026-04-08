import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const socket = io();

export const useGameSocket = () => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [highScores, setHighScores] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on('room_created', (newRoom) => {
      setRoom(newRoom);
      setPlayers(newRoom.players);
      setCurrentPlayer(newRoom.players[0]);
    });

    socket.on('room_joined', (joinedRoom) => {
      setRoom(joinedRoom);
      setPlayers(joinedRoom.players);
      const me = joinedRoom.players.find(p => p.id === socket.id);
      setCurrentPlayer(me);
    });

    socket.on('room_updated', (updatedRoom) => {
      setRoom(updatedRoom);
      setPlayers(updatedRoom.players);
      const me = updatedRoom.players.find(p => p.id === socket.id);
      if (me) setCurrentPlayer(me);
    });

    socket.on('high_scores_updated', (scores) => {
      setHighScores(scores);
    });

    socket.on('error', (msg) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('room_updated');
      socket.off('high_scores_updated');
      socket.off('error');
    };
  }, []);

  const createRoom = useCallback((playerName) => {
    socket.emit('create_room', { playerName });
  }, []);

  const joinRoom = useCallback((playerName, roomCode) => {
    socket.emit('join_room', { playerName, roomCode });
  }, []);

  const startGame = useCallback(() => {
    if (room) {
      socket.emit('start_game', { roomCode: room.code });
    }
  }, [room]);

  const submitGuess = useCallback((h, s, b) => {
    if (room) {
      socket.emit('submit_guess', { roomCode: room.code, h, s, b });
    }
  }, [room]);

  const getHighScores = useCallback(() => {
    socket.emit('get_high_scores');
  }, []);

  const resetGame = useCallback(() => {
    setRoom(null);
    setPlayers([]);
    setCurrentPlayer(null);
    // Optionally disconnect and reconnect or just refresh
    window.location.href = '/';
  }, []);

  return {
    room,
    players,
    currentPlayer,
    highScores,
    error,
    createRoom,
    joinRoom,
    startGame,
    submitGuess,
    getHighScores,
    resetGame
  };
};
