import { NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { theme } = await request.json();

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a super fun and silly meme generator for kids! Your task is to create two lines for a meme that are EXTRA funny and playful. The first line goes at the top of the meme, the second line at the bottom. Rules:\n1. Each line can be up to 70 characters long\n2. Make it SUPER funny and unexpected - think like a kid!\n3. Use lots of wordplay, silly puns, and fun references that kids would love\n4. The bottom line should have an extra silly twist or surprise\n5. Keep it 100% kid-friendly and positive\n6. Use fun words like "WHOOSH!", "BOOM!", "SPLAT!", "AWESOME!" when appropriate\n7. Format response as exactly two lines separated by a newline\n8. Feel free to use emojis in your response!\n\nExample 1:\nWhen your pizza has pineapple 🍍\nSWEET DREAMS ARE MADE OF CHEESE! 🧀\n\nExample 2:\nMy homework ate my dog! 📚🐕\nPLOT TWIST: The dog was a bookworm! 📖'
          },
          {
            role: 'user',
            content: `Create a funny meme about: ${theme}`
          }
        ],
        temperature: 0.9,  // Increased for more creative responses
        max_tokens: 100,
        top_p: 0.9,       // Nucleus sampling for more diverse outputs
        frequency_penalty: 0.5,  // Reduce repetition
        presence_penalty: 0.5    // Encourage novel language
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API Error:', error);
      return NextResponse.json({ error: 'Failed to generate meme text' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in generate-meme-text route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
