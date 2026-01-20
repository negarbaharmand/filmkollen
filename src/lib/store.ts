// Global state: browseMovies, watchlist, watched, selectedMovie, loading, error
import type { TMDBMovie, DatabaseMovie } from "../types/movie";
import { getPopularMovies } from "../services/tmdbApi";
import { getAllMovies } from "../services/movieApi";

class Store {
  renderCallback: () => void;

  // TMDB API state
  popularMovies: TMDBMovie[] = [];
  browseMovies: TMDBMovie[] = [];
  
  // TODO: Add watchlist, watched, selectedMovie, loading, error states
  // watchlist: DatabaseMovie[] = [];
  // watched: DatabaseMovie[] = [];
  // selectedMovie: TMDBMovie | null = null;
  // loading: boolean = false;
  // error: string | null = null;
  
  // Database movie state - stores movies from backend for watchlist/watched -Ella
  watchlistMovies: DatabaseMovie[] = [];
  watchedMovies: DatabaseMovie[] = [];

  constructor() {
    this.renderCallback = () => {};
  }

  // ========== RENDER CALLBACK ==========
  
  setRenderCallback(renderApp: () => void) {
    this.renderCallback = renderApp;
  }

  triggerRender() {
    if (this.renderCallback) {
      this.renderCallback();
    }
  }

  // ========== POPULAR MOVIES ==========
  
  async loadPopularMovies() {
    try {
      this.popularMovies = await getPopularMovies(1);
      this.browseMovies = this.popularMovies;
      this.triggerRender();
    } catch (error) {
      console.error("Failed to load popular movies:", error);
      throw error;
    }
  }

  // ========== DATABASE MOVIES ==========
  // Fetches saved movies from backend and separates them by status -Ella
  async loadDatabaseMovies() {
    try {
      const allMovies = await getAllMovies();
      this.watchlistMovies = allMovies.filter(movie => movie.status === 'watchlist');
      this.watchedMovies = allMovies.filter(movie => movie.status === 'watched');
      this.triggerRender();
    } catch (error) {
      console.error("Failed to load database movies:", error);
    }
  }

  // Check if movie is in watchlist or watched
  // Used to display the correct text on the buttons -Ella
  isInWatchlist(tmdbId: number): boolean {
    return this.watchlistMovies.some(movie => movie.tmdb_id === tmdbId);
  }

  isWatched(tmdbId: number): boolean {
    return this.watchedMovies.some(movie => movie.tmdb_id === tmdbId);
  }
}

const store = new Store();

// Export bound methods for easier usage
export const loadPopularMovies = store.loadPopularMovies.bind(store);
export const setRenderCallback = store.setRenderCallback.bind(store);
export const triggerRender = store.triggerRender.bind(store);

// Export store instance for direct access if needed
export default store;