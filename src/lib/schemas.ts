import { z } from 'zod';

// ── Agent response from Sarvam ─────────────────────────────────────
export const AgentActionSchema = z.object({
  type: z.enum([
    'ASK_QUESTION',
    'SAVE_BUSINESS_DETAIL',
    'OPEN_CAMERA',
    'SHOW_INTERACTIVE_FORM',
    'EXPLAIN_VERIFICATION',
    'CONFIRM_INFORMATION',
    'COMPLETE_PROFILE',
  ]),
  reason: z.string(),
});

export const ConfirmationItemSchema = z.object({
  field: z.string(),
  value: z.string(),
  question: z.string(),
});

export const SarvamExtractedFieldsSchema = z.object({
  business_name: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  pin_code: z.string().nullable().optional(),
  owner_name: z.string().nullable().optional(),
  contact_number: z.string().nullable().optional(),
  products_services: z.union([z.array(z.string()), z.string()]).nullable().optional(),
  target_customers: z.union([z.array(z.string()), z.string()]).nullable().optional(),
  payment_methods: z.union([z.array(z.string()), z.string()]).nullable().optional(),
  operating_hours: z.string().nullable().optional(),
  business_address: z.string().nullable().optional(),
});

export const SarvamAgentResponseSchema = z.object({
  spoken_response: z.string(),
  language: z.string().optional().default('en-IN'),
  intent: z.string().optional().default('onboarding'),
  action: AgentActionSchema.nullable().optional().default(null),
  extracted_fields: SarvamExtractedFieldsSchema.optional().default({}),
  missing_fields: z.array(z.string()).optional().default([]),
  current_stage: z.string().optional().default('introduction'),
  next_stage: z.string().nullable().optional().default(null),
  onboarding_complete: z.boolean().optional().default(false),
  needs_confirmation: z.array(ConfirmationItemSchema).nullable().optional().default(null),
});

export type SarvamAgentResponse = z.infer<typeof SarvamAgentResponseSchema>;
export type SarvamExtractedFields = z.infer<typeof SarvamExtractedFieldsSchema>;

// ── Legacy schemas (kept for backward compat) ─────────────────────
export const SarvamResponseSchema = z.object({
  reply: z.string(),
  extracted_fields: SarvamExtractedFieldsSchema.optional().default({}),
  missing_fields: z.array(z.string()).optional().default([]),
  onboarding_complete: z.boolean().optional().default(false),
});

export type SarvamResponse = z.infer<typeof SarvamResponseSchema>;

// ── Request body from frontend ────────────────────────────────────
export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).optional().default([]),
  profile: z.object({
    businessName: z.string().optional().default(''),
    businessCategory: z.string().optional().default(''),
    location: z.string().optional().default(''),
    city: z.string().optional().default(''),
    pinCode: z.string().optional().default(''),
    ownerName: z.string().optional().default(''),
    contactNumber: z.string().optional().default(''),
    productsServices: z.string().optional().default(''),
    targetCustomers: z.string().optional().default(''),
    paymentMethods: z.array(z.string()).optional().default([]),
    operatingHours: z.string().optional().default(''),
    businessAddress: z.string().optional().default(''),
    businessDescription: z.string().optional().default(''),
  }).optional(),
  stage: z.string().optional().default('introduction'),
  language: z.string().optional().default('en-IN'),
  cameraInteractions: z.array(z.object({
    type: z.string(),
    analysisResult: z.string().nullable(),
  })).optional().default([]),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ── Response to frontend ──────────────────────────────────────────
export interface ChatApiResponse {
  reply: string;
  extracted_fields: SarvamExtractedFields;
  missing_fields: string[];
  onboarding_complete: boolean;
  mode: 'ai' | 'demo';
  error?: string;
  language?: string;
  action?: { type: string; reason: string } | null;
  current_stage?: string;
  next_stage?: string | null;
  needs_confirmation?: Array<{ field: string; value: string; question: string }> | null;
}
