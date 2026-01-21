import { getPosterUrl } from "../services/tmdbApi";
import type { TMDBMovie } from "../types/movie";
import store from "../lib/store";
// Function to render movie card for TMDB movies
export function movieCard(m: TMDBMovie, index: number): string {
  const poster = getPosterUrl(m.poster);
  
  // Check current status
  const isInWatchlist = store.isInWatchlist(m.id);
  const isWatched = store.isWatched(m.id);
// Render movie card HTML
  return `
        <article class="movie-card" data-tmdb-id="${m.id}">
            <div class="movie-card__poster">
                ${
                  poster
                    ? `<img src="${poster}" alt="Poster for ${m.title}" loading="lazy" />`
                    : `<div class="poster-placeholder" aria-label="No poster available"></div>`
                }
            </div>
            <div class="movie-card__details">
                <p class="movie-card__rating">⭐ ${m.rating} </p>
                <h3 class="movie-card__title">${m.title}</h3>
                <p class="movie-card__meta">${m.releaseYear} ${m.adult ? "18+" : ""} </p>
                <div class="movie-card__overview-wrapper">
                    <p class="movie-card__overview">${m.overview ?? ""}</p>
                </div>
                <div class="movie-card__actions">
                    <button class="movie-card__btn" data-action="watched" data-tmdb-id="${m.id}">
                        <i class="fa-solid fa-eye fa-xl"></i> ${isWatched ? 'Unwatched' : 'Watched'}
                    </button>
                    <button class="movie-card__btn movie-card__btn--circle" data-action="watchlist" data-tmdb-id="${m.id}">
                        ${isInWatchlist ? '-' : '+'}
                    </button>
                    <button class="movie-card__btn movie-card__btn--details" data-action="details" data-tmdb-id="${m.id}">
                        Details
                    </button>
                </div>
            </div>
            <p class="movie-card__place">0${index + 1}</p>
        </article>
    `;
}