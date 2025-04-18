import { createApi } from 'unsplash-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';

  if (!query?.trim()) {
    return new Response('Query parameter is required', { status: 400 });
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return new Response('Unsplash API key not configured', { status: 500 });
  }

  try {
    const unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY,
    });

    // Clean up and process the query
    const processedQuery = query
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space

    // Add some context words for better image results
    const enhancedQuery = `${processedQuery} photo clear visible`;

    const result = await unsplash.search.getPhotos({
      query: enhancedQuery,
      page: parseInt(page),
      perPage: 20, // Reduced for more focused results
      orientation: 'squarish',
      orderBy: 'relevant',
      contentFilter: 'high', // Get high-quality images
    });

    if (!result?.response?.results || result.errors) {
      console.error('Unsplash API error:', result.errors || 'No results');
      return new Response('No images found', { status: 404 });
    }

    // Filter out any results without regular URLs
    const filteredResults = result.response.results.filter(photo => photo.urls?.regular);

    if (filteredResults.length === 0) {
      return new Response('No suitable images found', { status: 404 });
    }

    return new Response(JSON.stringify({ ...result.response, results: filteredResults }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return new Response('Error fetching images', { status: 500 });
  }
}
