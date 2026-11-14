'use client';

import React from 'react';
import { OnboardingStep, STEP_ORDER, STEP_LABELS } from '@/lib/types';

interface SidebarProps {
  currentStep: OnboardingStep;
  progress: number;
  isComplete: boolean;
  onReset: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
  profile: {
    businessName: string;
    businessCategory: string;
    location: string;
  };
}

export default function Sidebar({
  currentStep,
  progress,
  isComplete,
  onReset,
  onNavigate,
  activeView,
  profile,
}: SidebarProps) {
  const completedSteps = STEP_ORDER.indexOf(currentStep);

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/>
              <path d="M12 6L7 8.5V15.5L12 18L17 15.5V8.5L12 6Z" fill="#00B9F5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">Paytm AI</h1>
            <p className="text-[11px] text-gray-400 font-medium">Merchant Copilot</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <button
          onClick={() => { onReset(); onNavigate('onboarding'); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeView === 'onboarding'
              ? 'bg-blue-50 text-[#00B9F5]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Onboarding
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeView === 'profile'
              ? 'bg-blue-50 text-[#00B9F5]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Business Profile
          {profile.businessName && (
            <span className="ml-auto w-2 h-2 rounded-full bg-green-400"></span>
          )}
        </button>

        <button
          onClick={() => onNavigate('onboarding')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeView === 'progress'
              ? 'bg-blue-50 text-[#00B9F5]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Onboarding Progress
        </button>

        <div className="!mt-4 px-3">
          <div className="h-px bg-gray-100 mb-4"></div>
        </div>

        <button
          onClick={() => onNavigate('help')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Help & Support
        </button>
      </nav>

      {/* Progress Card */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl p-4 border border-gray-100/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</span>
            <span className="text-xs font-bold text-[#00B9F5]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200/60 rounded-full h-1.5 mb-3">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#00B9F5] to-[#0070C0] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="space-y-1.5">
            {STEP_ORDER.filter(s => s !== 'welcome' && s !== 'complete').map((step, i) => {
              const isCompleted = i < completedSteps - 1;
              const isCurrent = step === currentStep;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-[#00B9F5] ring-2 ring-blue-200'
                        : 'bg-gray-200'
                  }`}>
                    {isCompleted && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  <span className={`text-[11px] ${
                    isCompleted ? 'text-gray-500' : isCurrent ? 'text-[#00B9F5] font-medium' : 'text-gray-400'
                  }`}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

