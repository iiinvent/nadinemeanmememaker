import config from '../config';



export async function generateMemeText(theme: string): Promise<{ topText: string; bottomText: string }> {
  try {
    console.log('Generating meme text for theme:', theme);
    console.log('Using API key:', config.groqApiKey ? 'Present' : 'Missing');

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a witty meme creator that specializes in creating viral, relatable, and clever memes. You understand internet culture, current trends, and how to make people laugh. Your memes should be punchy, memorable, and follow classic meme formats.'
        },
        {
          role: 'user',
          content: `Create a hilarious meme about: ${theme}

Rules:
1. First line: Setup/Context (max 40 chars)
2. Second line: Punchline/Twist (max 40 chars)
3. Use classic meme formats (e.g., "When you...", "Nobody:", "Me:")
4. Make it relatable and funny
5. Keep it clean and appropriate

Respond with ONLY the two lines, one per line.`
        }
      ],
      temperature: 0.9,
      max_tokens: 100,
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Make the API call from the server side
    const response = await fetch('/api/generate-meme-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme, ...requestBody }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message.content;
    const lines = content.split('\n').filter(Boolean);

    if (lines.length < 2) {
      throw new Error('Invalid response format from AI');
    }

    return {
      topText: lines[0].trim(),
      bottomText: lines[1].trim(),
    };
  } catch (error) {
    console.error('Error generating meme text:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate meme text');
  }
}
