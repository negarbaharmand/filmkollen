// src/lib/store.ts – exempel
// Importera types eller interfaces som behövs!
import type { Movie } from "../types/movie";


  class Store {
    private state: { watchlist: Movie[] } = { watchlist: [] };
    private renderCallback: (() => void) | null = null;

    // Definera metoder för att hantera state
    setWatchlist(movies: Movie[]) {
      this.state.watchlist = movies;
      this.triggerRender(); // Viktigt: uppdatera UI när state ändras
    }

    getWatchlist() {
      return this.state.watchlist;
    }


    setRenderCallback(renderApp: () => void) {
      this.renderCallback = renderApp;
    }

    private triggerRender() {
      this.renderCallback?.();
    }
  }

const store = new Store();
// Exportera funktioner för att hantera state
export const setWatchlist = store.setWatchlist.bind(store);
export const getWatchlist = store.getWatchlist.bind(store);
export const setRenderCallback = store.setRenderCallback.bind(store);
