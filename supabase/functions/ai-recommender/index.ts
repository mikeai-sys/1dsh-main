import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_KEY = '6b01915a87f6ed072cae833644073a83';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      throw new Error('Query is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in Supabase secrets.');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `You are an expert movie and TV show recommender for a streaming platform called DeltaSilicon.Hub. A user will provide a request, and you must suggest relevant content.
IMPORTANT: Your response MUST be a valid JSON object and nothing else. The JSON object should have a single key named 'recommendations'. The value should be an array of up to 5 objects, where each object has two keys: 'title' (string) and 'year' (number).

User request: "${query}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const recommendations = JSON.parse(responseText).recommendations;

    const movieDetailsPromises = recommendations.map(async (rec: { title: string; year: number }) => {
      const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(rec.title)}&primary_release_year=${rec.year}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      return searchData.results[0];
    });

    const movieDetails = (await Promise.all(movieDetailsPromises)).filter(Boolean);

    return new Response(JSON.stringify({ results: movieDetails }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});