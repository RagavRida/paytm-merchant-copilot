'use client';

import React from 'react';
import { BUSINESS_CATEGORIES } from '@/lib/types';

interface CategoryCardsProps {
  onSelect: (category: string) => void;
  disabled?: boolean;
}

export default function CategoryCards({ onSelect, disabled }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 animate-fadeIn my-2">
      {BUSINESS_CATEGORIES.map((category) => (
        <button
          key={category.value}
          onClick={() => !disabled && onSelect(category.value)}
          disabled={disabled}
          className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 bg-white
            transition-all duration-200 
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-[#00B9F5] hover:shadow-md hover:shadow-blue-100/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
            }`}
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
            {category.icon}
          </span>
          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
            {category.label}
          </span>
        </button>
      ))}
    </div>
  );
}

