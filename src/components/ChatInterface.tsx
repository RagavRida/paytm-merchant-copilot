'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, OnboardingStep, MerchantProfile } from '@/lib/types';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import CategoryCards from './CategoryCards';
import PaymentOptions from './PaymentOptions';
import CompletionScreen from './CompletionScreen';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentStep: OnboardingStep;
  isTyping: boolean;
  isComplete: boolean;
  onSendMessage: (content: string, type?: ChatMessage['type'], selectedOptions?: string[]) => void;
  onEdit: () => void;
  onContinue: () => void;
  profile: MerchantProfile;
  aiMode?: 'ai' | 'demo' | 'loading';
}

export default function ChatInterface({
  messages,
  currentStep,
  isTyping,
  isComplete,
  onSendMessage,
  onEdit,
  onContinue,
  profile,
  aiMode = 'demo',
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAI = aiMode === 'ai';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-focus input
  useEffect(() => {
    if (!isTyping && !isComplete) {
      // In AI mode, always show text input; in demo mode, hide for category/payment steps
      if (isAI || (currentStep !== 'business_category' && currentStep !== 'payment_methods')) {
        inputRef.current?.focus();
      }
    }
  }, [isTyping, isComplete, currentStep, isAI]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;
    onSendMessage(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCategorySelect = (category: string) => {
    if (isTyping) return;
    onSendMessage(category, 'category_selection');
  };

  const handlePaymentSubmit = (selected: string[]) => {
    if (isTyping) return;
    onSendMessage(selected.join(', '), 'payment_selection', selected);
  };

  // In AI mode: always show text input (merchant can type freely)
  // In demo mode: hide text input for category/payment steps
  const showTextInput = !isComplete && (isAI || (currentStep !== 'business_category' && currentStep !== 'payment_methods'));

  // In demo mode: show interactive cards at the right steps
  // In AI mode: don't show them (merchant types naturally)
  const showCategoryCards =
    !isAI &&
    !isComplete &&
    currentStep === 'business_category' &&
    !isTyping;

  const showPaymentOptions =
    !isAI &&
    !isComplete &&
    currentStep === 'payment_methods' &&
    !isTyping;

  // Suggested quick responses based on step
  const getSuggestions = (): string[] => {
    if (isAI) {
      // In AI mode, show natural language suggestions
      switch (currentStep) {
        case 'business_name':
          return ['I run a kirana store called Sharma Mart', 'My shop is called Fresh Bites Cafe'];
        case 'business_category':
          return ['Clothing shop', 'Restaurant / Cafe', 'Retail / Kirana store'];
        case 'location':
          return ['Kukatpally, Hyderabad', 'Lajpat Nagar, Delhi', 'Koramangala, Bangalore'];
        case 'products_services':
          return ['Daily essentials & groceries', 'Men\'s shirts and T-shirts', 'South Indian meals & snacks'];
        case 'target_customers':
          return ['Local residents & families', 'College students', 'Office workers'];
        case 'payment_methods':
          return ['UPI QR and Soundbox', 'Card machine and UPI', 'Not yet accepting digital payments'];
        default:
          return [];
      }
    }
    // Demo mode suggestions
    switch (currentStep) {
      case 'business_name':
        return ['My Kirana Store', 'Fresh Foods Mart', 'Style Studio'];
      case 'location':
        return ['Mumbai, Maharashtra', 'Delhi NCR', 'Bangalore, Karnataka'];
      case 'products_services':
        return ['Daily essentials & groceries', 'Fashion & clothing', 'Food & beverages'];
      case 'target_customers':
        return ['Local residents & families', 'College students', 'Working professionals'];
      default:
        return [];
    }
  };

  const suggestions = getSuggestions();

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">AI Business Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isAI ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`}></span>
                <span className="text-[11px] text-gray-400">
                  {isAI ? 'Powered by Sarvam AI' : aiMode === 'loading' ? 'Connecting...' : 'Demo Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Demo mode badge */}
          {aiMode === 'demo' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              <span className="text-[10px]">⚡</span>
              <span className="text-[10px] font-semibold text-amber-700">DEMO</span>
            </div>
          )}
          {isAI && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <span className="text-[10px]">🤖</span>
              <span className="text-[10px] font-semibold text-green-700">SARVAM AI</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Welcome banner (only before first message) */}
        {messages.length <= 2 && (
          <div className="text-center mb-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
              <span className="text-xs font-medium text-[#00B9F5]">✨ AI-Powered Onboarding</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Set up your business in minutes</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {isAI
                ? 'Tell me about your business in your own words — I\'ll understand and set everything up for you.'
                : 'Answer a few simple questions and our AI will create your complete business profile on Paytm.'}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <ChatBubble message={message} />

            {/* Show category cards after AI asks about business type (demo mode only) */}
            {message.type === 'category_selection' && message.role === 'ai' && showCategoryCards && (
              <div className="ml-11">
                <CategoryCards onSelect={handleCategorySelect} disabled={isTyping} />
              </div>
            )}

            {/* Show payment options after AI asks about payments (demo mode only) */}
            {message.type === 'payment_selection' && message.role === 'ai' && showPaymentOptions && (
              <div className="ml-11">
                <PaymentOptions onSubmit={handlePaymentSubmit} disabled={isTyping} />
              </div>
            )}
          </React.Fragment>
        ))}

        {isTyping && <TypingIndicator />}

        {/* Completion screen */}
        {isComplete && (
          <CompletionScreen profile={profile} onEdit={onEdit} onContinue={onContinue} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showTextInput && suggestions.length > 0 && !isTyping && (
        <div className="px-4 sm:px-6 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInputValue(suggestion);
                }}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-600
                  hover:border-[#00B9F5] hover:text-[#00B9F5] hover:bg-blue-50/50 transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      {showTextInput && (
        <div className="bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAI
                    ? 'Tell me about your business...'
                    : currentStep === 'business_name'
                    ? 'Type your business name...'
                    : currentStep === 'location'
                    ? 'Enter your business location...'
                    : currentStep === 'products_services'
                    ? 'Describe your products or services...'
                    : currentStep === 'target_customers'
                    ? 'Describe your target customers...'
                    : 'Type a message...'
                }
                disabled={isTyping}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B9F5]/20 focus:border-[#00B9F5]
                  transition-all duration-200 disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00B9F5] to-[#0070C0] text-white flex items-center justify-center
                shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-200/60 transition-all duration-200 
                active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {isAI ? 'Powered by Sarvam AI • Your data is secure and private' : 'Demo Mode • Connect Sarvam AI for intelligent responses'}
          </p>
        </div>
      )}
    </div>
  );
}
