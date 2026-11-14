'use client';

import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fadeIn">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

