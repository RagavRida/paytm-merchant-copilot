// ── Onboarding Stages ──────────────────────────────────────────────
export type OnboardingStage =
  | 'welcome'
  | 'introduction'
  | 'shop_exterior'
  | 'shop_interior'
  | 'business_info'
  | 'verification'
  | 'summary'
  | 'complete';

export const STAGE_ORDER: OnboardingStage[] = [
  'welcome',
  'introduction',
  'shop_exterior',
  'shop_interior',
  'business_info',
  'verification',
  'summary',
  'complete',
];

export const STAGE_LABELS: Record<OnboardingStage, string> = {
  welcome: 'Welcome',
  introduction: 'Introduction',
  shop_exterior: 'Shop Exterior',
  shop_interior: 'Shop Interior',
  business_info: 'Business Details',
  verification: 'Verification',
  summary: 'Review',
  complete: 'Complete',
};

// ── Legacy step types (kept for demo mode backward compat) ─────────
export type OnboardingStep =
  | 'welcome'
  | 'business_name'
  | 'business_category'
  | 'location'
  | 'products_services'
  | 'target_customers'
  | 'payment_methods'
  | 'complete';

export const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'business_name',
  'business_category',
  'location',
  'products_services',
  'target_customers',
  'payment_methods',
  'complete',
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  business_name: 'Business Name',
  business_category: 'Business Category',
  location: 'Location',
  products_services: 'Products & Services',
  target_customers: 'Target Customers',
  payment_methods: 'Payment Methods',
  complete: 'Complete',
};

// ── Voice state ────────────────────────────────────────────────────
export type VoiceState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'camera'
  | 'error';

// ── Language ───────────────────────────────────────────────────────
export interface DetectedLanguage {
  code: string;   // BCP-47, e.g. 'te-IN'
  name: string;   // e.g. 'Telugu'
}

export const SUPPORTED_LANGUAGES: DetectedLanguage[] = [
  { code: 'en-IN', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'od-IN', name: 'Odia' },
];

// ── Agent actions ──────────────────────────────────────────────────
export type AgentAction =
  | 'ASK_QUESTION'
  | 'SAVE_BUSINESS_DETAIL'
  | 'OPEN_CAMERA'
  | 'SHOW_INTERACTIVE_FORM'
  | 'EXPLAIN_VERIFICATION'
  | 'CONFIRM_INFORMATION'
  | 'COMPLETE_PROFILE';

export interface AgentActionPayload {
  type: AgentAction;
  reason: string;
}

// ── Merchant profile ───────────────────────────────────────────────
export interface MerchantProfile {
  businessName: string;
  businessCategory: string;
  location: string;
  city: string;
  pinCode: string;
  ownerName: string;
  contactNumber: string;
  productsServices: string;
  targetCustomers: string;
  paymentMethods: string[];
  operatingHours: string;
  businessAddress: string;
  businessDescription: string;
}

// ── Camera interactions ────────────────────────────────────────────
export interface CameraInteraction {
  id: string;
  type: 'shop_exterior' | 'shop_interior';
  imageDataUrl: string | null;
  analysisResult: string | null;
  timestamp: Date;
}

// ── Chat message ───────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'ai' | 'merchant';
  content: string;
  timestamp: Date;
  type: 'text' | 'category_selection' | 'payment_selection' | 'completion' | 'camera_action' | 'camera_result';
  options?: string[];
  selectedOptions?: string[];
  language?: string;
  action?: AgentActionPayload | null;
}

// ── Onboarding state ──────────────────────────────────────────────
export interface OnboardingState {
  currentStep: OnboardingStep;
  stage: OnboardingStage;
  profile: MerchantProfile;
  messages: ChatMessage[];
  isTyping: boolean;
  isComplete: boolean;
  voiceState: VoiceState;
  detectedLanguage: DetectedLanguage;
  cameraInteractions: CameraInteraction[];
}

// ── Constants ──────────────────────────────────────────────────────
export const BUSINESS_CATEGORIES = [
  { label: 'Retail / Kirana', icon: '🏪', value: 'Retail / Kirana' },
  { label: 'Clothing', icon: '👕', value: 'Clothing' },
  { label: 'Restaurant / Cafe', icon: '🍽️', value: 'Restaurant / Cafe' },
  { label: 'Salon', icon: '💇', value: 'Salon' },
  { label: 'Services', icon: '🔧', value: 'Services' },
  { label: 'Other', icon: '📦', value: 'Other' },
];

export const PAYMENT_OPTIONS = [
  { label: 'UPI QR', icon: '📱', value: 'UPI QR' },
  { label: 'Soundbox', icon: '🔊', value: 'Soundbox' },
  { label: 'Card Machine', icon: '💳', value: 'Card Machine' },
  { label: 'Payment Gateway', icon: '🌐', value: 'Payment Gateway' },
  { label: 'Not yet accepting digital payments', icon: '❌', value: 'Not yet accepting digital payments' },
];

export const INITIAL_PROFILE: MerchantProfile = {
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

export const INITIAL_LANGUAGE: DetectedLanguage = { code: 'en-IN', name: 'English' };
