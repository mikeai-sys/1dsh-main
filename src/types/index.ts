export interface Movie {
  id: number;
  title?: string; // Made optional as it might be 'name' for series
  name?: string; // Added for series
  overview: string;
  poster_path: string | null; // Allow null
  backdrop_path: string | null; // Allow null
  release_date?: string; // Made optional
  first_air_date?: string; // Added for series
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title?: string; // Made optional
  original_name?: string; // Added for series
  popularity: number;
  video: boolean;
  genres?: Genre[];
  runtime?: number;
  production_companies?: ProductionCompany[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
}