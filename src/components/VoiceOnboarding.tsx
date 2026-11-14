'use client';

import React, { useState } from 'react';
import { MerchantProfile, OnboardingStage, STAGE_LABELS } from '@/lib/types';
import VoiceStateIndicator from './VoiceStateIndicator';
import VoiceTranscript from './VoiceTranscript';
import CameraCapture from './CameraCapture';
import OnboardingStageProgress from './OnboardingStageProgress';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';

export default function VoiceOnboarding() {
  const agent = useVoiceAgent();
  const [textInput, setTextInput] = useState('');

  const handleTextSend = () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;
    agent.handleTextMessage(trimmed);
    setTextInput('');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Paytm AI Merchant Copilot</h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${agent.aiMode === 'ai' ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
                <span className="text-[11px] text-gray-400">
                  {agent.aiMode === 'ai' ? 'Voice Agent • Sarvam AI' : agent.aiMode === 'loading' ? 'Connecting...' : 'Demo Mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
              <span className="text-[10px]">🌐</span>
              <span className="text-[10px] font-medium text-gray-600">{agent.detectedLanguage.name}</span>
            </div>

            {/* Mode badge */}
            {agent.aiMode === 'ai' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200">
                <span className="text-[10px]">🎙️</span>
                <span className="text-[10px] font-semibold text-green-700">VOICE AI</span>
              </div>
            )}
            {agent.aiMode === 'demo' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                <span className="text-[10px]">⚡</span>
                <span className="text-[10px] font-semibold text-amber-700">DEMO</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col items-center justify-center gap-6">
        {/* Welcome state */}
        {agent.voiceState === 'idle' && agent.messages.length === 0 && (
          <div className="text-center animate-fadeIn max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-xs font-medium text-[#00B9F5]">🎙️ Voice-First Onboarding</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to Paytm AI<br />Merchant Onboarding
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Let&apos;s get your shop registered. You can simply<br />talk to me in your language.
            </p>
          </div>
        )}

        {/* Error display */}
        {agent.error && (
          <div className="w-full max-w-md bg-red-50 border border-red-100 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-800">Something went wrong</p>
                <p className="text-xs text-red-600 mt-1">{agent.error}</p>
                {agent.recorderError && (
                  <p className="text-xs text-red-600 mt-1">{agent.recorderError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current transcript (live) */}
        {agent.currentTranscript && agent.voiceState === 'thinking' && (
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-xl p-4 shadow-sm animate-fadeIn">
            <p className="text-xs font-medium text-gray-400 mb-1">You said:</p>
            <p className="text-sm text-gray-800">{agent.currentTranscript}</p>
          </div>
        )}

        {/* Voice State Indicator */}
        <VoiceStateIndicator
          voiceState={agent.voiceState}
          audioLevel={agent.audioLevel}
          onStartTalking={agent.startConversation}
          onRetry={agent.retryAfterError}
        />

        {/* Camera capture UI */}
        {agent.cameraAction && agent.voiceState === 'camera' && (
          <div className="w-full max-w-md">
            <CameraCapture
              onCapture={(img) => agent.handleCameraCapture(img, agent.stage === 'shop_interior' ? 'shop_interior' : 'shop_exterior')}
              onCancel={agent.dismissCamera}
              reason={agent.cameraAction.reason}
            />
          </div>
        )}

        {/* Camera action card (when AI suggests but not yet in camera mode) */}
        {agent.cameraAction && agent.voiceState !== 'camera' && (
          <div className="w-full max-w-md bg-white border border-amber-100 rounded-xl p-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <span className="text-lg">📸</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Show your shop</p>
                <p className="text-xs text-gray-500">{agent.cameraAction.reason}</p>
              </div>
              <button
                onClick={() => agent.handleCameraCapture('', agent.stage === 'shop_interior' ? 'shop_interior' : 'shop_exterior')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00B9F5] to-[#0070C0] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Open Camera
              </button>
            </div>
          </div>
        )}

        {/* Conversation transcript */}
        {agent.messages.length > 0 && (
          <div className="w-full max-w-md">
            <VoiceTranscript
              messages={agent.messages}
              isVisible={agent.showTranscript}
              onToggle={agent.toggleTranscript}
            />
          </div>
        )}

        {/* Stage progress */}
        {agent.stage !== 'welcome' && (
          <div className="w-full max-w-md">
            <OnboardingStageProgress
              currentStage={agent.stage}
              progress={agent.progress}
            />
          </div>
        )}

        {/* Completion state */}
        {agent.isComplete && (
          <CompletionSummary profile={agent.profile} onReset={agent.resetOnboarding} />
        )}
      </div>

      {/* ── Controls bar ───────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 px-4 sm:px-6 py-3">
        {/* Voice controls */}
        <div className="flex items-center justify-center gap-4 mb-2">
          {/* Mic button */}
          <button
            onClick={agent.voiceState === 'listening' ? agent.stopRecording : agent.voiceState === 'idle' ? agent.startConversation : undefined}
            disabled={agent.voiceState === 'thinking' || agent.voiceState === 'speaking'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              agent.voiceState === 'listening'
                ? 'bg-red-500 text-white shadow-md shadow-red-200/50'
                : 'bg-gradient-to-br from-[#00B9F5] to-[#0070C0] text-white shadow-md shadow-blue-200/50 disabled:opacity-40'
            }`}
          >
            {agent.voiceState === 'listening' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>

          {/* Stop conversation */}
          {agent.voiceState !== 'idle' && (
            <button
              onClick={agent.stopConversation}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="End conversation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          )}

          {/* Repeat */}
          {agent.messages.length > 0 && (
            <button
              onClick={agent.repeatLastResponse}
              disabled={agent.voiceState === 'speaking'}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
              title="Repeat last response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Toggle text input */}
          <button
            onClick={agent.toggleTextInput}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              agent.showTextInput ? 'bg-[#00B9F5]/10 text-[#00B9F5]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title="Type instead"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Reset */}
          {agent.messages.length > 0 && (
            <button
              onClick={agent.resetOnboarding}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Start over"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Text input fallback */}
        {agent.showTextInput && (
          <div className="flex items-center gap-2 mt-2 animate-fadeIn">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTextSend(); }}
              placeholder="Type a message instead..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B9F5]/20 focus:border-[#00B9F5] transition-all"
            />
            <button
              onClick={handleTextSend}
              disabled={!textInput.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] text-white flex items-center justify-center shadow-sm disabled:opacity-40 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-2 text-center">
          {agent.aiMode === 'ai'
            ? '🔒 Powered by Sarvam AI • Your data is secure and private'
            : 'Demo Mode • Connect Sarvam AI for voice responses'}
        </p>
      </div>
    </div>
  );
}

// ── Inline completion summary ──────────────────────────────────────
function CompletionSummary({ profile, onReset }: { profile: MerchantProfile; onReset: () => void }) {
  const fields = [
    { icon: '🏪', label: 'Business Name', value: profile.businessName },
    { icon: '📂', label: 'Category', value: profile.businessCategory },
    { icon: '👤', label: 'Owner', value: profile.ownerName },
    { icon: '📍', label: 'Location', value: [profile.businessAddress, profile.location, profile.city, profile.pinCode].filter(Boolean).join(', ') },
    { icon: '📞', label: 'Contact', value: profile.contactNumber },
    { icon: '🛍️', label: 'Products', value: profile.productsServices },
    { icon: '👥', label: 'Customers', value: profile.targetCustomers },
    { icon: '💳', label: 'Payments', value: profile.paymentMethods.join(', ') },
    { icon: '🕐', label: 'Hours', value: profile.operatingHours },
  ].filter(f => f.value);

  return (
    <div className="w-full max-w-md animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-4 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="text-white font-bold text-lg">Profile Complete!</h3>
          <p className="text-green-100 text-xs mt-1">Your business information has been collected</p>
        </div>
        <div className="p-4 space-y-3">
          {fields.map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-base mt-0.5">{f.icon}</span>
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{f.label}</p>
                <p className="text-sm text-gray-800 font-medium">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
            <p className="text-xs text-amber-700">
              <strong>Next step:</strong> Visit your nearest Paytm office or complete KYC online through the official Paytm app to verify your business.
            </p>
          </div>
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
          >
            Start New Onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
