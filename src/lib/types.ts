export interface MerchantProfile {
  businessName: string;
  businessCategory: string;
  location: string;
  productsServices: string;
  targetCustomers: string;
  paymentMethods: string[];
}

export type OnboardingStep =
  | 'welcome'
  | 'business_name'
  | 'business_category'
  | 'location'
  | 'products_services'
  | 'target_customers'
  | 'payment_methods'
  | 'complete';

export interface ChatMessage {
  id: string;
  role: 'ai' | 'merchant';
  content: string;
  timestamp: Date;
  type: 'text' | 'category_selection' | 'payment_selection' | 'completion';
  options?: string[];
  selectedOptions?: string[];
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  profile: MerchantProfile;
  messages: ChatMessage[];
  isTyping: boolean;
  isComplete: boolean;
}

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
