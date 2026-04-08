import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useGameSupabase = () => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [error, setError] = useState(null);
  const [playerId] = useState(() => {
    const saved = localStorage.getItem('color_memory_player_id');
    if (saved) return saved;
    const newId = Math.random().toString(36).substring(2, 15);
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
          // Fetch all players for this room when any player changes
          const { data, error: fetchError } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: true });

          if (data) {
            setPlayers(data);
            const me = data.find((p) => p.player_id === playerId);
            if (me) setCurrentPlayer(me);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, playerId]);

  const createRoom = useCallback(async (playerName) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert([
        { 
          code: roomCode, 
          status: 'lobby', 
          host_player_id: playerId,
          round: 0,
          total_rounds: 5
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
          room_id: roomData.id,
          player_id: playerId,
          name: playerName,
          total_score: 0
        }
      ]);

    if (playerError) {
      setError(playerError.message);
      return;
    }

    setRoom(roomData);
  }, [playerId]);

  const joinRoom = useCallback(async (playerName, roomCode) => {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single();

    if (roomError || !roomData) {
      setError('Room not found');
      return;
    }

    if (roomData.status !== 'lobby') {
      setError('Game already in progress');
      return;
    }

    const { error: playerError } = await supabase
      .from('players')
      .insert([
        {
          room_id: roomData.id,
          player_id: playerId,
          name: playerName,
          total_score: 0
        }
      ]);

    if (playerError) {
      setError(playerError.message);
      return;
    }

    setRoom(roomData);
    
    // Initial fetch of players
    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id);
    
    if (playersData) setPlayers(playersData);
  }, [playerId]);

  const startGame = useCallback(async () => {
    if (!room || room.host_player_id !== playerId) return;

    const targetColor = {
      h: Math.floor(Math.random() * 360),
      s: Math.floor(Math.random() * 100),
      b: Math.floor(Math.random() * 100)
    };

    await supabase
      .from('rooms')
      .update({ 
        status: 'memorize', 
        round: 1,
        target_color: targetColor
      })
      .eq('id', room.id);
  }, [room, playerId]);

  const submitGuess = useCallback(async (h, s, b, score) => {
    if (!room || !currentPlayer) return;

    // Update player's guess and score
    await supabase
      .from('players')
      .update({
        current_guess: { h, s, b },
        round_score: score,
        total_score: (currentPlayer.total_score || 0) + score
      })
      .eq('id', currentPlayer.id);

    // Check if all players submitted
    const { data: allPlayers } = await supabase
      .from('players')
      .select('current_guess')
      .eq('room_id', room.id);

    const allSubmitted = allPlayers.every(p => p.current_guess !== null);
    
    if (allSubmitted && room.host_player_id === playerId) {
      await supabase
        .from('rooms')
        .update({ status: 'result' })
        .eq('id', room.id);
    }
  }, [room, currentPlayer, playerId]);

  const resetGame = () => {
    setRoom(null);
    setPlayers([]);
    setCurrentPlayer(null);
    window.location.href = '/';
  };

  return {
    room,
    players,
    currentPlayer,
    error,
    createRoom,
    joinRoom,
    startGame,
    submitGuess,
    resetGame
  };
};
