'use client';

import React from 'react';
import { MerchantProfile } from '@/lib/types';

interface DashboardProps {
  profile: MerchantProfile;
  onBack: () => void;
}

export default function Dashboard({ profile, onBack }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">AI Business Dashboard</h1>
              <p className="text-[11px] text-gray-400">{profile.businessName}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Onboarding
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#00B9F5] to-[#0070C0] rounded-2xl p-8 mb-8 text-white shadow-lg shadow-blue-200/30">
          <h2 className="text-2xl font-bold mb-2">Welcome, {profile.businessName}! 👋</h2>
          <p className="text-blue-100 text-sm max-w-2xl">
            Your AI-powered business dashboard is ready. Here you&apos;ll find insights, recommendations, 
            and tools to grow your business. This is a placeholder — more features coming soon!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Today\'s Sales', value: '₹0', icon: '💰', change: 'Getting started' },
            { label: 'Customers', value: '0', icon: '👥', change: 'Build your base' },
            { label: 'Products', value: '—', icon: '📦', change: 'Add products' },
            { label: 'Rating', value: '⭐ New', icon: '⭐', change: 'Earn reviews' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions & Business Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Add Products', icon: '📦' },
                { label: 'Set Pricing', icon: '💲' },
                { label: 'QR Code', icon: '📱' },
                { label: 'Promotions', icon: '🎯' },
                { label: 'Analytics', icon: '📊' },
                { label: 'Settings', icon: '⚙️' },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-gray-100 
                    hover:border-[#00B9F5] hover:bg-blue-50/50 text-sm font-medium text-gray-700 
                    hover:text-[#00B9F5] transition-all duration-200"
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Business Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Your Business</h3>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Name</p>
                <p className="text-sm font-semibold text-gray-800">{profile.businessName}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Category</p>
                <p className="text-sm text-gray-700">{profile.businessCategory}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm text-gray-700">{profile.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Payments</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.paymentMethods.map((m) => (
                    <span key={m} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-[#00B9F5] font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights placeholder */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900">AI Insights</h3>
            <span className="text-[10px] bg-blue-50 text-[#00B9F5] px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-500">
            Your AI assistant will provide personalized business insights, growth recommendations, 
            and competitive analysis right here. Complete your setup to unlock these features.
          </p>
        </div>
      </main>
    </div>
  );
}

