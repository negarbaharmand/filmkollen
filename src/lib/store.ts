// Global state: watchlist, watched
import type { TMDBMovie, Movie } from "../types/movie";
import { addMovie, updateMovie, deleteMovie, findMovieByTmdbId, getMoviesByStatus } from "../services/movieApi";

class Store {
  renderCallback: () => void;

  // Database movie state - movies saved in backend
  watchlistMovies: Movie[] = [];
  watchedMovies: Movie[] = [];

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

  // ========== STATUS CHECKS ==========
  // Check if a movie is in watchlist or watched by tmdb_id
  isInWatchlist(tmdbId: number): boolean {
    return this.watchlistMovies.some(movie => movie.tmdb_id === tmdbId);
  }

  isWatched(tmdbId: number): boolean {
    return this.watchedMovies.some(movie => movie.tmdb_id === tmdbId);
  }

  // ========== INITIALIZATION ==========
  
  async loadInitialState(): Promise<void> {
    try {
      const [watchlistData, watchedData] = await Promise.all([
        getMoviesByStatus('watchlist'),
        getMoviesByStatus('watched')
      ]);
      
      this.watchlistMovies = watchlistData.movies;
      this.watchedMovies = watchedData.movies;
    } catch (error) {
      console.error("Failed to load initial state:", error);
    }
  }

  // ========== WATCHLIST ACTIONS ==========
  
  async toggleWatchlist(movie: TMDBMovie, shouldRender: boolean = true): Promise<{ success: boolean; alreadyWatched?: boolean }> {
    try {
      const existing = await findMovieByTmdbId(movie.id);
      
      if (existing?.status === 'watchlist') {
        // Remove from watchlist
        await deleteMovie(existing.id);
        this.watchlistMovies = this.watchlistMovies.filter(m => m.tmdb_id !== movie.id);
      } else if (existing?.status === 'watched') {
        // Already watched - return flag instead of doing nothing
        return { success: false, alreadyWatched: true };
      } else if (!existing) {
        // Add to watchlist (only if not in database)
        const savedMovie = await addMovie(movie, 'watchlist');
        this.watchlistMovies.push(savedMovie);
      }
      
      if (shouldRender) {
        this.triggerRender();
      }
      
      return { success: true };
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
      throw error;
    }
  }

  // ========== WATCHED ACTIONS ==========
  
  async toggleWatched(movie: TMDBMovie, shouldRender: boolean = true): Promise<void> {
    try {
      const existing = await findMovieByTmdbId(movie.id);
      
      if (existing?.status === 'watched') {
        // Remove from watched
        await deleteMovie(existing.id);
        this.watchedMovies = this.watchedMovies.filter(m => m.tmdb_id !== movie.id);
      } else if (existing?.status === 'watchlist') {
        // Move from watchlist to watched
        const updated = await updateMovie(existing.id, {
          status: 'watched',
          date_watched: new Date().toISOString()
        });
        this.watchlistMovies = this.watchlistMovies.filter(m => m.tmdb_id !== movie.id);
        this.watchedMovies.push(updated);
      } else {
        // Add as watched
        const savedMovie = await addMovie(movie, 'watched');
        this.watchedMovies.push(savedMovie);
      }
      
      if (shouldRender) {
        this.triggerRender();
      }
    } catch (error) {
      console.error("Failed to toggle watched:", error);
      throw error;
    }
  }
}

const store = new Store();

// Export bound methods for easy use
export const setRenderCallback = store.setRenderCallback.bind(store);
export const toggleWatchlist = store.toggleWatchlist.bind(store);
export const toggleWatched = store.toggleWatched.bind(store);
export const loadInitialState = store.loadInitialState.bind(store);

export default store;