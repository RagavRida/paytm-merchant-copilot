'use client';

import React from 'react';
import { OnboardingStage, STAGE_ORDER, STAGE_LABELS } from '@/lib/types';

interface OnboardingStageProgressProps {
  currentStage: OnboardingStage;
  progress: number;
}

const STAGE_ICONS: Record<OnboardingStage, string> = {
  welcome: '👋',
  introduction: '💬',
  shop_exterior: '🏪',
  shop_interior: '🏬',
  business_info: '📋',
  verification: '✅',
  summary: '📄',
  complete: '🎉',
};

export default function OnboardingStageProgress({ currentStage, progress }: OnboardingStageProgressProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const visibleStages = STAGE_ORDER.filter(s => s !== 'welcome' && s !== 'complete');

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
        <span className="text-xs font-bold text-[#00B9F5]">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200/60 rounded-full h-1.5 mb-3">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-[#00B9F5] to-[#0070C0] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage dots */}
      <div className="flex items-center justify-between">
        {visibleStages.map((stage, i) => {
          const stageIdx = STAGE_ORDER.indexOf(stage);
          const isCompleted = stageIdx < currentIndex;
          const isCurrent = stage === currentStage;

          return (
            <div key={stage} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                  ? 'bg-[#00B9F5] text-white ring-2 ring-blue-200'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  STAGE_ICONS[stage]
                )}
              </div>
              <span className={`text-[9px] font-medium text-center leading-tight ${
                isCurrent ? 'text-[#00B9F5]' : isCompleted ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {STAGE_LABELS[stage].split(' ')[0]}
              </span>
              {i < visibleStages.length - 1 && (
                <div className="hidden" /> // connector handled by flex justify-between
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
