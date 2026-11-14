'use client';

import React, { useState } from 'react';
import { PAYMENT_OPTIONS } from '@/lib/types';

interface PaymentOptionsProps {
  onSubmit: (selected: string[]) => void;
  disabled?: boolean;
}

export default function PaymentOptions({ onSubmit, disabled }: PaymentOptionsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (value: string) => {
    if (disabled) return;
    
    // If "Not yet accepting" is selected, clear other selections
    if (value === 'Not yet accepting digital payments') {
      setSelected([value]);
      return;
    }

    // If selecting a payment method, remove "Not yet accepting"
    setSelected((prev) => {
      const filtered = prev.filter(v => v !== 'Not yet accepting digital payments');
      if (filtered.includes(value)) {
        return filtered.filter((v) => v !== value);
      }
      return [...filtered, value];
    });
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      onSubmit(selected);
    }
  };

  return (
    <div className="animate-fadeIn my-2">
      <div className="space-y-2">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleOption(option.value)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-[#00B9F5] bg-blue-50/80 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-xl">{option.icon}</span>
              <span className={`text-sm font-medium flex-1 text-left ${
                isSelected ? 'text-[#00B9F5]' : 'text-gray-700'
              }`}>
                {option.label}
              </span>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                ${isSelected ? 'border-[#00B9F5] bg-[#00B9F5]' : 'border-gray-300'}`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00B9F5] to-[#0070C0] text-white text-sm font-semibold
            shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-200/60 transition-all duration-200 
            active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with {selected.length} selected
        </button>
      )}
    </div>
  );
}

