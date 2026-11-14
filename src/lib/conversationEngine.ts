import { ChatMessage, OnboardingStep, MerchantProfile } from './types';

let messageCounter = 0;

function createMessage(
  role: 'ai' | 'merchant',
  content: string,
  type: ChatMessage['type'] = 'text',
  options?: string[],
  selectedOptions?: string[]
): ChatMessage {
  messageCounter++;
  return {
    id: `msg-${messageCounter}-${Date.now()}`,
    role,
    content,
    timestamp: new Date(),
    type,
    options,
    selectedOptions,
  };
}

export function getWelcomeMessages(): ChatMessage[] {
  messageCounter = 0;
  return [
    createMessage(
      'ai',
      "Welcome! 👋 I'm your AI business assistant. I'll help you set up your business on Paytm in just a few simple steps. Let's get started!"
    ),
    createMessage(
      'ai',
      "First, could you tell me — what is your business name?"
    ),
  ];
}

export function getAIResponse(
  step: OnboardingStep,
  merchantInput: string,
  profile: MerchantProfile
): { messages: ChatMessage[]; nextStep: OnboardingStep } {
  switch (step) {
    case 'business_name':
      return {
        messages: [
          createMessage(
            'ai',
            `Great choice! "${merchantInput}" sounds like an amazing business! 🎉`
          ),
          createMessage(
            'ai',
            "Now, what type of business do you operate? Select one of the categories below:",
            'category_selection'
          ),
        ],
        nextStep: 'business_category',
      };

    case 'business_category':
      return {
        messages: [
          createMessage(
            'ai',
            `${merchantInput} — nice! There's great potential in this space. 💼`
          ),
          createMessage(
            'ai',
            "Where is your business located? Please share your city and area (e.g., Lajpat Nagar, New Delhi)."
          ),
        ],
        nextStep: 'location',
      };

    case 'location':
      return {
        messages: [
          createMessage(
            'ai',
            `${merchantInput} is a great location for business! 📍`
          ),
          createMessage(
            'ai',
            "What products or services does your business offer? Tell me a bit about what you sell or the services you provide."
          ),
        ],
        nextStep: 'products_services',
      };

    case 'products_services':
      return {
        messages: [
          createMessage(
            'ai',
            `That sounds wonderful! Your offerings will appeal to many customers. ✨`
          ),
          createMessage(
            'ai',
            "Who are your target customers? For example: local residents, college students, office workers, families, etc."
          ),
        ],
        nextStep: 'target_customers',
      };

    case 'target_customers':
      return {
        messages: [
          createMessage(
            'ai',
            `Understanding your customers is key to growth — you're on the right track! 🎯`
          ),
          createMessage(
            'ai',
            "Last question! Do you currently accept digital payments? Select all that apply:",
            'payment_selection'
          ),
        ],
        nextStep: 'payment_methods',
      };

    case 'payment_methods':
      return {
        messages: [
          createMessage(
            'ai',
            "Excellent! 🎊 You've completed the onboarding process! Let me prepare your business profile...",
            'text'
          ),
          createMessage(
            'ai',
            `Here's your business profile summary:\n\n` +
            `🏪 **${profile.businessName}**\n` +
            `📂 ${profile.businessCategory}\n` +
            `📍 ${profile.location}\n` +
            `🛍️ ${profile.productsServices}\n` +
            `👥 ${profile.targetCustomers}\n` +
            `💳 ${profile.paymentMethods.join(', ')}`,
            'completion'
          ),
        ],
        nextStep: 'complete',
      };

    default:
      return {
        messages: [
          createMessage('ai', "I'm not sure what to ask next. Let's start over."),
        ],
        nextStep: 'welcome',
      };
  }
}

export function getStepProgress(step: OnboardingStep): number {
  const steps: OnboardingStep[] = [
    'welcome',
    'business_name',
    'business_category',
    'location',
    'products_services',
    'target_customers',
    'payment_methods',
    'complete',
  ];
  const index = steps.indexOf(step);
  if (index === -1) return 0;
  return Math.round((index / (steps.length - 1)) * 100);
}
