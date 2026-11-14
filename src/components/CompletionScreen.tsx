'use client';

import React from 'react';
import { MerchantProfile } from '@/lib/types';

interface CompletionScreenProps {
  profile: MerchantProfile;
  onEdit: () => void;
  onContinue: () => void;
}

export default function CompletionScreen({ profile, onEdit, onContinue }: CompletionScreenProps) {
  return (
    <div className="animate-fadeIn flex flex-col items-center py-8 px-4">
      {/* Success animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200/50 animate-scaleIn">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-green-200 animate-ping opacity-20"></div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Your business profile is ready! 🎉
      </h2>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
        We&apos;ve gathered all the information needed to set up your business on Paytm. 
        Review your details below.
      </p>

      {/* Profile Summary Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#00B9F5] to-[#0070C0] px-6 py-4">
          <h3 className="text-white font-bold text-lg">{profile.businessName}</h3>
          <p className="text-blue-100 text-sm">{profile.businessCategory}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-base mt-0.5">📍</span>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Location</p>
              <p className="text-sm text-gray-800 font-medium">{profile.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base mt-0.5">🛍️</span>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Products & Services</p>
              <p className="text-sm text-gray-800 font-medium">{profile.productsServices}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base mt-0.5">👥</span>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Target Customers</p>
              <p className="text-sm text-gray-800 font-medium">{profile.targetCustomers}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-base mt-0.5">💳</span>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Payment Methods</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-[#00B9F5] text-xs font-medium"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full max-w-md">
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold
            hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
        >
          ✏️ Edit Details
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00B9F5] to-[#0070C0] text-white text-sm font-semibold
            shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-200/60 transition-all duration-200 
            active:scale-[0.98]"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

