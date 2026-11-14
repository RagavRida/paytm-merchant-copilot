import { MerchantProfile, OnboardingStage, INITIAL_PROFILE } from './types';
import { ChatApiResponse, SarvamExtractedFields } from './schemas';

// ── Conversation message type ──────────────────────────────────────
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Send text message to AI ────────────────────────────────────────
export async function sendMessageToAI(
  message: string,
  history: ConversationMessage[],
  profile: MerchantProfile,
  stage: OnboardingStage = 'introduction',
  language: string = 'en-IN',
  cameraInteractions: Array<{ type: string; analysisResult: string | null }> = []
): Promise<ChatApiResponse> {
  const response = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, profile, stage, language, cameraInteractions }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ── Speech-to-Text ─────────────────────────────────────────────────
export interface STTResult {
  transcript: string;
  language_code: string;
  language_probability: number;
  error?: string;
}

export async function sendAudioToSTT(
  audioBlob: Blob,
  language: string = 'unknown'
): Promise<STTResult> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('language', language);

  const response = await fetch('/api/voice/stt', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`STT API error: ${response.status}`);
  }

  return response.json();
}

// ── Text-to-Speech ─────────────────────────────────────────────────
export interface TTSResult {
  audio: string;  // base64 encoded WAV
  content_type: string;
  error?: string;
}

export async function requestTTS(
  text: string,
  language: string = 'en-IN',
  speaker?: string
): Promise<TTSResult> {
  const response = await fetch('/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language, speaker }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  return response.json();
}

// ── Merge extracted fields ─────────────────────────────────────────
export function mergeExtractedFields(
  current: MerchantProfile,
  extracted: SarvamExtractedFields
): MerchantProfile {
  const updated = { ...current };

  if (extracted.business_name) updated.businessName = extracted.business_name;
  if (extracted.category) updated.businessCategory = extracted.category;
  if (extracted.location) updated.location = extracted.location;
  if (extracted.city) updated.city = extracted.city;
  if (extracted.pin_code) updated.pinCode = extracted.pin_code;
  if (extracted.owner_name) updated.ownerName = extracted.owner_name;
  if (extracted.contact_number) updated.contactNumber = extracted.contact_number;
  if (extracted.operating_hours) updated.operatingHours = extracted.operating_hours;
  if (extracted.business_address) updated.businessAddress = extracted.business_address;

  if (extracted.products_services) {
    const val = extracted.products_services;
    updated.productsServices = Array.isArray(val) ? val.join(', ') : val;
  }

  if (extracted.target_customers) {
    const val = extracted.target_customers;
    updated.targetCustomers = Array.isArray(val) ? val.join(', ') : val;
  }

  if (extracted.payment_methods) {
    const val = extracted.payment_methods;
    if (Array.isArray(val) && val.length > 0) {
      updated.paymentMethods = val;
    } else if (typeof val === 'string' && val.length > 0) {
      updated.paymentMethods = [val];
    }
  }

  return updated;
}

// ── Stage detection ────────────────────────────────────────────────
export function getStageFromProfile(profile: MerchantProfile): OnboardingStage {
  if (!profile.businessName && !profile.businessCategory) return 'introduction';
  if (!profile.businessName) return 'business_info';
  if (!profile.businessCategory) return 'business_info';
  if (!profile.location && !profile.city) return 'business_info';
  if (!profile.productsServices) return 'business_info';
  if (!profile.contactNumber) return 'business_info';
  return 'summary';
}

// ── Profile completeness ───────────────────────────────────────────
export function isProfileComplete(profile: MerchantProfile): boolean {
  return !!(
    profile.businessName &&
    profile.businessCategory &&
    (profile.location || profile.city) &&
    profile.productsServices &&
    profile.contactNumber
  );
}

// ── Get step from profile (legacy compat) ──────────────────────────
export function getStepFromProfile(profile: MerchantProfile): string {
  if (!profile.businessName) return 'business_name';
  if (!profile.businessCategory) return 'business_category';
  if (!profile.location) return 'location';
  if (!profile.productsServices) return 'products_services';
  if (!profile.targetCustomers) return 'target_customers';
  if (!profile.paymentMethods || profile.paymentMethods.length === 0) return 'payment_methods';
  return 'complete';
}

export { INITIAL_PROFILE };
