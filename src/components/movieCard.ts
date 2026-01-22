import type { Movie, TMDBMovie } from "../types/movie";
import store from "../lib/store";
import { getPosterUrl } from "../services/tmdbApi";

export interface MovieCardOptions {
  showDetailsButton?: boolean;
  showAddedDate?: boolean;
  showPosition?: boolean;
  position?: number;
}

// Unified movie card component that works with both Movie and TMDBMovie
export function MovieCard(
  movie: Movie | TMDBMovie,
  options: MovieCardOptions = {}
): string {
  const {
    showDetailsButton = false,
    showAddedDate = false,
    showPosition = false,
    position
  } = options;

  // Determine if this is a Movie (from database) or TMDBMovie
  const isDatabaseMovie = 'addedDate' in movie && movie.addedDate !== undefined;
  
  // Get the TMDB ID (for Movie it's tmdb_id, for TMDBMovie it's id)
  const tmdbId = isDatabaseMovie ? (movie as Movie).tmdb_id : (movie as TMDBMovie).id;
  
  // Get poster URL
  const posterUrl = isDatabaseMovie
    ? (movie as Movie).poster || 'https://via.placeholder.com/500x750?text=No+Poster'
    : getPosterUrl((movie as TMDBMovie).poster);

  // Format added date if available
  const addedDate = isDatabaseMovie && (movie as Movie).addedDate
    ? new Date((movie as Movie).addedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  // Check current status
  const isInWatchlist = store.isInWatchlist(tmdbId);
  const isWatched = store.isWatched(tmdbId);

  // Render movie card HTML
  return `
        <article class="movie-card" data-tmdb-id="${tmdbId}">
            <div class="movie-card__poster">
                ${
                  posterUrl
                    ? `<img src="${posterUrl}" alt="Poster for ${movie.title}" loading="lazy" />`
                    : `<div class="poster-placeholder" aria-label="No poster available"></div>`
                }
            </div>
            <div class="movie-card__details">
                <p class="movie-card__rating">⭐ ${movie.rating}</p>
                <h3 class="movie-card__title">${movie.title}</h3>
                <p class="movie-card__meta">${movie.releaseYear} ${movie.adult ? "18+" : ""}</p>
                <div class="movie-card__overview-wrapper">
                    <p class="movie-card__overview">${movie.overview ?? ""}</p>
                </div>
                ${showAddedDate && addedDate ? `
                <div class="movie-card__footer">
                    <p class="movie-card__added-date">Added: ${addedDate}</p>
                </div>
                ` : ''}
                <div class="movie-card__actions">
                    <button class="movie-card__btn ${isWatched ? 'watched' : ''}" data-action="watched" data-tmdb-id="${tmdbId}">
                        <i class="fa-solid fa-eye fa-sm"></i> <span class="btn-text">Watched</span>
                    </button>
                    <button class="movie-card__btn movie-card__btn--circle" data-action="watchlist" data-tmdb-id="${tmdbId}">
                        ${isInWatchlist ? '-' : '+'}
                    </button>
                    ${showDetailsButton ? `
                    <button class="movie-card__btn movie-card__btn--details" data-action="details" data-tmdb-id="${tmdbId}">
                        Details
                    </button>
                    ` : ''}
                </div>
            </div>
            ${showPosition && position !== undefined ? `<p class="movie-card__place">0${position + 1}</p>` : ''}
        </article>
    `;
}
