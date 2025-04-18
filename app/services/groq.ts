import config from '../config';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateMemeText(theme: string): Promise<{ topText: string; bottomText: string }> {
  try {
    console.log('Generating meme text for theme:', theme);
    console.log('Using API key:', config.groqApiKey ? 'Present' : 'Missing');

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Create a funny meme about: ${theme}. Generate two short lines, each under 50 characters. First line will be at the top of the meme, second line at the bottom. Make it humorous and relevant to the theme.`
        }
      ],
      temperature: 0.7,
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
