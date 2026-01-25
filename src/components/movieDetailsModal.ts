import { getPosterUrl } from "../services/tmdbApi";
import type { TMDBMovie } from "../types/movie";
import { toggleWatchlist, toggleWatched } from "../lib/store";
import store from "../lib/store";
import { showConfirmationModal } from "./confirmationModal";

let modalRoot: HTMLDivElement | null = null;

function ensureModalRoot(): HTMLDivElement {
  if (modalRoot) return modalRoot;

  modalRoot = document.createElement("div");
  modalRoot.className = "movie-modal-backdrop";
  modalRoot.setAttribute("role", "dialog");
  modalRoot.setAttribute("aria-modal", "true");
  modalRoot.style.display = "none";

  modalRoot.innerHTML = `
    <div class="movie-modal">
      <button class="movie-modal__close" aria-label="Close details">&times;</button>
      <div class="movie-modal__content">
        <div class="movie-modal__poster"></div>
        <div class="movie-modal__info">
          <h2 class="movie-modal__title"></h2>
          <p class="movie-modal__rating"></p>
          <p class="movie-modal__meta"></p>
          <p class="movie-modal__overview"></p>
          <div class="movie-modal__actions">
            <button class="movie-modal__btn movie-modal__btn--watchlist">
              Add to Watchlist
            </button>
            <button class="movie-modal__btn movie-modal__btn--watched">
              Mark as Watched
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  // Close on backdrop click
  modalRoot.addEventListener("click", (event) => {
    if (event.target === modalRoot) {
      closeMovieDetailsModal();
    }
  });

  // Close button
  const closeBtn = modalRoot.querySelector<HTMLButtonElement>(".movie-modal__close");
  closeBtn?.addEventListener("click", () => {
    closeMovieDetailsModal();
  });

  // Close on Escape key
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalRoot?.style.display === "flex") {
      closeMovieDetailsModal();
    }
  });

  return modalRoot;
}

export function closeMovieDetailsModal(): void {
  if (!modalRoot) return;
  modalRoot.style.display = "none";
}

export function openMovieDetailsModal(movie: TMDBMovie): void {
  const root = ensureModalRoot();

  const posterContainer = root.querySelector<HTMLDivElement>(".movie-modal__poster");
  const titleEl = root.querySelector<HTMLHeadingElement>(".movie-modal__title");
  const ratingEl = root.querySelector<HTMLParagraphElement>(".movie-modal__rating");
  const metaEl = root.querySelector<HTMLParagraphElement>(".movie-modal__meta");
  const overviewEl = root.querySelector<HTMLParagraphElement>(".movie-modal__overview");
  const watchlistBtn = root.querySelector<HTMLButtonElement>(".movie-modal__btn--watchlist");
  const watchedBtn = root.querySelector<HTMLButtonElement>(".movie-modal__btn--watched");

  if (!posterContainer || !titleEl || !ratingEl || !metaEl || !overviewEl || !watchlistBtn || !watchedBtn) {
    return;
  }

  const posterUrl = getPosterUrl(movie.poster);

  posterContainer.innerHTML = posterUrl
    ? `<img src="${posterUrl}" alt="Poster for ${movie.title}" />`
    : `<div class="poster-placeholder" aria-label="No poster available"></div>`;

  titleEl.textContent = movie.title;
  ratingEl.textContent = `TMDB rating: ${movie.rating ?? "N/A"}`;
  metaEl.textContent = `${movie.releaseYear} ${movie.adult ? "18+" : ""}`;
  overviewEl.textContent = movie.overview ?? "No description available.";

  // Check current state and set button labels accordingly
  const isInWatchlist = store.isInWatchlist(movie.id);
  const isWatched = store.isWatched(movie.id);

  watchlistBtn.textContent = isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist";
  watchedBtn.textContent = isWatched ? "Remove from Watched" : "Mark as Watched";
  
  // Disable watchlist button if movie is already watched
  watchlistBtn.disabled = isWatched;
  watchedBtn.disabled = false;

  // Clean previous listeners by cloning
  const newWatchlistBtn = watchlistBtn.cloneNode(true) as HTMLButtonElement;
  const newWatchedBtn = watchedBtn.cloneNode(true) as HTMLButtonElement;

  watchlistBtn.replaceWith(newWatchlistBtn);
  watchedBtn.replaceWith(newWatchedBtn);

  newWatchlistBtn.addEventListener("click", async () => {
    newWatchlistBtn.disabled = true;
    const wasInWatchlist = store.isInWatchlist(movie.id);
    
    try {
      const result = await toggleWatchlist(movie, false); // Don't trigger app re-render
      
      if (result.alreadyWatched) {
        // Movie is already watched, show confirmation modal
        await showConfirmationModal(
          `You've already watched "${movie.title}". Remove it from watched movies to add it to your watchlist.`,
          "Already Watched"
        );
        newWatchlistBtn.disabled = true; // Keep disabled since it's watched
      } else {
        // Toggle successful, update button text
        const isNowInWatchlist = store.isInWatchlist(movie.id);
        newWatchlistBtn.textContent = isNowInWatchlist ? "Remove from Watchlist" : "Add to Watchlist";
        newWatchlistBtn.disabled = store.isWatched(movie.id); // Disable if watched
      }
    } catch (error) {
      console.error("Failed to toggle watchlist", error);
      newWatchlistBtn.disabled = false;
    }
  });

  newWatchedBtn.addEventListener("click", async () => {
    newWatchedBtn.disabled = true;
    const wasWatched = store.isWatched(movie.id);
    const wasInWatchlist = store.isInWatchlist(movie.id);
    
    try {
      await toggleWatched(movie, false); // Don't trigger app re-render
      
      // Update watched button text based on new state
      const isNowWatched = store.isWatched(movie.id);
      newWatchedBtn.textContent = isNowWatched ? "Remove from Watched" : "Mark as Watched";
      newWatchedBtn.disabled = false;
      
      // If movie was moved from watchlist to watched, update watchlist button
      if (wasInWatchlist && isNowWatched) {
        newWatchlistBtn.textContent = "Add to Watchlist";
        newWatchlistBtn.disabled = true; // Disable since it's now watched
      } else if (!isNowWatched && wasWatched) {
        // Movie was removed from watched, enable watchlist button
        newWatchlistBtn.disabled = false;
      }
    } catch (error) {
      console.error("Failed to toggle watched", error);
      newWatchedBtn.disabled = false;
    }
  });

  root.style.display = "flex";
}

