'use client';

import React from 'react';
import { MerchantProfile, OnboardingStep } from '@/lib/types';

interface MerchantProfilePanelProps {
  profile: MerchantProfile;
  onEdit: (step: OnboardingStep) => void;
  isComplete: boolean;
}

const fields: { key: keyof MerchantProfile; label: string; step: OnboardingStep; icon: string }[] = [
  { key: 'businessName', label: 'Business Name', step: 'business_name', icon: '🏪' },
  { key: 'businessCategory', label: 'Business Category', step: 'business_category', icon: '📂' },
  { key: 'location', label: 'Location', step: 'location', icon: '📍' },
  { key: 'productsServices', label: 'Products / Services', step: 'products_services', icon: '🛍️' },
  { key: 'targetCustomers', label: 'Target Customers', step: 'target_customers', icon: '👥' },
  { key: 'paymentMethods', label: 'Payment Methods', step: 'payment_methods', icon: '💳' },
];

export default function MerchantProfilePanel({ profile, onEdit, isComplete }: MerchantProfilePanelProps) {
  const getValue = (key: keyof MerchantProfile): string => {
    const val = profile[key];
    if (Array.isArray(val)) {
      return val.length > 0 ? val.join(', ') : '';
    }
    return val || '';
  };

  const filledCount = fields.filter((f) => getValue(f.key)).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Business Profile</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{filledCount} of {fields.length} completed</p>
          </div>
          <div className="flex items-center gap-1.5">
            {fields.map((f, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  getValue(f.key) ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {fields.map((field) => {
          const value = getValue(field.key);
          const isEmpty = !value;

          return (
            <div
              key={field.key}
              className="px-5 py-3.5 flex items-start gap-3 group hover:bg-gray-50/50 transition-colors duration-200"
            >
              <span className="text-base mt-0.5">{field.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                  {field.label}
                </p>
                {isEmpty ? (
                  <p className="text-sm text-gray-300 italic">Pending...</p>
                ) : (
                  <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
                )}
              </div>
              {!isEmpty && (
                <button
                  onClick={() => onEdit(field.step)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-gray-100"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

