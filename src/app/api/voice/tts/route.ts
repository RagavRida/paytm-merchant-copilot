import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Language → bulbul:v4-flash speaker mapping
const SPEAKER_MAP: Record<string, string> = {
  'en-IN': 'simran_en_customer',
  'hi-IN': 'ritu_hi_customer',
  'te-IN': 'kavitha_te_conversation',
  'ta-IN': 'gokul_ta_narration',
  'kn-IN': 'chaitra_kn_conversation',
  'ml-IN': 'simran_en_customer', // fallback
  'mr-IN': 'ritu_mr_narration',
  'bn-IN': 'roopa_bn_conversational',
  'gu-IN': 'pooja_gu_conversational',
  'pa-IN': 'anand_pa_conversation',
  'od-IN': 'simran_en_customer', // fallback
};

// TTS-supported language codes
const TTS_LANGUAGES = new Set([
  'en-IN', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN',
  'gu-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'pa-IN', 'od-IN',
]);

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { audio: '', content_type: 'audio/wav', error: 'SARVAM_API_KEY not configured' },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { text, language, speaker } = body as {
      text: string;
      language: string;
      speaker?: string;
    };

    if (!text) {
      return NextResponse.json(
        { audio: '', content_type: 'audio/wav', error: 'No text provided' },
        { status: 400 }
      );
    }

    // Ensure language is TTS-supported, fallback to en-IN
    const targetLang = TTS_LANGUAGES.has(language) ? language : 'en-IN';
    const selectedSpeaker = speaker || SPEAKER_MAP[targetLang] || 'simran_en_customer';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let sarvamResponse;
    try {
      sarvamResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          text: text.substring(0, 2500), // Max 2500 chars
          target_language_code: targetLang,
          speaker: selectedSpeaker,
          model: 'bulbul:v4-flash',
          enable_preprocessing: true,
          speech_sample_rate: 24000,
          pace: 1.0,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error('TTS fetch error:', fetchErr);
      return NextResponse.json(
        { audio: '', content_type: 'audio/wav', error: `TTS fetch failed: ${fetchErr instanceof Error ? fetchErr.message : 'unknown'}` },
        { status: 200 }
      );
    }
    clearTimeout(timeout);

    if (!sarvamResponse.ok) {
      const errText = await sarvamResponse.text();
      console.error('TTS API error:', sarvamResponse.status, errText);
      return NextResponse.json(
        { audio: '', content_type: 'audio/wav', error: `TTS API error: ${sarvamResponse.status} - ${errText}` },
        { status: 200 }
      );
    }

    const data = await sarvamResponse.json();
    const audioBase64 = data.audios?.[0] || '';

    return NextResponse.json({
      audio: audioBase64,
      content_type: 'audio/wav',
    });
  } catch (error) {
    console.error('TTS route error:', error);
    return NextResponse.json(
      { audio: '', content_type: 'audio/wav', error: `TTS error: ${error instanceof Error ? error.message : 'unknown'}` },
      { status: 200 }
    );
  }
}
