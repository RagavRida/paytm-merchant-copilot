import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { transcript: '', language_code: 'unknown', language_probability: 0, error: 'SARVAM_API_KEY not configured' },
        { status: 200 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) || 'unknown';

    if (!audioFile) {
      return NextResponse.json(
        { transcript: '', language_code: 'unknown', language_probability: 0, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Build form data for Sarvam STT
    const sarvamForm = new FormData();
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type || 'audio/webm' });
    const fileName = audioFile.name || 'recording.webm';
    sarvamForm.append('file', audioBlob, fileName);
    sarvamForm.append('model', 'saaras:v4');
    sarvamForm.append('language_code', language === 'unknown' ? 'unknown' : language);
    sarvamForm.append('mode', 'transcribe');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let sarvamResponse;
    try {
      sarvamResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
        },
        body: sarvamForm,
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error('STT fetch error:', fetchErr);
      return NextResponse.json(
        { transcript: '', language_code: 'unknown', language_probability: 0, error: `STT fetch failed: ${fetchErr instanceof Error ? fetchErr.message : 'unknown'}` },
        { status: 200 }
      );
    }
    clearTimeout(timeout);

    if (!sarvamResponse.ok) {
      const errText = await sarvamResponse.text();
      console.error('STT API error:', sarvamResponse.status, errText);
      return NextResponse.json(
        { transcript: '', language_code: 'unknown', language_probability: 0, error: `STT API error: ${sarvamResponse.status} - ${errText}` },
        { status: 200 }
      );
    }

    const data = await sarvamResponse.json();

    return NextResponse.json({
      transcript: data.transcript || '',
      language_code: data.language_code || 'unknown',
      language_probability: data.language_probability || 0,
    });
  } catch (error) {
    console.error('STT route error:', error);
    return NextResponse.json(
      { transcript: '', language_code: 'unknown', language_probability: 0, error: `STT error: ${error instanceof Error ? error.message : 'unknown'}` },
      { status: 200 }
    );
  }
}
