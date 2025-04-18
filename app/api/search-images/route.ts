import { createApi } from 'unsplash-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();
  const page = searchParams.get('page') || '1';

  if (!query) {
    return new Response('Query parameter is required', { status: 400 });
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return new Response('Unsplash API key not configured', { status: 500 });
  }

  try {
    const unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY,
    });

    const result = await unsplash.search.getPhotos({
      query: query.toLowerCase(), // Convert to lowercase for better matches
      page: parseInt(page),
      perPage: 30, // Increase results per page for more variety
      orientation: 'squarish',
      orderBy: 'relevant', // Prioritize relevance over recency
    });

    if (result.errors) {
      console.error('Unsplash API error:', result.errors);
      return new Response('Error fetching images', { status: 500 });
    }

    return new Response(JSON.stringify(result.response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return new Response('Error fetching images', { status: 500 });
  }
}
