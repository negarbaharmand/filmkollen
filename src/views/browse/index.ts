// src/views/browse/index.ts
import type { TMDBMovie } from "../../types/movie";
import { getPopularMovies, searchMovies } from "../../services/tmdbApi";
import { renderSearch } from "../../components/ search";
import { movieCard } from "../../components/movieCardTMDB";
import { attachDescriptionState } from "../../lib/helpers";
import { openMovieDetailsModal } from "../../components/movieDetailsModal";



function attachCardInteractions(root: HTMLElement, movies: TMDBMovie[]): void {
  const cards = root.querySelectorAll<HTMLElement>(".movie-card");

  cards.forEach((card, index) => {
    const movie = movies[index];
    if (!movie) return;

    const detailsBtn = card.querySelector<HTMLButtonElement>(
      '.movie-card__btn[data-action="details"]'
    );

    detailsBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      openMovieDetailsModal(movie);
    });
  });
}

function renderSplit(topRoot: HTMLElement, restRoot: HTMLElement, movies: TMDBMovie[]) {
  const top5 = movies.slice(0, 5);
  const rest = movies.slice(5);

  topRoot.innerHTML =
    top5.length > 0
      ? top5.map(movieCard).join("")
      : '<p class="empty-state">No movies found</p>';
  restRoot.innerHTML = rest.length > 0 ? rest.map(movieCard).join("") : "";

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

        topRoot.innerHTML = "Searching...";
        restRoot.innerHTML = "";

        try {
            const results = await searchMovies(q, 1);
            renderSplit(topRoot, restRoot, results);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to search movies";
            renderError(topRoot, `Error: ${errorMessage}`);
            restRoot.innerHTML = "";
        }
    });

    return root;
}

