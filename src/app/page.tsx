"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, ChatMessage } from '../types';
import { Lobby } from '../components/Lobby';
import { GameBoard } from '../components/GameBoard';
import { ChatBox } from '../components/ChatBox';

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [symbol, setSymbol] = useState<'X' | 'O' | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Auto-rejoin if we were already in a room
    const savedRoomId = sessionStorage.getItem('ticTacToeRoom');
    if (savedRoomId) {
      setRoomId(savedRoomId);
      newSocket.emit('join_room', savedRoomId);
    } else {
      setIsConnecting(false);
    }

    newSocket.on('joined', (data: { symbol: 'X' | 'O', room: Room, chatHistory?: ChatMessage[] }) => {
      setSymbol(data.symbol);
      setRoom(data.room);
      if (data.chatHistory) {
        setMessages(data.chatHistory);
      }
      setJoined(true);
      setError('');
      setIsConnecting(false);
    });

    newSocket.on('player_joined', (roomData: Room) => {
      setRoom(roomData);
    });

    newSocket.on('update_room', (roomData: Room) => {
      setRoom(roomData);
    });

    newSocket.on('player_left', (roomData: Room) => {
      setRoom(roomData);
      setMessages((prev) => [...prev, { text: 'Opponent left the room.', sender: 'System' }]);
    });

    newSocket.on('room_full', () => {
      setError('Room is full. Try another ID.');
      setIsConnecting(false);
      sessionStorage.removeItem('ticTacToeRoom');
    });

    newSocket.on('receive_message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && roomId.trim()) {
      setIsConnecting(true);
      sessionStorage.setItem('ticTacToeRoom', roomId);
      socket.emit('join_room', roomId);
    }
  };

  const handleMove = (index: number) => {
    if (socket && room && symbol && room.turn === symbol && !room.board[index] && !room.winner && !room.isDraw && room.players.length === 2) {
      socket.emit('make_move', { roomId, index, symbol });
    }
  };

  const handleRestart = () => {
    if (socket) {
      socket.emit('restart_game', roomId);
      setMessages([]);
    }
  };

  const handleSendMessage = (text: string) => {
    if (socket && symbol) {
      socket.emit('send_message', { roomId, text, sender: symbol });
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave_room');
      sessionStorage.removeItem('ticTacToeRoom');
      setJoined(false);
      setRoomId('');
      setRoom(null);
      setSymbol(null);
      setMessages([]);
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!joined) {
    return <Lobby roomId={roomId} setRoomId={setRoomId} handleJoin={handleJoin} error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 lg:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
        {/* Left Column: Game Board */}
        <div className="lg:col-span-8 flex flex-col">
          {room && symbol && (
            <GameBoard 
              room={room} 
              symbol={symbol} 
              handleMove={handleMove} 
              handleRestart={handleRestart} 
              handleLeave={handleLeave}
            />
          )}
        </div>
        
        {/* Right Column: Chat Box */}
        <div className="lg:col-span-4 flex">
          {symbol && (
            <ChatBox 
              messages={messages} 
              sendMessage={handleSendMessage} 
              mySymbol={symbol} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
