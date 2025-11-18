export interface User {
  name: string;
  loginDate: string;
}

export interface WatchHistory {
  movieId: number;
  title: string;
  poster_path: string;
  watchedAt: string;
  progress?: number;
  type: 'movie' | 'series' | 'anime';
}

export interface FavoriteMovie {
  movieId: number;
  title: string;
  poster_path: string;
  addedAt: string;
  vote_average: number;
  release_date: string;
  type: 'movie' | 'series' | 'anime';
}

export interface UserSettings {
  theme: 'dark' | 'light';
  autoplay: boolean;
  quality: 'auto' | 'HD' | '4K';
  language: string;
  notifications: boolean;
  streamingService: string;
}

export class UserService {
  private static readonly USER_KEY = 'deltasilicon_user';
  private static readonly HISTORY_KEY = 'deltasilicon_history';
  private static readonly FAVORITES_KEY = 'deltasilicon_favorites';
  private static readonly SETTINGS_KEY = 'deltasilicon_settings';

  // User Management
  static login(name: string): User {
    const user: User = {
      name: name.trim(),
      loginDate: new Date().toISOString()
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  static logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Watch History
  static addToHistory(item: any, type: 'movie' | 'series' | 'anime' = 'movie'): void {
    const history = this.getWatchHistory();
    const existingIndex = history.findIndex(historyItem => historyItem.movieId === item.id);
    
    const historyItem: WatchHistory = {
      movieId: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      watchedAt: new Date().toISOString(),
      type
    };

    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex] = historyItem;
    } else {
      // Add new entry at the beginning
      history.unshift(historyItem);
    }

    // Keep only last 50 items
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(limitedHistory));
  }

  static getWatchHistory(): WatchHistory[] {
    const historyData = localStorage.getItem(this.HISTORY_KEY);
    return historyData ? JSON.parse(historyData) : [];
  }

  static clearHistory(): void {
    localStorage.removeItem(this.HISTORY_KEY);
  }

  static removeFromHistory(movieId: number): void {
    const history = this.getWatchHistory();
    const filteredHistory = history.filter(item => item.movieId !== movieId);
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filteredHistory));
  }

  // Favorites
  static addToFavorites(item: any, type: 'movie' | 'series' | 'anime' = 'movie'): void {
    const favorites = this.getFavorites();
    const exists = favorites.some(fav => fav.movieId === item.id);
    
    if (!exists) {
      const favoriteItem: FavoriteMovie = {
        movieId: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        addedAt: new Date().toISOString(),
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        type
      };
      
      favorites.unshift(favoriteItem);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  static removeFromFavorites(movieId: number): void {
    const favorites = this.getFavorites();
    const filteredFavorites = favorites.filter(fav => fav.movieId !== movieId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filteredFavorites));
  }

  static getFavorites(): FavoriteMovie[] {
    const favoritesData = localStorage.getItem(this.FAVORITES_KEY);
    return favoritesData ? JSON.parse(favoritesData) : [];
  }

  static isFavorite(movieId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.movieId === movieId);
  }

  static clearFavorites(): void { // Added clearFavorites method
    localStorage.removeItem(this.FAVORITES_KEY);
  }

  // Settings
  static getSettings(): UserSettings {
    const settingsData = localStorage.getItem(this.SETTINGS_KEY);
    return settingsData ? JSON.parse(settingsData) : {
      theme: 'dark',
      autoplay: true,
      quality: 'auto',
      language: 'en',
      notifications: true,
      streamingService: 'vidsrc'
    };
  }

  static updateSettings(settings: Partial<UserSettings>): void {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
    
    // Apply theme changes immediately
    if (settings.theme) {
      this.applyTheme(settings.theme);
    }
  }

  static resetSettings(): void {
    localStorage.removeItem(this.SETTINGS_KEY);
    this.applyTheme('dark'); // Reset to dark theme
  }

  static applyTheme(theme: 'dark' | 'light'): void {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }

  // Initialize theme on load
  static initializeTheme(): void {
    const settings = this.getSettings();
    this.applyTheme(settings.theme);
  }
}

// Initialize theme when service loads
UserService.initializeTheme();