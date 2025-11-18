import { tmdbApi } from './tmdbApi';
import { getUserAccountType } from '../utils/authHelpers'; // Import the helper

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

export interface AnimeMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  isAnime: boolean;
}

export class AnimeService {
  // Keywords that indicate anime content
  private static animeKeywords = [
    'anime', 'manga', 'japanese animation', 'studio ghibli', 
    'toei animation', 'madhouse', 'pierrot', 'bones', 'mappa',
    'demon slayer', 'attack on titan', 'naruto', 'one piece',
    'dragon ball', 'spirited away', 'attack on titan', 'akira', 'ghost in the shell'
  ];

  // Popular anime movie IDs (manually curated)
  private static popularAnimeIds = [
    129, // Spirited Away
    4935, // Howl's Moving Castle
    8392, // My Neighbor Totoro
    10494, // Perfect Blue
    11617, // Akira
    39323, // Demon Slayer: Mugen Train
    508947, // Your Name
    372058, // Your Name (alternative ID)
    380521, // A Silent Voice
    569094, // Spider-Man: Into the Spider-Verse
    324857, // Spider-Man: Into the Spider-Verse (alternative)
    14836, // The Girl Who Leapt Through Time
    37165, // The Secret World of Arrietty
    10515, // Ponyo
    13475, // Star Wars: The Clone Wars
    14160, // Up (Pixar - animation)
    12, // Finding Nemo
    585, // Monsters, Inc.
    863, // Toy Story
    1979, // Toy Story 2
    10193, // Toy Story 3
    315635, // Spider-Man: Into the Spider-Verse
    508943, // Luca
    508965, // Turning Red
    438631, // Dune (animated elements)
  ];

  static async getAnimeMovies(page: number = 1): Promise<any> {
    return this.getAnimeByGenre(16, page); // Default to all animation
  }

  static async getAnimeByGenre(genreId: number, page: number = 1): Promise<any> {
    try {
      // @ts-ignore
      const certificationFilter = await getCertificationFilter('movie');
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?with_genres=16,${genreId}&sort_by=popularity.desc&page=${page}&language=${getLanguage()}${certificationFilter}`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YjAxOTE1YTg3ZjZlZDA3MmNhZTgzMzY0NDA3M2E4MyIsIm5iZiI6MTc0ODcxNjc1NC4yNjIsInN1YiI6IjY4M2I0Y2QyOGQ3YmQzNGM0ODUzN2E4ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8rWKdMdxHYqZzOR-PSkfg6zk18PNvXNfMBYKJR6zEe8`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch anime movies by genre');
      
      const data = await response.json();
      
      const animeMovies = data.results
        .filter((movie: any) => this.isLikelyAnime(movie))
        .map((movie: any) => ({
          ...movie,
          isAnime: true
        }));

      return {
        ...data,
        results: animeMovies
      };
    } catch (error) {
      console.error('Error fetching anime movies by genre:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async getPopularAnime(): Promise<any> {
    try {
      // @ts-ignore
      const certificationFilter = await getCertificationFilter('movie');
      // Get movies by popular anime IDs
      const animePromises = this.popularAnimeIds.slice(0, 20).map(async (id) => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?language=${getLanguage()}${certificationFilter}`,
            {
              headers: {
                accept: 'application/json',
                Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YjAxOTE1YTg3ZjZlZDA3MmNhZTgzMzM2NDQwNzNhODMiLCJuYmYiOjE3NDg3MTY3NTQuMjYyLCJzdWIiOiI2ODNiNGNkMThkN2JkMzRjNDg1MzdhOGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.8rWKdMdxHYqZzOR-PSkfg6zk18PNvXNfMBYKJR6zEe8`
              }
            }
          );
          if (response.ok) {
            const movie = await response.json();
            return { ...movie, isAnime: true };
          }
        } catch (error) {
          console.error(`Error fetching anime movie ${id}:`, error);
        }
        return null;
      });

      const animeMovies = (await Promise.all(animePromises)).filter(movie => movie !== null);

      return {
        results: animeMovies,
        total_pages: 1,
        page: 1,
        total_results: animeMovies.length
      };
    } catch (error) {
      console.error('Error fetching popular anime:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async searchAnime(query: string, page: number = 1): Promise<any> {
    try {
      // @ts-ignore
      const certificationFilter = await getCertificationFilter('movie');
      const response = await tmdbApi.searchMovies(query, page);
      
      // Filter results to focus on anime-style content
      const animeResults = response.results
        .filter((movie: any) => this.isLikelyAnime(movie) || this.containsAnimeKeywords(movie))
        .map((movie: any) => ({
          ...movie,
          isAnime: true
        }));

      return {
        ...response,
        results: animeResults
      };
    } catch (error) {
      console.error('Error searching anime:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  private static isLikelyAnime(movie: any): boolean {
    // Check if it's animated
    const isAnimated = movie.genre_ids?.includes(16);
    
    // Check if it's from Japan or has anime-style characteristics
    const isJapanese = movie.original_language === 'ja';
    
    // Check if it's in our curated list
    const isInAnimeList = this.popularAnimeIds.includes(movie.id);
    
    // Check for anime keywords in title or overview
    const hasAnimeKeywords = this.containsAnimeKeywords(movie);
    
    return isAnimated && (isJapanese || isInAnimeList || hasAnimeKeywords);
  }

  private static containsAnimeKeywords(movie: any): boolean {
    const searchText = `${movie.title} ${movie.overview}`.toLowerCase();
    return this.animeKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  }

  static getAnimeGenres(): { id: number; name: string }[] {
    return [
      { id: 16, name: 'Animation' },
      { id: 12, name: 'Adventure' },
      { id: 14, name: 'Fantasy' },
      { id: 878, name: 'Science Fiction' },
      { id: 10751, name: 'Family' },
      { id: 35, name: 'Comedy' },
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' }
    ];
  }
}