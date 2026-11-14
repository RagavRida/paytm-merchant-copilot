'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastAudioRef = useRef<string | null>(null);

  // Synchronously unlock audio inside the touch/click event handler
  const unlockAudio = useCallback(() => {
    try {
      // 1. Resume / create Web Audio context
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      }

      // 2. Unlock HTML5 audio with an empty buffer
      const dummy = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      dummy.volume = 0.01;
      dummy.play().then(() => {
        dummy.pause();
      }).catch(() => { /* ignore */ });
    } catch {
      // ignore unlock errors
    }
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch { /* noop */ }
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playWithWebAudio = useCallback(async (base64Audio: string): Promise<void> => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const buffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      return new Promise<void>((resolve) => {
        source.onended = () => {
          setIsPlaying(false);
          resolve();
        };
        setIsPlaying(true);
        source.start(0);
      });
    } catch (e) {
      console.error('Web Audio fallback failed:', e);
      setIsPlaying(false);
    }
  }, []);

  const playAudio = useCallback(async (base64Audio: string): Promise<void> => {
    if (!base64Audio) return;

    stopPlayback();
    lastAudioRef.current = base64Audio;

    return new Promise<void>((resolve) => {
      try {
        // Use HTML5 Audio for seamless mobile playback
        const audioUrl = `data:audio/wav;base64,${base64Audio}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
        };

        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
          resolve();
        };

        audio.onerror = () => {
          // Fallback to Web Audio if HTMLAudioElement fails on raw WAV
          playWithWebAudio(base64Audio).then(resolve);
        };

        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // If play was rejected (e.g. autoplay restriction), fallback to Web Audio
            playWithWebAudio(base64Audio).then(resolve);
          });
        }
      } catch {
        playWithWebAudio(base64Audio).then(resolve);
      }
    });
  }, [stopPlayback, playWithWebAudio]);

  const replayLast = useCallback(async () => {
    if (lastAudioRef.current) {
      await playAudio(lastAudioRef.current);
    }
  }, [playAudio]);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch { /* noop */ }
      }
    };
  }, [stopPlayback]);

  return { isPlaying, playAudio, stopPlayback, replayLast, unlockAudio };
}
