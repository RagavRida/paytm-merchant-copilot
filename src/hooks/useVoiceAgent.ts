'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChatMessage,
  MerchantProfile,
  OnboardingStage,
  VoiceState,
  DetectedLanguage,
  CameraInteraction,
  AgentActionPayload,
  INITIAL_PROFILE,
  INITIAL_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '@/lib/types';
import { ChatApiResponse } from '@/lib/schemas';
import {
  sendMessageToAI,
  sendAudioToSTT,
  requestTTS,
  mergeExtractedFields,
  isProfileComplete,
} from '@/lib/aiService';
import { useAudioRecorder } from './useAudioRecorder';
import { useAudioPlayer } from './useAudioPlayer';

const STORAGE_KEY = 'paytm-voice-onboarding';

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function findLanguage(code: string): DetectedLanguage {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || { code, name: code };
}

interface VoiceAgentState {
  voiceState: VoiceState;
  messages: ChatMessage[];
  profile: MerchantProfile;
  stage: OnboardingStage;
  detectedLanguage: DetectedLanguage;
  isComplete: boolean;
  cameraInteractions: CameraInteraction[];
  error: string | null;
  cameraAction: AgentActionPayload | null;
  currentTranscript: string;
  aiMode: 'ai' | 'demo' | 'loading';
  showTranscript: boolean;
  showTextInput: boolean;
}

