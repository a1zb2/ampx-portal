import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, tone, spice, useBroetry } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'System Error: GEMINI_API_KEY is not configured in your local .env.local file.' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an elite LinkedIn ghostwriter and network growth strategist. Your purpose is to turn raw, fragmented technical concepts into high-converting, viral content assets.

Operational Telemetry Parameters:
- Conversational Level: ${tone}/100 (0 = highly formal/academic framework, 100 = completely raw, blunt, and conversational style).
- Spice Matrix Level: ${spice}/100 (0 = extremely safe corporate PR speech, 100 = highly provocative, raw, contrarian hot takes).
- Formatting Constraint: ${
      useBroetry 
        ? 'CRITICAL: Execute "Broetry Mode". Write punchy, single-sentence lines. Every single sentence (or maximum 2 short clauses) MUST be separated by a double line break to generate maximum mobile viewport scrolling depth.' 
        : 'Standard compact editorial paragraphs.'
    }

Strict Language Constraints:
- BANNED WORDS: Never use corporate filter phrases like "delve", "synergy", "unleash", "excited to share", "heartprinted", "more than ever before", or "game-changer".
- Hook Requirement: The first sentence must be an absolute scroll-stopper. State a definitive, undeniable fact, or a sharp, contrarian stance. No introductory fluff.
- Outro Requirement: End with a low-friction, high-engagement prompt or open-ended statement that naturally forces industry peers to drop perspective in the comment section.`;

    // Direct fetch pipeline to the requested Gemini 3.1 Flash-Lite model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nHere is the target source text concept sequence to synthesize:\n"${text}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const draft = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!draft) {
      return NextResponse.json({ error: 'Failed to extract valid generation token matrix from model candidates.' }, { status: 500 });
    }

    return NextResponse.json({ draft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}