'use client';

import React from 'react';
import { VoiceState } from '@/lib/types';

interface VoiceStateIndicatorProps {
  voiceState: VoiceState;
  audioLevel: number;
  onStartTalking: () => void;
  onRetry: () => void;
}

export default function VoiceStateIndicator({
  voiceState,
  audioLevel,
  onStartTalking,
  onRetry,
}: VoiceStateIndicatorProps) {
  const normalizedLevel = Math.min(audioLevel / 50, 1);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main indicator circle */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer rings for listening */}
        {voiceState === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-green-300/40 animate-voicePulse" />
            <div className="absolute -inset-3 rounded-full border border-green-200/20 animate-voicePulse" style={{ animationDelay: '0.3s' }} />
            <div className="absolute -inset-6 rounded-full border border-green-100/10 animate-voicePulse" style={{ animationDelay: '0.6s' }} />
          </>
        )}

        {/* Speaking rings */}
        {voiceState === 'speaking' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-300/40 animate-voicePulse" />
            <div className="absolute -inset-3 rounded-full border border-blue-200/20 animate-voicePulse" style={{ animationDelay: '0.4s' }} />
          </>
        )}

        {/* Error ring */}
        {voiceState === 'error' && (
          <div className="absolute inset-0 rounded-full border-2 border-red-300/50 animate-pulse" />
        )}

        {/* Main circle */}
        <div
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
            voiceState === 'idle'
              ? 'bg-gradient-to-br from-[#00B9F5] to-[#0070C0] shadow-lg shadow-blue-200/50 animate-breathe cursor-pointer'
              : voiceState === 'listening'
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200/50'
              : voiceState === 'thinking'
              ? 'bg-gradient-to-br from-[#00B9F5] to-[#0070C0] shadow-lg shadow-blue-200/50'
              : voiceState === 'speaking'
              ? 'bg-gradient-to-br from-[#00B9F5] to-[#0070C0] shadow-lg shadow-blue-200/50'
              : voiceState === 'camera'
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50'
              : 'bg-gradient-to-br from-red-400 to-red-500 shadow-lg shadow-red-200/50'
          }`}
          onClick={voiceState === 'idle' ? onStartTalking : voiceState === 'error' ? onRetry : undefined}
          style={
            voiceState === 'listening'
              ? { transform: `scale(${1 + normalizedLevel * 0.08})` }
              : undefined
          }
        >
          {/* Idle: Play/Start icon */}
          {voiceState === 'idle' && (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
          )}

          {/* Listening: Mic with audio bars */}
          {voiceState === 'listening' && (
            <div className="flex items-end gap-1 h-10">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-2 bg-white/90 rounded-full animate-waveform"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    height: `${Math.max(12, normalizedLevel * 36)}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Thinking: Rotating dots */}
          {voiceState === 'thinking' && (
            <div className="relative w-12 h-12 animate-spin" style={{ animationDuration: '2s' }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white rounded-full"
                  style={{
                    top: `${50 - 40 * Math.cos((i * 2 * Math.PI) / 3)}%`,
                    left: `${50 + 40 * Math.sin((i * 2 * Math.PI) / 3)}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: 1 - i * 0.2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Speaking: Waveform bars */}
          {voiceState === 'speaking' && (
            <div className="flex items-center gap-1 h-10">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-2 bg-white/90 rounded-full animate-waveform"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          {/* Camera: Camera icon */}
          {voiceState === 'camera' && (
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}

          {/* Error: Exclamation */}
          {voiceState === 'error' && (
            <svg className="w-12 h-12 text-white cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
      </div>

      {/* State label */}
      <div className="text-center">
        <p className={`text-sm font-semibold ${
          voiceState === 'idle' ? 'text-[#00B9F5]'
          : voiceState === 'listening' ? 'text-green-600'
          : voiceState === 'thinking' ? 'text-[#00B9F5]'
          : voiceState === 'speaking' ? 'text-[#00B9F5]'
          : voiceState === 'camera' ? 'text-amber-600'
          : 'text-red-500'
        }`}>
          {voiceState === 'idle' && 'Tap to Start Talking'}
          {voiceState === 'listening' && 'Listening...'}
          {voiceState === 'thinking' && 'Understanding...'}
          {voiceState === 'speaking' && 'Speaking...'}
          {voiceState === 'camera' && 'Camera Ready'}
          {voiceState === 'error' && 'Tap to Retry'}
        </p>
        {voiceState === 'idle' && (
          <p className="text-xs text-gray-400 mt-1">Speak in any language</p>
        )}
      </div>
    </div>
  );
}
