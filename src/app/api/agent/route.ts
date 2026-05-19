import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { concept } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const systemPrompt = `You are an elite, viral B2B LinkedIn ghostwriter. 
The user is going to give you a raw concept, a brain dump, or a trending news headline.
Your job is to transform this into a high-performing, engaging LinkedIn post.

STRICT RULES:
1. Write in short, punchy sentences. High readability.
2. Start with a strong, undeniable hook (or a contrarian stance).
3. Use line breaks to create "white space" so it is easy to skim.
4. DO NOT use emojis. DO NOT use hashtags. DO NOT sound like a generic AI.
5. Provide actionable value or a sharp insight at the end.
6. Return ONLY the post text. No introductory remarks.

Raw Concept/Trend to adapt:
"${concept}"`;

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
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) throw new Error("AI failed to generate a draft.");

    return NextResponse.json({ text: generatedText.trim() });
  } catch (error: any) {
    console.error("Agent Engine Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}