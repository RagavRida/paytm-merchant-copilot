import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema, SarvamAgentResponseSchema, ChatApiResponse } from '@/lib/schemas';
import { buildVoiceSystemPrompt } from '@/lib/systemPrompt';
import { OnboardingStage } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, history, profile, stage, language, cameraInteractions } = parsed.data;

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          reply: '',
          extracted_fields: {},
          missing_fields: [],
          onboarding_complete: false,
          mode: 'demo' as const,
          error: 'SARVAM_API_KEY not configured',
        } satisfies ChatApiResponse,
        { status: 200 }
      );
    }

    // Build voice-aware system prompt
    const systemPrompt = buildVoiceSystemPrompt({
      profile: profile || {},
      stage: (stage as OnboardingStage) || 'introduction',
      language: language || 'en-IN',
      cameraInteractions: cameraInteractions || [],
    });

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (limit to last 20)
    const recentHistory = history.slice(-20);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    messages.push({ role: 'user', content: message });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let sarvamResponse;
    try {
      sarvamResponse = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          model: 'sarvam-105b-conversations',
          messages,
          temperature: 0.4,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error('Sarvam fetch error:', fetchErr);
      return NextResponse.json(
        {
          reply: '',
          extracted_fields: {},
          missing_fields: [],
          onboarding_complete: false,
          mode: 'demo' as const,
          error: `Sarvam fetch failed: ${fetchErr instanceof Error ? fetchErr.message : 'unknown'}`,
        } satisfies ChatApiResponse,
        { status: 200 }
      );
    }
    clearTimeout(timeout);

    if (!sarvamResponse.ok) {
      const errText = await sarvamResponse.text();
      console.error('Sarvam API HTTP error:', sarvamResponse.status, errText);
      return NextResponse.json(
        {
          reply: '',
          extracted_fields: {},
          missing_fields: [],
          onboarding_complete: false,
          mode: 'demo' as const,
          error: `Sarvam API error: ${sarvamResponse.status}`,
        } satisfies ChatApiResponse,
        { status: 200 }
      );
    }

    const sarvamData = await sarvamResponse.json();
    const rawContent = sarvamData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        {
          reply: "I'm having trouble processing that. Could you try again?",
          extracted_fields: {},
          missing_fields: [],
          onboarding_complete: false,
          mode: 'ai' as const,
          error: 'Empty response from Sarvam',
        } satisfies ChatApiResponse,
        { status: 200 }
      );
    }

    // Parse JSON response
    let parsedResponse;
    try {
      let cleaned = rawContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }

      let jsonParsed;
      try {
        jsonParsed = JSON.parse(cleaned);
      } catch {
        // Try to find JSON in the text
        const jsonMatch = cleaned.match(/\{[\s\S]*"spoken_response"[\s\S]*\}/);
        if (jsonMatch) {
          jsonParsed = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try legacy format
          const legacyMatch = cleaned.match(/\{[\s\S]*"reply"[\s\S]*\}/);
          if (legacyMatch) {
            const legacy = JSON.parse(legacyMatch[0]);
            jsonParsed = {
              spoken_response: legacy.reply,
              extracted_fields: legacy.extracted_fields || {},
              missing_fields: legacy.missing_fields || [],
              onboarding_complete: legacy.onboarding_complete || false,
            };
          } else {
            throw new Error('No JSON found in response');
          }
        }
      }

      // Handle both new and legacy response formats
      if (jsonParsed.spoken_response) {
        parsedResponse = SarvamAgentResponseSchema.parse(jsonParsed);
      } else if (jsonParsed.reply) {
        // Legacy format → convert
        parsedResponse = SarvamAgentResponseSchema.parse({
          spoken_response: jsonParsed.reply,
          extracted_fields: jsonParsed.extracted_fields || {},
          missing_fields: jsonParsed.missing_fields || [],
          onboarding_complete: jsonParsed.onboarding_complete || false,
        });
      } else {
        throw new Error('Unrecognized response format');
      }
    } catch (parseError) {
      console.error('Failed to parse Sarvam response as JSON:', parseError, '\nRaw:', rawContent.substring(0, 300));
      const cleanReply = rawContent.replace(/\{[\s\S]*\}/, '').trim() || rawContent;
      return NextResponse.json(
        {
          reply: cleanReply,
          extracted_fields: {},
          missing_fields: [],
          onboarding_complete: false,
          mode: 'ai' as const,
        } satisfies ChatApiResponse,
        { status: 200 }
      );
    }

    const apiResponse: ChatApiResponse = {
      reply: parsedResponse.spoken_response,
      extracted_fields: parsedResponse.extracted_fields,
      missing_fields: parsedResponse.missing_fields,
      onboarding_complete: parsedResponse.onboarding_complete,
      mode: 'ai',
      language: parsedResponse.language,
      action: parsedResponse.action,
      current_stage: parsedResponse.current_stage,
      next_stage: parsedResponse.next_stage,
      needs_confirmation: parsedResponse.needs_confirmation,
    };

    return NextResponse.json(apiResponse);
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        reply: '',
        extracted_fields: {},
        missing_fields: [],
        onboarding_complete: false,
        mode: 'demo' as const,
        error: `API error: ${errorMessage}`,
      } satisfies ChatApiResponse,
      { status: 200 }
    );
  }
}
