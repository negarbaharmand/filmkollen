// Global state: browseMovies, watchlist, watched, selectedMovie, loading, error
import type { TMDBMovie, Movie } from "../types/movie";
import { getPopularMovies, getPosterUrl } from "../services/tmdbApi";
import { getAllMovies, addMovie, updateMovie, deleteMovie, findMovieByTmdbId } from "../services/movieApi";

class Store {
  renderCallback: () => void;

  // TMDB API state
  popularMovies: TMDBMovie[] = [];
  browseMovies: TMDBMovie[] = [];
  
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

  // ========== POPULAR MOVIES ==========
  //Here we load popular movies from TMDB API
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
  // Load watchlist and watched movies from database
  async loadDatabaseMovies() {
    try {
      const allMovies = await getAllMovies();
      this.watchlistMovies = allMovies.filter(movie => movie.status === 'watchlist');
      this.watchedMovies = allMovies.filter(movie => movie.status === 'watched');
    } catch (error) {
      console.error("Failed to load database movies:", error);
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

  // ========== WATCHLIST ACTIONS ==========
  
  async toggleWatchlist(movie: TMDBMovie): Promise<void> {
    try {
      const existing = await findMovieByTmdbId(movie.id);
      
      if (existing?.status === 'watchlist') {
        // Remove from watchlist
        await deleteMovie(existing.id);
        this.watchlistMovies = this.watchlistMovies.filter(m => m.tmdb_id !== movie.id);
      } else if (!existing) {
        // Add to watchlist (only if not in database)
        const savedMovie = await addMovie({
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster || '',
          release_date: movie.releaseYear as any, 
          vote_average: Number(movie.rating) ?? 0,
          overview: movie.overview || '',
          status: 'watchlist'
        });
        this.watchlistMovies.push(savedMovie);
      }
      // If watched, do nothing
      
      this.triggerRender();
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
      throw error;
    }
  }

  // ========== WATCHED ACTIONS ==========
  
  async toggleWatched(movie: TMDBMovie): Promise<void> {
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
        const savedMovie = await addMovie({
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster || '',
          release_date: movie.releaseYear as any, 
          vote_average: Number(movie.rating) ?? 0,
          overview: movie.overview || '',
          status: 'watched'
        });
        this.watchedMovies.push(savedMovie);
      }
      
      this.triggerRender();
    } catch (error) {
      console.error("Failed to toggle watched:", error);
      throw error;
    }
  }
}

const store = new Store();

// Export bound methods for easy use
export const loadPopularMovies = store.loadPopularMovies.bind(store);
export const loadDatabaseMovies = store.loadDatabaseMovies.bind(store);
export const setRenderCallback = store.setRenderCallback.bind(store);
export const triggerRender = store.triggerRender.bind(store);
export const toggleWatchlist = store.toggleWatchlist.bind(store);
export const toggleWatched = store.toggleWatched.bind(store);

export default store;