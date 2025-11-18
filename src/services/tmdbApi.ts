import { getUserAccountType } from '../utils/authHelpers'; // Import the helper

export const API_KEY = '6b01915a87f6ed072cae833644073a83';
const BASE_URL = 'https://api.themoviedb.org/3';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
};

const getLanguage = () => {
  const lang = localStorage.getItem('deltasilicon_language') || 'en';
  const langMap: { [key: string]: string } = {
    en: 'en-US', fr: 'fr-FR', es: 'es-ES', ar: 'ar-SA',
    de: 'de-DE', it: 'it-IT', nl: 'nl-NL', sv: 'sv-SE',
  };
  return langMap[lang] || 'en-US';
};

// Helper to get certification filter based on account type
const getCertificationFilter = async (contentType: 'movie' | 'tv') => {
  const accountType = await getUserAccountType();
  if (accountType === 'kids') {
    if (contentType === 'movie') {
      return '&certification_country=US&certification.lte=PG'; // G, PG
    } else { // tv
      return '&certification_country=US&certification.lte=TV-G'; // TV-Y, TV-Y7, TV-G
    }
  }
  return ''; // No filter for adult accounts
};

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null; // Allow null
  backdrop_path: string | null; // Allow null
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null; // Allow null
  popularity: number;
  known_for_department: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null; // Allow null
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string | null; // Allow null
  known_for_department: string;
  popularity: number;
}

export const tmdbApi = {
  // Generic discover method
  discoverMovies: async (params: { [key: string]: string | number }, page: number = 1): Promise<MovieResponse> => {
    const certificationFilter = await getCertificationFilter('movie');
    const queryParams = new URLSearchParams({
      api_key: API_KEY,
      language: getLanguage(),
      page: page.toString(),
      ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, value.toString()])),
    });
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}${certificationFilter}`, options);
    if (!response.ok) throw new Error('Failed to discover movies');
    return response.json();
  },

  // Get trending movies
  getTrending: async (): Promise<MovieResponse> => {
    const certificationFilter = await getCertificationFilter('movie');
    const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=${getLanguage()}${certificationFilter}`, options);
    if (!response.ok) throw new Error('Failed to fetch trending movies');
    return response.json();
  },

  // Get popular movies
  getPopular: async (page: number = 1): Promise<MovieResponse> => {
    const certificationFilter = await getCertificationFilter('movie');
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${getLanguage()}&page=${page}${certificationFilter}`, options);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    return response.json();
  },

  // Get top rated movies
  getTopRated: async (page: number = 1): Promise<MovieResponse> => {
    const certificationFilter = await getCertificationFilter('movie');
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=${getLanguage()}&page=${page}${certificationFilter}`, options);
    if (!response.ok) throw new Error('Failed to fetch top rated movies');
    return response.json();
  },

  // Get now playing movies
  getNowPlaying: async (page: number = 1): Promise<MovieResponse> => {
    const certificationFilter = await getCertificationFilter('movie');
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=${getLanguage()}&page=${page}${certificationFilter}`, options);
    if (!response.ok) throw new Error('Failed to fetch now playing movies');
    return response.json();
  },

  // Search movies
  searchMovies: async (query: string, page: number = 1): Promise<MovieResponse> => {
    const certificationFilter = await getCertificationFilter('movie');
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=${getLanguage()}&query=${encodedQuery}&page=${page}${certificationFilter}`, options);
    if (!response.ok) throw new Error('Failed to search movies');
    return response.json();
  },

  // Get movie details
  getMovieDetails: async (movieId: number) => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${getLanguage()}`, options);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return response.json();
  },

  // Get movie credits (cast and crew)
  getMovieCredits: async (movieId: number): Promise<Credits> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=${getLanguage()}`, options);
    if (!response.ok) throw new Error('Failed to fetch movie credits');
    return response.json();
  },

  // Get series credits (cast and crew)
  getSeriesCredits: async (seriesId: number): Promise<Credits> => {
    const response = await fetch(`${BASE_URL}/tv/${seriesId}/credits?api_key=${API_KEY}&language=${getLanguage()}`, options);
    if (!response.ok) throw new Error('Failed to fetch series credits');
    return response.json();
  },

  // Get person details
  getPersonDetails: async (personId: number): Promise<Person> => {
    const response = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=${getLanguage()}`, options);
    if (!response.ok) throw new Error('Failed to fetch person details');
    return response.json();
  },

  // Get person movie credits
  getPersonMovieCredits: async (personId: number): Promise<{ cast: Movie[]; crew: Movie[] }> => {
    const response = await fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}&language=${getLanguage()}`, options);
    if (!response.ok) throw new Error('Failed to fetch person movie credits');
    return response.json();
  },

  // Get movie genres
  getGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${getLanguage()}`, options);
    if (!response.ok) throw new Error('Failed to fetch genres');
    return response.json();
  },

  // Get TV genres
  getTvGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=${getLanguage()}`, options);
    if (!response.ok) throw new Error('Failed to fetch TV genres');
    return response.json();
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId: number, page: number = 1): Promise<MovieResponse> => {
    const certificationFilter = await getCertificationFilter('movie');
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${getLanguage()}&with_genres=${genreId}&page=${page}${certificationFilter}`, options);
    if (!response.ok) throw new Error('Failed to fetch movies by genre');
    return response.json();
  },

  // Helper function to get full image URL
  getImageUrl: (path: string | null, size: string = 'w500'): string | null => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  },

  // Helper function to get backdrop URL
  getBackdropUrl: (path: string | null, size: string = 'w1280'): string | null => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  }
};