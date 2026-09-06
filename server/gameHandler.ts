import { Server, Socket } from 'socket.io';
import { prisma } from '../src/lib/prisma';

type Player = {
  id: string;
  symbol: 'X' | 'O';
};

export type Room = {
  id: string;
  players: Player[];
  board: (string | null)[];
  turn: 'X' | 'O';
  winner: string | null;
  isDraw: boolean;
  gameId: string | null; // Database Game ID
};

const rooms: Record<string, Room> = {};

const checkWin = (board: (string | null)[]) => {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const line of winLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

export const handleSocketConnection = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', async (roomId: string) => {
      if (!rooms[roomId]) {
        // Create a new game in the database
        let game = await prisma.game.findUnique({ where: { roomId } });
        if (!game) {
           game = await prisma.game.create({
             data: { roomId }
           });
        }

        rooms[roomId] = {
          id: roomId,
          players: [],
          board: Array(9).fill(null),
          turn: 'X',
          winner: null,
          isDraw: false,
          gameId: game.id,
        };
      }

      const room = rooms[roomId];

      if (room.players.length >= 2) {
        socket.emit('room_full');
        return;
      }

      let symbol: 'X' | 'O' = 'X';
      if (room.players.length === 1) {
        symbol = room.players[0].symbol === 'X' ? 'O' : 'X';
      }
      
      room.players.push({ id: socket.id, symbol });
      socket.join(roomId);

      // Fetch chat history
      let chatHistory: any[] = [];
      if (room.gameId) {
        chatHistory = await prisma.message.findMany({
          where: { gameId: room.gameId },
          orderBy: { createdAt: 'asc' }
        });
      }

      socket.emit('joined', { symbol, room, chatHistory });
      io.to(roomId).emit('player_joined', room);
    });

    socket.on('make_move', async ({ roomId, index, symbol }: { roomId: string, index: number, symbol: 'X' | 'O' }) => {
      const room = rooms[roomId];
      if (room && !room.winner && !room.isDraw && room.turn === symbol && room.board[index] === null) {
        room.board[index] = symbol;
        const winner = checkWin(room.board);
        
        if (winner) {
          room.winner = winner;
        } else if (!room.board.includes(null)) {
          room.isDraw = true;
        } else {
          room.turn = room.turn === 'X' ? 'O' : 'X';
        }
        
        io.to(roomId).emit('update_room', room);

        if (room.winner || room.isDraw) {
          if (room.gameId) {
            await prisma.game.update({
              where: { id: room.gameId },
              data: { winner: room.winner || 'DRAW' }
            });
          }
        }
      }
    });

    socket.on('send_message', async ({ roomId, text, sender }: { roomId: string, text: string, sender: string }) => {
      const room = rooms[roomId];
      if (room && room.gameId) {
        const message = await prisma.message.create({
          data: {
            text,
            sender,
            gameId: room.gameId
          }
        });
        io.to(roomId).emit('receive_message', message);
      }
    });

    socket.on('restart_game', async (roomId: string) => {
      const room = rooms[roomId];
      if (room) {
        const game = await prisma.game.create({
          data: {
            roomId: roomId + '-' + Date.now() 
          }
        }).catch(async () => {
             return prisma.game.update({
               where: { roomId },
               data: { winner: null }
             })
        });

        room.gameId = game.id;
        room.board = Array(9).fill(null);
        room.turn = 'X';
        room.winner = null;
        room.isDraw = false;
        io.to(roomId).emit('update_room', room);
      }
    });

    const handlePlayerLeave = (socketId: string) => {
      for (const roomId in rooms) {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(p => p.id === socketId);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          io.to(roomId).emit('player_left', room);
          if (room.players.length === 0) {
            delete rooms[roomId];
          } else {
            // Just update the room state without resetting the board
            io.to(roomId).emit('update_room', room);
          }
          break;
        }
      }
    };

    socket.on('leave_room', () => {
      handlePlayerLeave(socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      handlePlayerLeave(socket.id);
    });
  });
};

