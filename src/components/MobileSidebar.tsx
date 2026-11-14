'use client';

import React, { useState } from 'react';
import { OnboardingStep } from '@/lib/types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: OnboardingStep;
  progress: number;
  isComplete: boolean;
  onReset: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
  profile: {
    businessName: string;
  };
}

export default function MobileSidebar({
  isOpen,
  onClose,
  currentStep,
  progress,
  isComplete,
  onReset,
  onNavigate,
  activeView,
  profile,
}: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Slide-in panel */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden animate-slideIn">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Paytm AI</h1>
              <p className="text-[11px] text-gray-400 font-medium">Merchant Copilot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-3 space-y-1">
          <button
            onClick={() => { onReset(); onNavigate('onboarding'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'onboarding' ? 'bg-blue-50 text-[#00B9F5]' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Onboarding
          </button>
          <button
            onClick={() => { onNavigate('profile'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'profile' ? 'bg-blue-50 text-[#00B9F5]' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Business Profile
          </button>
        </nav>

        {/* Progress */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Progress</span>
            <span className="text-xs font-bold text-[#00B9F5]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200/60 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#00B9F5] to-[#0070C0] transition-all duration-700"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}

