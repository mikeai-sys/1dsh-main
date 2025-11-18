import { getUserAccountType } from '../utils/authHelpers'; // Import the helper
import { API_KEY } from './tmdbApi'; // Import API_KEY from tmdbApi

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

export interface Series {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  original_name: string;
  popularity: number;
  origin_country: string[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  still_path: string;
  runtime: number;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string;
  episodes?: Episode[];
}

export class SeriesService {
  static async getTrendingSeries(): Promise<any> {
    try {
      const certificationFilter = await getCertificationFilter('tv');
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=${getLanguage()}${certificationFilter}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch trending series');
      return response.json();
    } catch (error) {
      console.error('Error fetching trending series:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async getPopularSeries(page: number = 1): Promise<any> {
    try {
      const certificationFilter = await getCertificationFilter('tv');
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=${getLanguage()}&page=${page}${certificationFilter}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch popular series');
      return response.json();
    } catch (error) {
      console.error('Error fetching popular series:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async getTopRatedSeries(page: number = 1): Promise<any> {
    try {
      const certificationFilter = await getCertificationFilter('tv');
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=${getLanguage()}&page=${page}${certificationFilter}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch top rated series');
      return response.json();
    } catch (error) {
      console.error('Error fetching top rated series:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async getOnTheAirSeries(page: number = 1): Promise<any> {
    try {
      const certificationFilter = await getCertificationFilter('tv');
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&language=${getLanguage()}&page=${page}${certificationFilter}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch on the air series');
      return response.json();
    } catch (error) {
      console.error('Error fetching on the air series:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async searchSeries(query: string, page: number = 1): Promise<any> {
    try {
      const certificationFilter = await getCertificationFilter('tv');
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=${getLanguage()}&query=${encodedQuery}&page=${page}${certificationFilter}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to search series');
      return response.json();
    } catch (error) {
      console.error('Error searching series:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async getSeriesByGenre(genreId: number, page: number = 1): Promise<any> {
    try {
      const certificationFilter = await getCertificationFilter('tv');
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=${getLanguage()}&with_genres=${genreId}&page=${page}${certificationFilter}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch series by genre');
      return response.json();
    } catch (error) {
      console.error('Error fetching series by genre:', error);
      return { results: [], total_pages: 0, page: 1 };
    }
  }

  static async getSeriesDetails(seriesId: number): Promise<Series> {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}&language=${getLanguage()}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch series details');
      return response.json();
    } catch (error) {
      console.error('Error fetching series details:', error);
      throw error;
    }
  }

  static async getSeasonDetails(seriesId: number, seasonNumber: number): Promise<Season> {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=${getLanguage()}`,
        {
          headers: {
            accept: 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch season details');
      return response.json();
    } catch (error) {
      console.error('Error fetching season details:', error);
      throw error;
    }
  }

  static async getAllEpisodes(seriesId: number): Promise<Episode[]> {
    try {
      const seriesDetails = await this.getSeriesDetails(seriesId);
      const allEpisodes: Episode[] = [];

      // Fetch all seasons (skip season 0 which is usually specials)
      for (let seasonNum = 1; seasonNum <= (seriesDetails.number_of_seasons || 1); seasonNum++) {
        try {
          const season = await this.getSeasonDetails(seriesId, seasonNum);
          if (season.episodes) {
            allEpisodes.push(...season.episodes);
          }
        } catch (error) {
          console.error(`Error fetching season ${seasonNum}:`, error);
        }
      }

      return allEpisodes.sort((a, b) => {
        if (a.season_number !== b.season_number) {
          return a.season_number - b.season_number;
        }
        return a.episode_number - b.episode_number;
      });
    } catch (error) {
      console.error('Error fetching all episodes:', error);
      return [];
    }
  }

  static getImageUrl(path: string | null, size: string = 'w500'): string | null {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  }

  static getEpisodeStreamUrl(seriesId: number, seasonNumber: number, episodeNumber: number): string {
    const activeService = localStorage.getItem('deltasilicon_active_service') || 'vidsrc';
    const baseUrls: { [key: string]: string } = {
      vidsrc: 'https://vidsrc-embed.ru',
      vidfast: 'https://vidfast.net',
      vidlink: 'https://vidlink.pro',
      videasy: 'https://videasy.io'
    };
    
    const baseUrl = baseUrls[activeService] || baseUrls.vidsrc;
    return `${baseUrl}/embed/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
  }
}