export function useVoiceAgent() {
  const [state, setState] = useState<VoiceAgentState>({
    voiceState: 'idle',
    messages: [],
    profile: INITIAL_PROFILE,
    stage: 'welcome',
    detectedLanguage: INITIAL_LANGUAGE,
    isComplete: false,
    cameraInteractions: [],
    error: null,
    cameraAction: null,
    currentTranscript: '',
    aiMode: 'ai',
    showTranscript: false,
    showTextInput: false,
  });

  const [initialized, setInitialized] = useState(true);
  const historyRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const processingRef = useRef(false);
  const lastTtsAudioRef = useRef<string | null>(null);

  const { isPlaying, playAudio, stopPlayback, replayLast, unlockAudio } = useAudioPlayer();

  // Handle audio ready from recorder
  const handleAudioReady = useCallback(async (blob: Blob) => {
    if (processingRef.current) return;
    processingRef.current = true;

    setState(prev => ({ ...prev, voiceState: 'thinking', currentTranscript: '' }));

    try {
      // STT
      const sttResult = await sendAudioToSTT(blob, state.detectedLanguage.code);

      if (sttResult.error) {
        setState(prev => ({
          ...prev,
          voiceState: 'error',
          error: sttResult.error || 'Speech recognition failed',
        }));
        processingRef.current = false;
        return;
      }

      if (!sttResult.transcript || !sttResult.transcript.trim()) {
        // No speech detected — seamlessly return to listening
        setState(prev => ({ ...prev, voiceState: 'listening', error: null }));
        processingRef.current = false;
        setTimeout(() => startRecording(), 300);
        return;
      }

      const transcript = sttResult.transcript;

      // Update detected language if confident
      if (sttResult.language_code && sttResult.language_code !== 'unknown' && sttResult.language_probability > 0.5) {
        setState(prev => ({
          ...prev,
          detectedLanguage: findLanguage(sttResult.language_code),
        }));
      }

      // Add merchant message
      const merchantMsg: ChatMessage = {
        id: generateId('merchant'),
        role: 'merchant',
        content: transcript,
        timestamp: new Date(),
        type: 'text',
        language: sttResult.language_code,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, merchantMsg],
        currentTranscript: transcript,
      }));

      historyRef.current.push({ role: 'user', content: transcript });

      // Call AI
      const aiLang = sttResult.language_code !== 'unknown' ? sttResult.language_code : state.detectedLanguage.code;
      const cameraCtx = state.cameraInteractions.map(c => ({ type: c.type, analysisResult: c.analysisResult }));

      const aiResponse = await sendMessageToAI(
        transcript,
        historyRef.current.slice(0, -1),
        state.profile,
        state.stage,
        aiLang,
        cameraCtx
      );

      await processAIResponse(aiResponse, aiLang);
    } catch (err) {
      console.error('Voice processing error:', err);
      setState(prev => ({
        ...prev,
        voiceState: 'error',
        error: err instanceof Error ? err.message : 'Something went wrong',
      }));
    } finally {
      processingRef.current = false;
    }
  }, [state.detectedLanguage.code, state.profile, state.stage, state.cameraInteractions]);

  const { isRecording, hasPermission, error: recorderError, audioLevel, startRecording, stopRecording, cancelRecording } = useAudioRecorder({
    onAudioReady: handleAudioReady,
  });

  // Process AI response: update state, play TTS, decide next action
  const processAIResponse = useCallback(async (response: ChatApiResponse, lang: string) => {
    const replyText = response.reply;

    // Add AI message
    const aiMsg: ChatMessage = {
      id: generateId('ai'),
      role: 'ai',
      content: replyText,
      timestamp: new Date(),
      type: response.onboarding_complete ? 'completion' : 'text',
      language: response.language || lang,
      action: response.action as AgentActionPayload | null,
    };

    historyRef.current.push({ role: 'assistant', content: replyText });

    // Merge extracted fields
    const updatedProfile = mergeExtractedFields(state.profile, response.extracted_fields);
    const complete = response.onboarding_complete || isProfileComplete(updatedProfile);

    // Determine next stage
    const nextStage = (response.next_stage as OnboardingStage) || (response.current_stage as OnboardingStage) || state.stage;

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, aiMsg],
      profile: updatedProfile,
      stage: complete ? 'summary' : nextStage,
      isComplete: complete,
      aiMode: response.mode === 'ai' ? 'ai' : 'demo',
      cameraAction: response.action?.type === 'OPEN_CAMERA' ? (response.action as AgentActionPayload) : null,
      voiceState: 'speaking',
      error: null,
    }));

    // TTS — speak the response
    try {
      const ttsLang = response.language || lang;
      const ttsResult = await requestTTS(replyText, ttsLang);

      if (ttsResult.error || !ttsResult.audio) {
        console.error('TTS error:', ttsResult.error);
        // Continue without audio
        setState(prev => ({
          ...prev,
          voiceState: response.action?.type === 'OPEN_CAMERA' ? 'camera' : 'listening',
        }));

        // Auto-start listening if no camera action
        if (response.action?.type !== 'OPEN_CAMERA' && !complete) {
          setTimeout(() => startRecording(), 500);
        }
        return;
      }

      lastTtsAudioRef.current = ttsResult.audio;

      await playAudio(ttsResult.audio);

      // After TTS finishes, decide next action
      if (response.action?.type === 'OPEN_CAMERA') {
        setState(prev => ({ ...prev, voiceState: 'camera' }));
      } else if (!complete) {
        setState(prev => ({ ...prev, voiceState: 'listening' }));
        setTimeout(() => startRecording(), 300);
      } else {
        setState(prev => ({ ...prev, voiceState: 'idle' }));
      }
    } catch (ttsErr) {
      console.error('TTS playback failed:', ttsErr);
      setState(prev => ({
        ...prev,
        voiceState: response.action?.type === 'OPEN_CAMERA' ? 'camera' : (complete ? 'idle' : 'listening'),
      }));
      if (!complete && response.action?.type !== 'OPEN_CAMERA') {
        setTimeout(() => startRecording(), 500);
      }
    }
  }, [state.profile, state.stage, playAudio, startRecording]);

  // Barge-in: if recording starts while playing, stop TTS
  useEffect(() => {
    if (isRecording && isPlaying) {
      stopPlayback();
    }
  }, [isRecording, isPlaying, stopPlayback]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.messages = (parsed.messages || []).map((m: ChatMessage) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setState(prev => ({
          ...prev,
          messages: parsed.messages || [],
          profile: { ...INITIAL_PROFILE, ...parsed.profile },
          stage: parsed.stage || 'welcome',
          detectedLanguage: parsed.detectedLanguage || INITIAL_LANGUAGE,
          isComplete: parsed.isComplete || false,
          cameraInteractions: parsed.cameraInteractions || [],
        }));
        // Restore history
        historyRef.current = (parsed.messages || [])
          .filter((m: ChatMessage) => m.role === 'ai' || m.role === 'merchant')
          .map((m: ChatMessage) => ({
            role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
            content: m.content,
          }));
      }
    } catch { /* noop */ }
    setInitialized(true);
    checkAIAvailability();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: state.messages,
        profile: state.profile,
        stage: state.stage,
        detectedLanguage: state.detectedLanguage,
        isComplete: state.isComplete,
        cameraInteractions: state.cameraInteractions,
      }));
    } catch { /* noop */ }
  }, [initialized, state.messages, state.profile, state.stage, state.detectedLanguage, state.isComplete, state.cameraInteractions]);

  const checkAIAvailability = async () => {
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ping', history: [], profile: INITIAL_PROFILE }),
      });
      const data = await res.json();
      setState(prev => ({ ...prev, aiMode: data.mode === 'ai' ? 'ai' : 'demo' }));
    } catch {
      setState(prev => ({ ...prev, aiMode: 'demo' }));
    }
  };

  // ── Public actions ────────────────────────────────────────────────
  const startConversation = useCallback(async () => {
    // Synchronously unlock audio on mobile before any async fetches
    unlockAudio();

    setState(prev => ({ ...prev, voiceState: 'speaking', error: null, stage: 'introduction' }));

    const welcomeText = 'Namaste! Welcome to Paytm. I will help you set up your business. Are you already running a shop, or are you planning to open one?';

    const welcomeMsg: ChatMessage = {
      id: generateId('ai'),
      role: 'ai',
      content: welcomeText,
      timestamp: new Date(),
      type: 'text',
      language: 'en-IN',
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, welcomeMsg] }));
    historyRef.current.push({ role: 'assistant', content: welcomeText });

    try {
      const ttsResult = await requestTTS(welcomeText, 'en-IN');
      if (ttsResult.audio) {
        lastTtsAudioRef.current = ttsResult.audio;
        await playAudio(ttsResult.audio);
      }
    } catch (err) {
      console.error('Welcome TTS failed:', err);
    }

    // Start listening
    setState(prev => ({ ...prev, voiceState: 'listening' }));
    setTimeout(() => startRecording(), 300);
  }, [playAudio, startRecording]);

  const stopConversation = useCallback(() => {
    cancelRecording();
    stopPlayback();
    setState(prev => ({ ...prev, voiceState: 'idle' }));
  }, [cancelRecording, stopPlayback]);

  const repeatLastResponse = useCallback(async () => {
    unlockAudio();
    if (lastTtsAudioRef.current) {
      setState(prev => ({ ...prev, voiceState: 'speaking' }));
      await replayLast();
      setState(prev => ({ ...prev, voiceState: 'listening' }));
      setTimeout(() => startRecording(), 300);
    }
  }, [replayLast, startRecording]);

  const handleTextMessage = useCallback(async (text: string) => {
    if (processingRef.current || !text.trim()) return;
    processingRef.current = true;

    cancelRecording();
    stopPlayback();

    const merchantMsg: ChatMessage = {
      id: generateId('merchant'),
      role: 'merchant',
      content: text,
      timestamp: new Date(),
      type: 'text',
      language: state.detectedLanguage.code,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, merchantMsg],
      voiceState: 'thinking',
    }));

    historyRef.current.push({ role: 'user', content: text });

    try {
      const cameraCtx = state.cameraInteractions.map(c => ({ type: c.type, analysisResult: c.analysisResult }));
      const aiResponse = await sendMessageToAI(
        text,
        historyRef.current.slice(0, -1),
        state.profile,
        state.stage,
        state.detectedLanguage.code,
        cameraCtx
      );
      await processAIResponse(aiResponse, state.detectedLanguage.code);
    } catch (err) {
      console.error('Text message error:', err);
      setState(prev => ({
        ...prev,
        voiceState: 'error',
        error: err instanceof Error ? err.message : 'Something went wrong',
      }));
    } finally {
      processingRef.current = false;
    }
  }, [state.detectedLanguage.code, state.profile, state.stage, state.cameraInteractions, cancelRecording, stopPlayback, processAIResponse]);

  const handleCameraCapture = useCallback(async (imageDataUrl: string, type: 'shop_exterior' | 'shop_interior' = 'shop_exterior') => {
    const interaction: CameraInteraction = {
      id: generateId('camera'),
      type,
      imageDataUrl,
      analysisResult: null,
      timestamp: new Date(),
    };

    // Simulated image analysis
    const simulatedAnalysis = type === 'shop_exterior'
      ? '[Simulated analysis] Shop exterior photo captured. Visible signage and storefront identified. Business appears to be a retail establishment.'
      : '[Simulated analysis] Shop interior photo captured. Product shelves and counter area visible. Business setup appears organized.';

    interaction.analysisResult = simulatedAnalysis;

    setState(prev => ({
      ...prev,
      cameraInteractions: [...prev.cameraInteractions, interaction],
      cameraAction: null,
    }));

    // Continue conversation with analysis result
    const cameraMsg = `[Photo captured: ${type === 'shop_exterior' ? 'Shop Exterior' : 'Shop Interior'}] ${simulatedAnalysis}`;

    const merchantMsg: ChatMessage = {
      id: generateId('merchant'),
      role: 'merchant',
      content: `📸 ${type === 'shop_exterior' ? 'Shop exterior' : 'Shop interior'} photo shared`,
      timestamp: new Date(),
      type: 'camera_result',
      language: state.detectedLanguage.code,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, merchantMsg],
      voiceState: 'thinking',
    }));

    historyRef.current.push({ role: 'user', content: cameraMsg });

    try {
      const cameraCtx = [...state.cameraInteractions, interaction].map(c => ({ type: c.type, analysisResult: c.analysisResult }));
      const aiResponse = await sendMessageToAI(
        cameraMsg,
        historyRef.current.slice(0, -1),
        state.profile,
        state.stage,
        state.detectedLanguage.code,
        cameraCtx
      );
      await processAIResponse(aiResponse, state.detectedLanguage.code);
    } catch (err) {
      console.error('Camera processing error:', err);
      setState(prev => ({ ...prev, voiceState: 'error', error: 'Failed to process photo' }));
    }
  }, [state.detectedLanguage.code, state.profile, state.stage, state.cameraInteractions, processAIResponse]);

  const dismissCamera = useCallback(() => {
    setState(prev => ({ ...prev, cameraAction: null, voiceState: 'listening' }));
    setTimeout(() => startRecording(), 300);
  }, [startRecording]);

  const resetOnboarding = useCallback(() => {
    cancelRecording();
    stopPlayback();
    localStorage.removeItem(STORAGE_KEY);
    historyRef.current = [];
    lastTtsAudioRef.current = null;
    setState({
      voiceState: 'idle',
      messages: [],
      profile: INITIAL_PROFILE,
      stage: 'welcome',
      detectedLanguage: INITIAL_LANGUAGE,
      isComplete: false,
      cameraInteractions: [],
      error: null,
      cameraAction: null,
      currentTranscript: '',
      aiMode: state.aiMode,
      showTranscript: false,
      showTextInput: false,
    });
  }, [cancelRecording, stopPlayback, state.aiMode]);

  const toggleTranscript = useCallback(() => {
    setState(prev => ({ ...prev, showTranscript: !prev.showTranscript }));
  }, []);

  const toggleTextInput = useCallback(() => {
    setState(prev => ({ ...prev, showTextInput: !prev.showTextInput }));
  }, []);

  const retryAfterError = useCallback(() => {
    setState(prev => ({ ...prev, voiceState: 'listening', error: null }));
    setTimeout(() => startRecording(), 300);
  }, [startRecording]);

  // Stage progress as percentage
  const stageIndex = ['welcome', 'introduction', 'shop_exterior', 'shop_interior', 'business_info', 'verification', 'summary', 'complete'].indexOf(state.stage);
  const progress = Math.round((Math.max(0, stageIndex) / 7) * 100);

  return {
    ...state,
    initialized,
    isRecording,
    isPlaying,
    hasPermission,
    recorderError,
    audioLevel,
    progress,
    startConversation,
    stopConversation,
    repeatLastResponse,
    handleTextMessage,
    handleCameraCapture,
    dismissCamera,
    resetOnboarding,
    toggleTranscript,
    toggleTextInput,
    retryAfterError,
    startRecording,
    stopRecording,
  };
}
