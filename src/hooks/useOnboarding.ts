'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  OnboardingState,
  OnboardingStep,
  MerchantProfile,
  ChatMessage,
  STEP_ORDER,
} from '@/lib/types';
import { getWelcomeMessages, getAIResponse, getStepProgress } from '@/lib/conversationEngine';
import { sendMessageToAI, mergeExtractedFields, getStepFromProfile, isProfileComplete } from '@/lib/aiService';

const STORAGE_KEY = 'paytm-merchant-onboarding';

const initialProfile: MerchantProfile = {
  businessName: '',
  businessCategory: '',
  location: '',
  city: '',
  pinCode: '',
  ownerName: '',
  contactNumber: '',
  productsServices: '',
  targetCustomers: '',
  paymentMethods: [],
  operatingHours: '',
  businessAddress: '',
  businessDescription: '',
};

const initialState: OnboardingState = {
  currentStep: 'business_name',
  stage: 'introduction',
  profile: initialProfile,
  messages: [],
  isTyping: false,
  isComplete: false,
  voiceState: 'idle',
  detectedLanguage: { code: 'en-IN', name: 'English' },
  cameraInteractions: [],
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [initialized, setInitialized] = useState(false);
  const [aiMode, setAiMode] = useState<'ai' | 'demo' | 'loading'>('loading');
  // Track conversation history for AI context (role + content only)
  const aiHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.messages = parsed.messages.map((m: ChatMessage) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setState(parsed);
        // Restore AI history from saved messages
        aiHistoryRef.current = parsed.messages
          .filter((m: ChatMessage) => m.role === 'ai' || m.role === 'merchant')
          .map((m: ChatMessage) => ({
            role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
            content: m.content,
          }));
      } else {
        setState({
          ...initialState,
          messages: getWelcomeMessages(),
        });
      }
    } catch {
      setState({
        ...initialState,
        messages: getWelcomeMessages(),
      });
    }
    setInitialized(true);

    // Check if AI is available by making a lightweight check
    checkAIAvailability();
  }, []);

  // Check AI availability
  const checkAIAvailability = async () => {
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'ping',
          history: [],
          profile: initialProfile,
        }),
      });
      const data = await res.json();
      setAiMode(data.mode === 'ai' ? 'ai' : 'demo');
    } catch {
      setAiMode('demo');
    }
  };

  // Save to localStorage
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Silently fail
      }
    }
  }, [state, initialized]);

  // AI-powered message handler
  const handleAIMessage = useCallback(
    async (content: string) => {
      try {
        // Add user message to AI history
        aiHistoryRef.current.push({ role: 'user', content });

        const response = await sendMessageToAI(
          content,
          aiHistoryRef.current.slice(0, -1), // History without current message
          state.profile
        );

        // If API returned demo mode, fall back
        if (response.mode === 'demo' || response.error) {
          setAiMode('demo');
          return null;
        }

        // Add assistant reply to AI history
        aiHistoryRef.current.push({ role: 'assistant', content: response.reply });

        return response;
      } catch {
        setAiMode('demo');
        return null;
      }
    },
    [state.profile]
  );

  const addMerchantMessage = useCallback(
    (content: string, type: ChatMessage['type'] = 'text', selectedOptions?: string[]) => {
      const merchantMsg: ChatMessage = {
        id: `msg-${Date.now()}-merchant`,
        role: 'merchant',
        content,
        timestamp: new Date(),
        type,
        selectedOptions,
      };

      // For category and payment selection in demo mode, use original behavior
      const useDemo = aiMode === 'demo' || type === 'category_selection' || type === 'payment_selection';

      setState((prev) => {
        const updatedProfile = { ...prev.profile };
        const currentStep = prev.currentStep;

        // Update profile based on current step (for demo mode / selections)
        if (useDemo) {
          switch (currentStep) {
            case 'business_name':
              updatedProfile.businessName = content;
              break;
            case 'business_category':
              updatedProfile.businessCategory = content;
              break;
            case 'location':
              updatedProfile.location = content;
              break;
            case 'products_services':
              updatedProfile.productsServices = content;
              break;
            case 'target_customers':
              updatedProfile.targetCustomers = content;
              break;
            case 'payment_methods':
              updatedProfile.paymentMethods = selectedOptions || [content];
              break;
          }
        }

        return {
          ...prev,
          messages: [...prev.messages, merchantMsg],
          profile: updatedProfile,
          isTyping: true,
        };
      });

      if (useDemo) {
        // Demo mode: use rule-based engine
        setTimeout(() => {
          setState((prev) => {
            const { messages: aiMessages, nextStep } = getAIResponse(
              prev.currentStep,
              content,
              prev.profile
            );

            return {
              ...prev,
              messages: [...prev.messages, ...aiMessages],
              currentStep: nextStep,
              isTyping: false,
              isComplete: nextStep === 'complete',
            };
          });
        }, 1200);
      } else {
        // AI mode: call Sarvam API
        handleAIMessage(content).then((response) => {
          setState((prev) => {
            if (!response) {
              // Fallback to demo mode
              const { messages: aiMessages, nextStep } = getAIResponse(
                prev.currentStep,
                content,
                prev.profile
              );
              return {
                ...prev,
                messages: [...prev.messages, ...aiMessages],
                currentStep: nextStep,
                isTyping: false,
                isComplete: nextStep === 'complete',
              };
            }

            // Merge extracted fields into profile
            const updatedProfile = mergeExtractedFields(prev.profile, response.extracted_fields);
            const step = getStepFromProfile(updatedProfile) as OnboardingStep;
            const complete = isProfileComplete(updatedProfile);

            // Create AI message
            const aiMsg: ChatMessage = {
              id: `msg-${Date.now()}-ai`,
              role: 'ai',
              content: response.reply,
              timestamp: new Date(),
              type: complete ? 'completion' : 'text',
            };

            return {
              ...prev,
              messages: [...prev.messages, aiMsg],
              profile: updatedProfile,
              currentStep: complete ? 'complete' : step,
              isTyping: false,
              isComplete: complete,
            };
          });
        });
      }
    },
    [aiMode, handleAIMessage]
  );

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    aiHistoryRef.current = [];
    setState({
      ...initialState,
      messages: getWelcomeMessages(),
    });
  }, []);

  const editField = useCallback((step: OnboardingStep) => {
    setState((prev) => {
      const stepIndex = STEP_ORDER.indexOf(step);
      if (stepIndex === -1) return prev;

      const resetProfile = { ...prev.profile };
      const fieldsToReset: OnboardingStep[] = STEP_ORDER.slice(stepIndex);
      fieldsToReset.forEach((s) => {
        switch (s) {
          case 'business_name':
            resetProfile.businessName = '';
            break;
          case 'business_category':
            resetProfile.businessCategory = '';
            break;
          case 'location':
            resetProfile.location = '';
            break;
          case 'products_services':
            resetProfile.productsServices = '';
            break;
          case 'target_customers':
            resetProfile.targetCustomers = '';
            break;
          case 'payment_methods':
            resetProfile.paymentMethods = [];
            break;
        }
      });

      const welcomeMsgs = getWelcomeMessages();
      let messages: ChatMessage[] = [...welcomeMsgs];
      let currentStep: OnboardingStep = 'business_name';

      for (let i = 1; i < stepIndex; i++) {
        const s = STEP_ORDER[i];
        let userContent = '';
        switch (s) {
          case 'business_name':
            userContent = resetProfile.businessName;
            break;
          case 'business_category':
            userContent = resetProfile.businessCategory;
            break;
          case 'location':
            userContent = resetProfile.location;
            break;
          case 'products_services':
            userContent = resetProfile.productsServices;
            break;
          case 'target_customers':
            userContent = resetProfile.targetCustomers;
            break;
          case 'payment_methods':
            userContent = resetProfile.paymentMethods.join(', ');
            break;
        }

        if (userContent) {
          const merchantMsg: ChatMessage = {
            id: `edit-merchant-${Date.now()}-${i}`,
            role: 'merchant',
            content: userContent,
            timestamp: new Date(),
            type: 'text',
          };
          messages.push(merchantMsg);

          const { messages: aiMsgs, nextStep } = getAIResponse(s, userContent, resetProfile);
          messages.push(...aiMsgs);
          currentStep = nextStep;
        }
      }

      // Reset AI history too
      aiHistoryRef.current = [];

      return {
        ...prev,
        messages,
        profile: resetProfile,
        currentStep: step,
        isComplete: false,
        isTyping: false,
      };
    });
  }, []);

  const progress = getStepProgress(state.currentStep);

  return {
    state,
    progress,
    initialized,
    aiMode,
    addMerchantMessage,
    resetOnboarding,
    editField,
  };
}
