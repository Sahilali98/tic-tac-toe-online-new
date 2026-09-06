import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';

type ChatBoxProps = {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  mySymbol: 'X' | 'O';
};

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, sendMessage, mySymbol }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full border border-white/20 flex flex-col h-[500px] lg:h-[600px] overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 shadow-sm z-10">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="bg-white/20 p-1.5 rounded-lg mr-3">💬</span>
          Live Chat
        </h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/50 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 italic font-medium">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === mySymbol;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="text-xs font-bold text-gray-500 mb-1 ml-1 mr-1">
                  Player {msg.sender}
                </div>
                <div 
                  className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm ${
                    isMe 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="p-3 bg-white border-t border-gray-100 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow px-4 py-2.5 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

