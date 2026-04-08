import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const TOTAL_ROUNDS = 5;

// Deterministic color generation based on seed and round
const getTargetColor = (seed, round) => {
  const h = (seed * 137 + round * 97) % 360;
  const s = 70 + ((seed * 31 + round * 17) % 30); // 70-100
  const b = 60 + ((seed * 19 + round * 13) % 40); // 60-100
  return { h, s, b };
};

export const useGameSupabase = () => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [error, setError] = useState(null);
  const [localPlayerId] = useState(() => {
    const saved = localStorage.getItem('color_memory_player_id');
    // Validate if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (saved && uuidRegex.test(saved)) return saved;
    
    const newId = crypto.randomUUID();
    localStorage.setItem('color_memory_player_id', newId);
    return newId;
  });

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          setRoom(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: true });

          if (data) {
            setPlayers(data);
            const me = data.find((p) => p.id === localPlayerId);
            if (me) setCurrentPlayer(me);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from('answers')
            .select('*')
            .eq('room_id', room.id);
          if (data) setAnswers(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, localPlayerId]);

  const createRoom = useCallback(async (playerName) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const seed = Math.floor(Math.random() * 1000000);
    
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert([
        { 
          code: roomCode, 
          status: 'waiting', 
          host_player_id: localPlayerId,
          current_round: 0,
          seed: seed
        }
      ])
      .select()
      .single();

    if (roomError) {
      setError(roomError.message);
      return;
    }

    const { error: playerError } = await supabase
      .from('players')
      .insert([
        {
          id: localPlayerId,
          room_id: roomData.id,
          name: playerName,
          total_score: 0,
          is_ready: true
        }
      ]);

    if (playerError) {
      setError(playerError.message);
      return;
    }

    setRoom(roomData);
  }, [localPlayerId]);

  const joinRoom = useCallback(async (playerName, roomCode) => {
    // Correctly query by 'code' column, which is a string
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single();

    if (roomError || !roomData) {
      setError('Room not found');
      return;
    }

    if (roomData.status !== 'waiting') {
      setError('Game already in progress');
      return;
    }

    const { error: playerError } = await supabase
      .from('players')
      .insert([
        {
          id: localPlayerId,
          room_id: roomData.id,
          name: playerName,
          total_score: 0,
          is_ready: true
        }
      ]);

    if (playerError) {
      setError(playerError.message);
      return;
    }

    setRoom(roomData);
  }, [localPlayerId]);

  const startGame = useCallback(async () => {
    if (!room || room.host_player_id !== localPlayerId) return;

    await supabase
      .from('rooms')
      .update({ 
        status: 'playing', 
        current_round: 1
      })
      .eq('id', room.id);
  }, [room, localPlayerId]);

  const submitGuess = useCallback(async (h, s, b, score) => {
    if (!room || !currentPlayer) return;

    const target = getTargetColor(room.seed, room.current_round);

    // 1. Insert Answer
    const { error: ansError } = await supabase
      .from('answers')
      .insert([{
        player_id: localPlayerId,
        room_id: room.id,
        round_number: room.current_round,
        target_h: target.h,
        target_s: target.s,
        target_b: target.b,
        guess_h: h,
        guess_s: s,
        guess_b: b,
        round_score: score
      }]);

    if (ansError) {
      setError(ansError.message);
      return;
    }

    // 2. Update player's total score
    await supabase
      .from('players')
      .update({
        total_score: (currentPlayer.total_score || 0) + score
      })
      .eq('id', localPlayerId);

    // 3. Check if all players submitted for this round
    const { data: currentRoundAnswers } = await supabase
      .from('answers')
      .select('player_id')
      .eq('room_id', room.id)
      .eq('round_number', room.current_round);

    if (currentRoundAnswers?.length === players.length && room.host_player_id === localPlayerId) {
      // Host triggers next state logic (this is a simplified client-side trigger)
      // In a real app, you might use a 'round_status' or similar
    }
  }, [room, currentPlayer, players.length, localPlayerId]);

  const nextRound = useCallback(async () => {
    if (!room || room.host_player_id !== localPlayerId) return;

    if (room.current_round < TOTAL_ROUNDS) {
      await supabase
        .from('rooms')
        .update({ current_round: room.current_round + 1 })
        .eq('id', room.id);
    } else {
      await supabase
        .from('rooms')
        .update({ status: 'finished' })
        .eq('id', room.id);
      
      // Submit to leaderboard
      players.forEach(async (p) => {
        await supabase.from('leaderboard').insert([{
          player_name: p.name,
          total_score: p.total_score,
          room_id: room.id
        }]);
      });
    }
  }, [room, localPlayerId, players]);

  const resetGame = () => {
    setRoom(null);
    setPlayers([]);
    setAnswers([]);
    setCurrentPlayer(null);
    window.location.href = '/';
  };

  return {
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
  };
};
