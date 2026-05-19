import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { handle } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const systemPrompt = `You are an elite social media growth analyst. 
The user is targeting the following creator/brand handle: "${handle}".

If this is a known public figure (e.g., Alex Hormozi, Justin Welsh, Naval), use your knowledge of their actual content strategy. If it is an unknown or generic handle, infer a highly plausible, aggressive B2B SaaS or growth marketing strategy for them.

You MUST return ONLY a valid JSON object. No markdown formatting, no conversational text. Use this exact schema:
{
  "name": "Formatted Name",
  "audience": "Realistic number with K or M (e.g., '142K')",
  "velocity": "Realistic growth percentage (e.g., '+3.4%')",
  "playbook": "2-3 sentences explaining their specific core content mechanics and psychological hooks.",
  "sequence": "A realistic quote or hook they would actually use in a high-performing post."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    const data = await response.json();
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("AI returned empty profile.");

    // Clean any markdown JSON wrappers Gemini might add
    rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    const profile = JSON.parse(rawText);

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Competitor Analysis Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}