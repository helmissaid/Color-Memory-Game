import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { calculateScore } from './src/utils/scoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Game State Storage (In-memory)
  const rooms = new Map();
  const highScores = []; // [{ player_name, total_score, played_at }]
  // Structure: 
  // roomCode: {
  //   id: string,
  //   code: string,
  //   status: 'lobby' | 'memorize' | 'guess' | 'result' | 'gameover',
  //   host_player_id: string,
  //   players: [{ id, name, total_score, current_guess: {h,s,b}, round_score }],
  //   round: number,
  //   total_rounds: 5,
  //   target_color: {h,s,b},
  //   submitted_ids: []
  // }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', ({ playerName }) => {
      const code = generateRoomCode();
      const room = {
        id: code,
        code: code,
        status: 'lobby',
        host_player_id: socket.id,
        players: [{ id: socket.id, name: playerName, total_score: 0, is_ready: true }],
        round: 0,
        total_rounds: 5,
        target_color: null,
        submitted_ids: [],
        answers: []
      };
      rooms.set(code, room);
      socket.join(code);
      socket.emit('room_created', room);
      console.log(`Room created: ${code} by ${playerName}`);
    });

    socket.on('join_room', ({ playerName, roomCode }) => {
      const room = rooms.get(roomCode);
      if (room) {
        if (room.status !== 'lobby') {
          socket.emit('error', 'Game already in progress');
          return;
        }
        const player = { id: socket.id, name: playerName, total_score: 0, is_ready: true };
        room.players.push(player);
        socket.join(roomCode);
        io.to(roomCode).emit('room_updated', room);
        socket.emit('room_joined', room);
        socket.emit('high_scores_updated', highScores);
        console.log(`${playerName} joined room: ${roomCode}`);
      } else {
        socket.emit('error', 'Room not found');
      }
    });

    socket.on('get_high_scores', () => {
      socket.emit('high_scores_updated', highScores);
    });

    socket.on('start_game', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (room && room.host_player_id === socket.id) {
        room.round = 1;
        startRound(roomCode);
      }
    });

    socket.on('submit_guess', ({ roomCode, h, s, b }) => {
      const room = rooms.get(roomCode);
      if (room && room.status === 'guess') {
        const player = room.players.find(p => p.id === socket.id);
        if (player && !room.submitted_ids.includes(socket.id)) {
          player.current_guess = { h, s, b };
          const score = calculateScore(
            room.target_color.h, room.target_color.s, room.target_color.b,
            h, s, b
          );
          player.round_score = score;
          player.total_score += score;
          room.submitted_ids.push(socket.id);
          
          room.answers.push({
            player_id: socket.id,
            round_number: room.round,
            target_h: room.target_color.h,
            target_s: room.target_color.s,
            target_b: room.target_color.b,
            guess_h: h,
            guess_s: s,
            guess_b: b,
            round_score: score
          });
          
          io.to(roomCode).emit('room_updated', room);

          if (room.submitted_ids.length === room.players.length) {
            showResults(roomCode);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Handle player removal from rooms
      rooms.forEach((room, code) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            rooms.delete(code);
          } else {
            if (room.host_player_id === socket.id) {
              room.host_player_id = room.players[0].id;
            }
            io.to(code).emit('room_updated', room);
          }
        }
      });
    });
  });

  function startRound(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.status = 'memorize';
    room.submitted_ids = [];
    room.target_color = {
      h: Math.floor(Math.random() * 360),
      s: Math.floor(Math.random() * 100),
      b: Math.floor(Math.random() * 100)
    };

    io.to(roomCode).emit('room_updated', room);

    // After 5 seconds of memorizing, move to guessing
    setTimeout(() => {
      if (rooms.has(roomCode)) {
        room.status = 'guess';
        io.to(roomCode).emit('room_updated', room);
      }
    }, 6000); // 5s + 1s buffer
  }

  function showResults(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.status = 'result';
    io.to(roomCode).emit('room_updated', room);

    // After 7 seconds of results, move to next round or end game
    setTimeout(() => {
      if (rooms.has(roomCode)) {
        if (room.round < room.total_rounds) {
          room.round += 1;
          startRound(roomCode);
        } else {
          room.status = 'gameover';
          // Sort players by total score for final leaderboard
          room.players.sort((a, b) => b.total_score - a.total_score);
          
          // Update high scores
          room.players.forEach(p => {
            highScores.push({
              id: Math.random().toString(36).substring(2, 9),
              player_name: p.name,
              total_score: p.total_score,
              played_at: new Date().toISOString()
            });
          });
          // Keep top 20
          highScores.sort((a, b) => b.total_score - a.total_score);
          if (highScores.length > 20) highScores.length = 20;

          io.to(roomCode).emit('room_updated', room);
          io.to(roomCode).emit('high_scores_updated', highScores);
        }
      }
    }, 8000); // 7s + 1s buffer
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
