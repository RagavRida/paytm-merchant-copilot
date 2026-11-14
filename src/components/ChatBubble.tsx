'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isAI = message.role === 'ai';
  const [formattedTime, setFormattedTime] = useState('');

  // Format time only on client to avoid hydration mismatch
  useEffect(() => {
    setFormattedTime(
      message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );
  }, [message.timestamp]);

  // Format content with bold markers
  const formatContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <React.Fragment key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    });
  };

  return (
    <div className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      {isAI && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAI
            ? 'bg-white border border-gray-100 shadow-sm text-gray-800'
            : 'bg-gradient-to-br from-[#00B9F5] to-[#0070C0] text-white shadow-md'
        }`}
      >
        <p className={`text-sm leading-relaxed ${isAI ? 'text-gray-700' : 'text-white'}`}>
          {formatContent(message.content)}
        </p>
        {formattedTime && (
          <p className={`text-[10px] mt-1.5 ${isAI ? 'text-gray-400' : 'text-blue-100'}`}>
            {formattedTime}
          </p>
        )}
      </div>
      {!isAI && (
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}

