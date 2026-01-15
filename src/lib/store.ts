// Global state: browseMovies, watchlist, watched, selectedMovie, loading, error
import type { TMDBMovie } from "../types/movie";
import { getPopularMovies } from "../services/tmdbApi";

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
}

const store = new Store();

// Export bound methods for easier usage
export const loadPopularMovies = store.loadPopularMovies.bind(store);
export const setRenderCallback = store.setRenderCallback.bind(store);
export const triggerRender = store.triggerRender.bind(store);

// Export store instance for direct access if needed
export default store;