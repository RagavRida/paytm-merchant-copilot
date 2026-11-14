'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lastAudioRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch { /* noop */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playAudio = useCallback(async (base64Audio: string): Promise<void> => {
    if (!base64Audio) return;

    // Stop any current playback
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* noop */ }
      sourceRef.current = null;
    }

    lastAudioRef.current = base64Audio;

    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      sourceRef.current = source;
      setIsPlaying(true);

      return new Promise<void>((resolve) => {
        source.onended = () => {
          setIsPlaying(false);
          sourceRef.current = null;
          resolve();
        };
        source.start(0);
      });
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsPlaying(false);
      sourceRef.current = null;
    }
  }, [getAudioContext]);

  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* noop */ }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const replayLast = useCallback(async () => {
    if (lastAudioRef.current) {
      await playAudio(lastAudioRef.current);
    }
  }, [playAudio]);

  return { isPlaying, playAudio, stopPlayback, replayLast };
}
