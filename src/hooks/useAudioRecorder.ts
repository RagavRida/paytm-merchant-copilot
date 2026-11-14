'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderOptions {
  onAudioReady: (blob: Blob) => void;
  silenceTimeout?: number;
  silenceThreshold?: number;
}

export function useAudioRecorder({
  onAudioReady,
  silenceTimeout = 2000,
  silenceThreshold = 15,
}: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    return () => { stopAllMedia(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAllMedia = useCallback(() => {
    activeRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* noop */ }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try { audioCtxRef.current.close(); } catch { /* noop */ }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  const finishRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    activeRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    mediaRecorderRef.current.stop();
  }, []);

  const monitorAudio = useCallback(() => {
    if (!analyserRef.current || !activeRef.current) return;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (!activeRef.current) return;
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      setAudioLevel(avg);

      if (avg > silenceThreshold) {
        hasSpokenRef.current = true;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (hasSpokenRef.current && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (activeRef.current) finishRecording();
        }, silenceTimeout);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [silenceThreshold, silenceTimeout, finishRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      setHasPermission(true);
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      hasSpokenRef.current = false;
      activeRef.current = true;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        setAudioLevel(0);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (chunksRef.current.length > 0 && hasSpokenRef.current) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          onAudioReady(blob);
        }
        chunksRef.current = [];
      };

      recorder.start(250);
      setIsRecording(true);
      monitorAudio();
    } catch (err) {
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Microphone access denied');
    }
  }, [onAudioReady, monitorAudio]);

  const stopRecording = useCallback(() => { finishRecording(); }, [finishRecording]);

  const cancelRecording = useCallback(() => {
    hasSpokenRef.current = false;
    stopAllMedia();
    chunksRef.current = [];
    setIsRecording(false);
    setAudioLevel(0);
  }, [stopAllMedia]);

  return { isRecording, hasPermission, error, audioLevel, startRecording, stopRecording, cancelRecording };
}
