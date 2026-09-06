import React from 'react';
import { Room } from '../types';

type GameBoardProps = {
  room: Room;
  symbol: 'X' | 'O';
  handleMove: (index: number) => void;
  handleRestart: () => void;
  handleLeave: () => void;
};

export const GameBoard: React.FC<GameBoardProps> = ({ room, symbol, handleMove, handleRestart, handleLeave }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full border border-white/20 h-full lg:h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Game Board</h2>
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 text-purple-800 px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wide border border-purple-200 shadow-sm">
            You are: {symbol}
          </div>
          <button 
            onClick={handleLeave}
            className="text-sm font-semibold text-rose-600 hover:text-rose-800 transition-colors bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full"
          >
            Leave
          </button>
        </div>
      </div>

      {room.players.length === 1 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl mb-6 text-center font-medium shadow-sm animate-pulse">
          Waiting for opponent... share room ID: <span className="font-bold">{room.id}</span>
        </div>
      )}

      {room.players.length === 2 && (
        <div className={`p-4 rounded-xl mb-6 text-center font-bold text-lg shadow-sm transition-colors duration-300 ${
          room.winner ? 'bg-green-100 border border-green-200 text-green-800' : 
          room.isDraw ? 'bg-gray-100 border border-gray-200 text-gray-800' :
          room.turn === symbol ? 'bg-indigo-100 border border-indigo-200 text-indigo-800' : 'bg-slate-100 border border-slate-200 text-slate-600'
        }`}>
          {room.winner
            ? room.winner === symbol ? '🎉 You won!' : '😢 You lost!'
            : room.isDraw
            ? "🤝 It's a draw!"
            : room.turn === symbol
            ? '👉 Your turn'
            : "⏳ Opponent's turn"}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 flex-grow content-center max-w-[300px] sm:max-w-[360px] mx-auto w-full">
        {room.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleMove(index)}
            disabled={!!cell || room.turn !== symbol || !!room.winner || room.players.length < 2 || room.isDraw}
            className={`aspect-square w-full text-5xl md:text-6xl font-extrabold rounded-xl flex items-center justify-center transition-all duration-200 shadow-md border-2
              ${cell === 'X' ? 'text-blue-600 bg-blue-50 border-blue-200' : cell === 'O' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'bg-white border-gray-300'}
              ${!cell && room.turn === symbol && !room.winner && room.players.length === 2 
                ? 'hover:bg-purple-50 cursor-pointer hover:border-purple-400 hover:shadow-lg' 
                : !cell ? 'cursor-not-allowed bg-gray-50 opacity-80' : ''}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {(room.winner || room.isDraw) && (
        <button
          onClick={handleRestart}
          className="w-full bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-900 transition-colors font-bold shadow-md uppercase tracking-wider text-sm mt-auto"
        >
          Play Again
        </button>
      )}
    </div>
  );
};

