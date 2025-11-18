export interface UserPreference {
  genres: { [key: number]: number }; // genre_id -> weight
  actors: { [key: string]: number }; // actor_name -> weight
  directors: { [key: string]: number }; // director_name -> weight
  languages: { [key: string]: number }; // language -> weight
  decades: { [key: string]: number }; // decade -> weight
  ratings: { [key: string]: number }; // rating_range -> weight
}

export interface RecommendationScore {
  movieId: number;
  score: number;
  reasons: string[];
}

export class RecommendationService {
  private static readonly PREFERENCE_KEY = 'deltasilicon_preferences';
  private static readonly INTERACTION_KEY = 'deltasilicon_interactions';

  // Get user preferences
  static getUserPreferences(): UserPreference {
    const saved = localStorage.getItem(this.PREFERENCE_KEY);
    return saved ? JSON.parse(saved) : {
      genres: {},
      actors: {},
      directors: {},
      languages: {},
      decades: {},
      ratings: {}
    };
  }

  // Update preferences based on user interaction
  static updatePreferences(movie: any, interactionType: 'watch' | 'like' | 'search' | 'skip', weight: number = 1) {
    const preferences = this.getUserPreferences();
    const multiplier = this.getInteractionMultiplier(interactionType);
    const finalWeight = weight * multiplier;

    // Update genre preferences
    if (movie.genre_ids) {
      movie.genre_ids.forEach((genreId: number) => {
        preferences.genres[genreId] = (preferences.genres[genreId] || 0) + finalWeight;
      });
    }

    // Update language preferences
    if (movie.original_language) {
      preferences.languages[movie.original_language] = 
        (preferences.languages[movie.original_language] || 0) + finalWeight;
    }

    // Update decade preferences
    if (movie.release_date || movie.first_air_date) {
      const year = new Date(movie.release_date || movie.first_air_date).getFullYear();
      const decade = Math.floor(year / 10) * 10 + 's';
      preferences.decades[decade] = (preferences.decades[decade] || 0) + finalWeight;
    }

    // Update rating preferences
    if (movie.vote_average) {
      const ratingRange = this.getRatingRange(movie.vote_average);
      preferences.ratings[ratingRange] = (preferences.ratings[ratingRange] || 0) + finalWeight;
    }

    localStorage.setItem(this.PREFERENCE_KEY, JSON.stringify(preferences));
    this.recordInteraction(movie.id, interactionType);
  }

  // Get interaction multiplier
  private static getInteractionMultiplier(type: 'watch' | 'like' | 'search' | 'skip'): number {
    switch (type) {
      case 'watch': return 3.0;
      case 'like': return 2.5;
      case 'search': return 1.5;
      case 'skip': return -0.5;
      default: return 1.0;
    }
  }

  // Get rating range
  private static getRatingRange(rating: number): string {
    if (rating >= 8) return 'excellent';
    if (rating >= 7) return 'good';
    if (rating >= 6) return 'average';
    if (rating >= 5) return 'below_average';
    return 'poor';
  }

  // Record user interaction
  private static recordInteraction(movieId: number, type: string) {
    const interactions = JSON.parse(localStorage.getItem(this.INTERACTION_KEY) || '[]');
    interactions.push({
      movieId,
      type,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 interactions
    if (interactions.length > 1000) {
      interactions.splice(0, interactions.length - 1000);
    }
    
    localStorage.setItem(this.INTERACTION_KEY, JSON.stringify(interactions));
  }

  // Calculate recommendation score for a movie
  static calculateRecommendationScore(movie: any): RecommendationScore {
    const preferences = this.getUserPreferences();
    let score = 0;
    const reasons: string[] = [];

    // Genre scoring
    if (movie.genre_ids) {
      movie.genre_ids.forEach((genreId: number) => {
        const genreWeight = preferences.genres[genreId] || 0;
        if (genreWeight > 0) {
          score += genreWeight * 0.4; // 40% weight for genres
          reasons.push(`You like ${this.getGenreName(genreId)} content`);
        }
      });
    }

    // Language scoring
    if (movie.original_language) {
      const langWeight = preferences.languages[movie.original_language] || 0;
      if (langWeight > 0) {
        score += langWeight * 0.2; // 20% weight for language
        reasons.push(`You enjoy ${movie.original_language.toUpperCase()} content`);
      }
    }

    // Decade scoring
    if (movie.release_date || movie.first_air_date) {
      const year = new Date(movie.release_date || movie.first_air_date).getFullYear();
      const decade = Math.floor(year / 10) * 10 + 's';
      const decadeWeight = preferences.decades[decade] || 0;
      if (decadeWeight > 0) {
        score += decadeWeight * 0.15; // 15% weight for decade
        reasons.push(`You like ${decade} content`);
      }
    }

    // Rating scoring
    if (movie.vote_average) {
      const ratingRange = this.getRatingRange(movie.vote_average);
      const ratingWeight = preferences.ratings[ratingRange] || 0;
      if (ratingWeight > 0) {
        score += ratingWeight * 0.15; // 15% weight for rating
        reasons.push(`You prefer ${ratingRange} rated content`);
      }
    }

    // Popularity boost
    if (movie.popularity) {
      score += Math.log(movie.popularity) * 0.1; // 10% weight for popularity
    }

    return {
      movieId: movie.id,
      score,
      reasons: reasons.slice(0, 3) // Top 3 reasons
    };
  }

  // Get personalized recommendations
  static async getPersonalizedRecommendations(movies: any[]): Promise<any[]> {
    const scoredMovies = movies.map(movie => ({
      ...movie,
      recommendationScore: this.calculateRecommendationScore(movie)
    }));

    // Sort by recommendation score
    return scoredMovies.sort((a, b) => 
      b.recommendationScore.score - a.recommendationScore.score
    );
  }

  // Get genre name by ID
  private static getGenreName(genreId: number): string {
    const genreMap: { [key: number]: string } = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
      10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
      10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
      10767: 'Talk', 10768: 'War & Politics'
    };
    return genreMap[genreId] || 'Unknown';
  }

  // Clear all preferences (for settings reset)
  static clearPreferences() {
    localStorage.removeItem(this.PREFERENCE_KEY);
    localStorage.removeItem(this.INTERACTION_KEY);
  }
}