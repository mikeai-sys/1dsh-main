import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

    const prompt = `You are an expert movie and TV show recommender for a streaming platform called DeltaSilicon.Hub. A user will provide a request, and you must suggest relevant content.
IMPORTANT: Your response MUST be a valid JSON object and nothing else. The JSON object should have a single key named 'recommendations'. The value should be an array of up to 5 objects, where each object has three keys: 'title' (string), 'year' (number), and 'type' (string, either 'movie' or 'tv').

User request: "${query}"`;

    // Call Gemini API using fetch
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`Gemini API request failed: ${geminiResponse.status} ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    
    let recommendations;
    try {
      recommendations = JSON.parse(responseText).recommendations;
    } catch (e) {
      throw new Error(`Failed to parse JSON from Gemini response: ${e.message}. Response was: ${responseText}`);
    }

    if (!Array.isArray(recommendations)) {
      throw new Error('Gemini response did not contain a "recommendations" array.');
    }

    const movieDetailsPromises = recommendations.map(async (rec: { title: string; year: number; type: string }) => {
      try {
        const searchType = rec.type === 'tv' ? 'tv' : 'movie';
        const yearParam = searchType === 'tv' ? 'first_air_date_year' : 'primary_release_year';
        const searchUrl = `https://api.themoviedb.org/3/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(rec.title)}&${yearParam}=${rec.year}`;
        
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) return null;

        const searchData = await searchResponse.json();
        const result = searchData.results[0];
        
        if (result) {
          if (searchType === 'tv') {
            result.title = result.name;
            result.type = 'series'; // Use 'series' to match client-side type
          } else {
            result.type = 'movie';
          }
        }
        return result;
      } catch {
        return null;
      }
    });

    const movieDetails = (await Promise.all(movieDetailsPromises)).filter(Boolean);

    return new Response(JSON.stringify({ results: movieDetails }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error); // Log the full error on the server
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});