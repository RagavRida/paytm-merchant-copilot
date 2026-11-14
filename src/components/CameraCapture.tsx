'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
  reason?: string;
}

export default function CameraCapture({ onCapture, onCancel, reason }: CameraCaptureProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Camera access denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  if (error || hasPermission === false) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Camera Access Denied</h3>
          <p className="text-xs text-gray-500 mb-4">Please allow camera access in your browser settings to continue.</p>
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Continue Without Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-fadeIn">
      {reason && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
          <p className="text-xs text-amber-700 font-medium">📸 {reason}</p>
        </div>
      )}

      <div className="relative aspect-video bg-black">
        {capturedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capturedImage} alt="Captured shop" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-4 flex gap-3">
        {capturedImage ? (
          <>
            <button
              onClick={retakePhoto}
              className="flex-1 py-2.5 px-4 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              🔄 Retake
            </button>
            <button
              onClick={confirmPhoto}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00B9F5] to-[#0070C0] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              ✓ Use This Photo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              Skip
            </button>
            <button
              onClick={capturePhoto}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00B9F5] to-[#0070C0] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              📸 Capture
            </button>
          </>
        )}
      </div>
    </div>
  );
}
