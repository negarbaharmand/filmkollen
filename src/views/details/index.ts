import type { TMDBMovie } from "../../types/movie";
import { getPosterUrl } from "../../services/tmdbApi";

// Find or create the overlay element that will hold the movie details card.
// This is like having a <ModalRoot /> in React that lives at the top level.
function getOrCreateDetailsRoot(): HTMLElement {
  let root = document.getElementById("movie-details");

  if (!root) {
    root = document.createElement("div");
    root.id = "movie-details";
    root.className = "movie-details-overlay";
    document.body.appendChild(root);
  }

  return root;
}

// Open the movie details "modal" for a given movie.
// Think of this like rendering a <MovieDetails movie={movie} /> component.
export function openDetails(movie: TMDBMovie): void {
  const root = getOrCreateDetailsRoot();

  // Helpful for debugging: see in console when the modal opens
  // console.log("Opening details for movie:", movie);

  const poster = getPosterUrl(movie.posterPath);
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : "—";
  const rating = Number.isFinite(movie.voteAverage) ? movie.voteAverage.toFixed(1) : "—";

  root.innerHTML = `
    <div class="movie-details-card">
      <button class="movie-details-card__close" type="button" aria-label="Close details">×</button>

      <div class="movie-details-card__body">
        <div class="movie-details-card__poster">
          ${
            poster
              ? `<img src="${poster}" alt="Poster for ${movie.title}" />`
              : `<div class="poster-placeholder" aria-label="No poster available"></div>`
          }
        </div>

        <div class="movie-details-card__info">
          <h2 class="movie-details-card__title">${movie.title}</h2>
          <p class="movie-details-card__meta">TMDB rating: ⭐ ${rating} · ${year}</p>
          <p class="movie-details-card__overview">${movie.overview ?? ""}</p>

          <div class="movie-details-card__actions">
            <button type="button" data-action="add-watchlist">Add to watchlist</button>
            <button type="button" data-action="mark-watched">Mark as watched</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Close when clicking the close button
  const closeButton = root.querySelector<HTMLButtonElement>(".movie-details-card__close");
  closeButton?.addEventListener("click", () => {
    root.classList.remove("is-visible");
  });

  // Show overlay
  root.classList.add("is-visible");
}

