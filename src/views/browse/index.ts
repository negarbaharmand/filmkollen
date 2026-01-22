// src/views/browse/index.ts
import type { TMDBMovie } from "../../types/movie";
import { getPopularMovies, searchMovies } from "../../services/tmdbApi";
import { renderSearch } from "../../components/ search";
import { MovieCard } from "../../components/movieCard";
import { attachDescriptionState } from "../../lib/helpers";
import { openMovieDetailsModal } from "../../components/movieDetailsModal";
import { toggleWatchlist, toggleWatched } from "../../lib/store"; 


//commented code is used to quickly add items to watched list for easier testing, to be deleted later on

function attachCardInteractions(root: HTMLElement, movies: TMDBMovie[]): void {
  const cards = root.querySelectorAll<HTMLElement>(".movie-card");

  cards.forEach((card, index) => {
    const movie = movies[index];
    if (!movie) return;

    // Details button
    const detailsBtn = card.querySelector<HTMLButtonElement>(
      '.movie-card__btn[data-action="details"]'
    );
    detailsBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      openMovieDetailsModal(movie);
    });

    // Watchlist button
    const watchlistBtn = card.querySelector<HTMLButtonElement>(
      '.movie-card__btn[data-action="watchlist"]'
    );
    watchlistBtn?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const button = event.currentTarget as HTMLButtonElement;
      const originalText = button.textContent;
      
      try {
        // Optimistically update the button
        const isCurrentlyInWatchlist = button.textContent?.trim() === '-';
        button.textContent = isCurrentlyInWatchlist ? '+' : '-';
        button.disabled = true;
        
        await toggleWatchlist(movie, false); // Don't trigger render
        
        button.disabled = false;
      } catch (error) {
        console.error("Failed to toggle watchlist:", error);
        // Revert on error
        button.textContent = originalText;
        button.disabled = false;
      }
    });

    // Watched button
    const watchedBtn = card.querySelector<HTMLButtonElement>(
      '.movie-card__btn[data-action="watched"]'
    );
    watchedBtn?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const button = event.currentTarget as HTMLButtonElement;
      const originalHTML = button.innerHTML;
      
      try {
        // Optimistically update the button
        const isCurrentlyWatched = button.innerHTML.includes('Unwatched');
        button.innerHTML = isCurrentlyWatched 
          ? '<i class="fa-solid fa-eye fa-xl"></i> Watched'
          : '<i class="fa-solid fa-eye fa-xl"></i> Unwatched';
        button.disabled = true;
        
        await toggleWatched(movie, false); // Don't trigger render
        
        button.disabled = false;
      } catch (error) {
        console.error("Failed to toggle watched:", error);
        // Revert on error
        button.innerHTML = originalHTML;
        button.disabled = false;
      }
    });
  });
}

function renderSplit(topRoot: HTMLElement, restRoot: HTMLElement, movies: TMDBMovie[]) {
  // Filter out movies without a poster so we only render titles that have artwork
  const moviesWithPoster = movies.filter((movie) => movie.poster);

  const top5 = moviesWithPoster.slice(0, 5);
  const rest = moviesWithPoster.slice(5);

  topRoot.innerHTML =
    top5.length > 0
      ? top5.map((movie, index) => MovieCard(movie, { showDetailsButton: true, showPosition: true, position: index })).join("")
      : '<p class="empty-state">No movies found</p>';
  restRoot.innerHTML = rest.length > 0 ? rest.map((movie, index) => MovieCard(movie, { showDetailsButton: true, position: index + 5 })).join("") : "";

  attachDescriptionState();
  attachCardInteractions(topRoot, top5);
  attachCardInteractions(restRoot, rest);
}

function renderError(root: HTMLElement, message: string) {
    root.innerHTML = `<p class="error-state" role="alert">${message}</p>`;
}

export default function browse(): HTMLElement {
    const root = document.createElement("main");
    root.className = "browse";

    root.innerHTML = `
        <section class="browse__section browse__section--top">
            <div class="browse__hint" aria-hidden="true">
                <span class="browse__hint-text">Swipe to see more</span>
                <span class="browse__hint-arrow">⟶</span>
            </div>
            <div id="top5" class="movie-flex" aria-live="polite"></div>
        </section>

        <section class="browse__section browse__section--search">
            <div class="browse__search">
                <div id="search-root"></div>
            </div>
        </section>

        <section class="browse__section">
            <div id="rest" class="movie-grid" aria-live="polite"></div>
        </section>
    `;

    const topRoot = root.querySelector<HTMLElement>("#top5")!;
    const restRoot = root.querySelector<HTMLElement>("#rest")!;
    const searchRoot = root.querySelector<HTMLElement>("#search-root")!;

    let popularCache: TMDBMovie[] = [];

    const loadPopular = async () => {
        topRoot.innerHTML = "Loading...";
        restRoot.innerHTML = "";
        try {
            popularCache = await getPopularMovies(1);
            renderSplit(topRoot, restRoot, popularCache);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load movies";
            renderError(topRoot, `Error: ${errorMessage}`);
            restRoot.innerHTML = "";
        }
    };

    void loadPopular();

    renderSearch(searchRoot, async (value: string) => {
        const q = value.trim();

        if (!q) {
            renderSplit(topRoot, restRoot, popularCache);
            return;
        }

        // Keep the popular "Top 5" intact and only update the "more movies" list
        // Set minimum height to prevent layout shift
        const currentHeight = restRoot.offsetHeight;
        if (currentHeight > 0) {
            restRoot.style.minHeight = `${currentHeight}px`;
        }
        
        restRoot.innerHTML = "Searching...";

        try {
            const results = await searchMovies(q, 1);
            // Only show results that have a poster, and render them in the "more movies" list
            const resultsWithPoster = results.filter((movie) => movie.poster);

            if (resultsWithPoster.length === 0) {
              restRoot.innerHTML = '<p class="empty-state">No movies found</p>';
              // Reset min height after rendering
              restRoot.style.minHeight = '';
              return;
            }

            restRoot.innerHTML = resultsWithPoster.map((movie, index) => MovieCard(movie, { showDetailsButton: true, position: index })).join("");
            
            // Add fade-in animation
            restRoot.classList.add('fade-in');
            setTimeout(() => restRoot.classList.remove('fade-in'), 300);

            attachDescriptionState();
            attachCardInteractions(restRoot, resultsWithPoster);
            
            // Reset min height after rendering
            restRoot.style.minHeight = '';
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to search movies";
            renderError(topRoot, `Error: ${errorMessage}`);
            restRoot.innerHTML = "";
            // Reset min height
            restRoot.style.minHeight = '';
        }
    });

    return root;
}

