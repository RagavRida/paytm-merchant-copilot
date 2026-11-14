'use client';

import React, { useState } from 'react';
import VoiceOnboarding from '@/components/VoiceOnboarding';

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9" />
                <path d="M12 6L7 8.5V15.5L12 18L17 15.5V8.5L12 6Z" fill="#00B9F5" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 tracking-tight">Paytm AI</h1>
              <p className="text-[11px] text-gray-400 font-medium">Voice Merchant Copilot</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-50 text-[#00B9F5]">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4.5-1.5h9" />
            </svg>
            Voice Onboarding
          </div>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Business Profile
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help & Support
          </button>
        </nav>

        {/* Feature highlights */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl p-4 border border-gray-100/80">
            <h4 className="text-xs font-bold text-gray-700 mb-2">🎙️ Voice Features</h4>
            <ul className="space-y-1.5">
              <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Multilingual support (10+ languages)
              </li>
              <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Auto language detection
              </li>
              <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Voice interruptions (barge-in)
              </li>
              <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Camera integration for shop photos
              </li>
              <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>
                Text fallback available
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-50">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">Paytm AI</span>
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pt-0 pt-14">
        <VoiceOnboarding />
      </div>
    </div>
  );
}
