'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';

interface VoiceTranscriptProps {
  messages: ChatMessage[];
  isVisible: boolean;
  onToggle: () => void;
}

export default function VoiceTranscript({ messages, isVisible, onToggle }: VoiceTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isVisible]);

  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors mb-2"
      >
        <svg className={`w-3 h-3 transition-transform ${isVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {isVisible ? 'Hide' : 'Show'} Conversation ({messages.length})
      </button>

      {isVisible && (
        <div
          ref={scrollRef}
          className="max-h-48 overflow-y-auto space-y-2 bg-gray-50/50 rounded-xl p-3 border border-gray-100 animate-fadeIn"
        >
          {messages.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Conversation will appear here</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'merchant' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && (
                <span className="text-sm flex-shrink-0 mt-0.5">🤖</span>
              )}
              <div className={`max-w-[85%] ${
                msg.role === 'ai'
                  ? 'bg-white border border-gray-100 rounded-xl rounded-tl-sm'
                  : 'bg-[#00B9F5]/10 border border-[#00B9F5]/20 rounded-xl rounded-tr-sm'
              } px-3 py-2`}>
                <p className="text-xs text-gray-800 leading-relaxed">{msg.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  {msg.language && (
                    <span className="text-[9px] text-gray-400 uppercase">{msg.language}</span>
                  )}
                </div>
              </div>
              {msg.role === 'merchant' && (
                <span className="text-sm flex-shrink-0 mt-0.5">👤</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
