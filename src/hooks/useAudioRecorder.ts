'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderOptions {
  onAudioReady: (blob: Blob) => void;
  silenceTimeout?: number;
  silenceThreshold?: number;
}

// Encode raw Float32 audio samples into standard 16-bit mono 16kHz PCM WAV
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF header
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples (convert float -1.0..1.0 to 16-bit signed integer)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Resample audio buffer to 16kHz if needed
function resampleTo16k(audioData: Float32Array, origSampleRate: number): Float32Array {
  if (origSampleRate === 16000) return audioData;
  const ratio = origSampleRate / 16000;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < audioData.length; i++) {
      accum += audioData[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
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

  const audioChunksRef = useRef<Float32Array[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
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
    audioChunksRef.current = [];
  }, []);

  const finishRecording = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setIsRecording(false);
    setAudioLevel(0);

    const chunks = audioChunksRef.current;
    const sampleRate = audioCtxRef.current?.sampleRate || 16000;

    // Disconnect audio nodes
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (chunks.length > 0 && hasSpokenRef.current) {
      // Calculate total length
      let totalSamples = 0;
      for (const chunk of chunks) totalSamples += chunk.length;

      // Concatenate
      const fullBuffer = new Float32Array(totalSamples);
      let offset = 0;
      for (const chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      // Resample to 16kHz
      const resampled = resampleTo16k(fullBuffer, sampleRate);

      // Encode to pure 16-bit PCM WAV (no Opus/WebM)
      const wavBlob = encodeWAV(resampled, 16000);
      onAudioReady(wavBlob);
    }

    audioChunksRef.current = [];
  }, [onAudioReady]);

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
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      setHasPermission(true);
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);

      // Analyser node for VAD
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      // ScriptProcessorNode to capture raw PCM audio
      const bufferSize = 4096;
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;
      audioChunksRef.current = [];
      hasSpokenRef.current = false;
      activeRef.current = true;

      processor.onaudioprocess = (e) => {
        if (!activeRef.current) return;
        const input = e.inputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsRecording(true);
      monitorAudio();
    } catch (err) {
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Microphone access denied');
    }
  }, [monitorAudio]);

  const stopRecording = useCallback(() => { finishRecording(); }, [finishRecording]);

  const cancelRecording = useCallback(() => {
    hasSpokenRef.current = false;
    stopAllMedia();
    setIsRecording(false);
    setAudioLevel(0);
  }, [stopAllMedia]);

  return { isRecording, hasPermission, error, audioLevel, startRecording, stopRecording, cancelRecording };
}
