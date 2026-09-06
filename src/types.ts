export type Player = {
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
  gameId: string | null;
};

export type ChatMessage = {
  id?: string;
  text: string;
  sender: string;
  createdAt?: Date;
};

