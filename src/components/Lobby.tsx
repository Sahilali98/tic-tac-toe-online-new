import React from 'react';

type LobbyProps = {
  roomId: string;
  setRoomId: (id: string) => void;
  handleJoin: (e: React.FormEvent) => void;
  error: string;
};

export const Lobby: React.FC<LobbyProps> = ({ roomId, setRoomId, handleJoin, error }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          Tic Tac Toe
        </h1>
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-gray-800 font-medium"
              placeholder="e.g., awesome-room"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-purple-500/30"
          >
            Join / Create Game
          </button>
        </form>
      </div>
    </div>
  );
};

