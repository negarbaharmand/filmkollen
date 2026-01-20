// src/views/browse/index.ts
// This view is responsible for listing and searching movies.
// It also wires the "Show details" button to the details modal.
import type { TMDBMovie } from "../../types/movie";
import { getPopularMovies, searchMovies, getPosterUrl } from "../../services/tmdbApi";
import { renderSearch } from "../../components/ search";
import { openDetails } from "../details";

// Render one movie card as an HTML string
function movieCard(m: TMDBMovie): string {
  const poster = getPosterUrl(m.posterPath);
  const year = m.releaseDate ? m.releaseDate.slice(0, 4) : "—";
  const rating = Number.isFinite(m.voteAverage) ? m.voteAverage.toFixed(1) : "—";

  return `
    <article class="movie-card" data-movie-id="${m.id}">
      <div class="movie-card__poster">
        ${
          poster
            ? `<img src="${poster}" alt="Poster for ${m.title}" loading="lazy" />`
            : `<div class="poster-placeholder" aria-label="No poster available"></div>`
        }
      </div>
      <h3 class="movie-card__title">${m.title}</h3>
      <p class="movie-card__meta">⭐ ${rating} · ${year}</p>
      <p class="movie-card__overview">${m.overview ?? ""}</p>
      <button class="movie-card__details-btn" type="button">
        Show details
      </button>
    </article>
  `;
}

function renderSplit(topRoot: HTMLElement, restRoot: HTMLElement, movies: TMDBMovie[]) {
  const top5 = movies.slice(0, 5);
  const rest = movies.slice(5);

  // First 5 movies go into "Top 5"
  topRoot.innerHTML =
    top5.length > 0 ? top5.map(movieCard).join("") : '<p class="empty-state">No movies found</p>';
  // The rest of the movies go into "More"
  restRoot.innerHTML = rest.length > 0 ? rest.map(movieCard).join("") : "";
}

function renderError(root: HTMLElement, message: string) {
  root.innerHTML = `<p class="error-state" role="alert">${message}</p>`;
}

export default function browse(): HTMLElement {
  const root = document.createElement("main");
  root.className = "browse";

  root.innerHTML = `
    <section class="browse__header">
      <h1>Movies</h1>
      <div id="search-root"></div>
    </section>

    <section class="browse__section">
      <h2>Top 5</h2>
      <div id="top5" class="movie-grid" aria-live="polite"></div>
    </section>

    <section class="browse__section">
      <h2>More</h2>
      <div id="rest" class="movie-grid" aria-live="polite"></div>
    </section>
  `;

  const topRoot = root.querySelector<HTMLElement>("#top5")!;
  const restRoot = root.querySelector<HTMLElement>("#rest")!;
  const searchRoot = root.querySelector<HTMLElement>("#search-root")!;

  // All popular movies from the API (first page)
  let popularCache: TMDBMovie[] = [];
  // The movies that are currently shown (popular or search results)
  let currentMovies: TMDBMovie[] = [];

  // Load the initial "popular" movie list
  const loadPopular = async () => {
    topRoot.innerHTML = "Loading...";
    restRoot.innerHTML = "";
    try {
      popularCache = await getPopularMovies(1);
      currentMovies = popularCache;
      renderSplit(topRoot, restRoot, popularCache);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load movies";
      renderError(topRoot, `Error: ${errorMessage}`);
      restRoot.innerHTML = "";
    }
  };

  void loadPopular();

  // Handle search input from the search component
  renderSearch(searchRoot, async (value: string) => {
    const q = value.trim();

    if (!q) {
      currentMovies = popularCache;
      renderSplit(topRoot, restRoot, popularCache);
      return;
    }

    topRoot.innerHTML = "Searching...";
    restRoot.innerHTML = "";

    try {
      const results = await searchMovies(q, 1);
      currentMovies = results;
      renderSplit(topRoot, restRoot, results);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to search movies";
      renderError(topRoot, `Error: ${errorMessage}`);
      restRoot.innerHTML = "";
    }
  });

  // Listen for clicks on "Show details" buttons anywhere inside this view.
  // We use event delegation so it works for both Top 5 and More sections.
  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const detailsButton = target.closest(".movie-card__details-btn");
    if (!detailsButton) return;

    const card = detailsButton.closest<HTMLElement>(".movie-card");
    if (!card) return;

    const id = Number(card.dataset.movieId);
    const movie = currentMovies.find((m) => m.id === id);
    if (!movie) return;

    openDetails(movie);
  });

  return root;
}