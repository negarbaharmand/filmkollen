import type { Movie } from "../types/movie";
import store from "../lib/store";
//function to render movie card for movies from our database
export function MovieCard(movie: Movie): string {
    const posterUrl = movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster';
    const addedDate = new Date(movie.addedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check current status
    const isInWatchlist = store.isInWatchlist(movie.tmdb_id);
    const isWatched = store.isWatched(movie.tmdb_id);
// Render movie card HTML
    return `
        <article class="movie-card" data-movie-id="${movie.tmdb_id}">
            <div class="movie-card__poster">
                <img src="${posterUrl}" alt="Poster for ${movie.title}" loading="lazy" />
            </div>
            <div class="movie-card__details">
                <p class="movie-card__rating">⭐ ${movie.rating}</p>
                <h3 class="movie-card__title">${movie.title}</h3>
                <p class="movie-card__meta">${movie.releaseYear} ${movie.adult ? "18+" : ""}</p>
                <div class="movie-card__overview-wrapper">
                    <p class="movie-card__overview">${movie.overview ?? ""}</p>
                </div>
                <div class="movie-card__footer">
                    <p class="movie-card__added-date">Added: ${addedDate}</p>

                    <div class="movie-card__actions">
                        <button class="movie-card__btn" data-action="watched" data-tmdb-id="${movie.tmdb_id}">
                            <i class="fa-solid fa-eye fa-xl"></i> ${isWatched ? 'Unwatched' : 'Watched'}
                        </button>
                        <button class="movie-card__btn movie-card__btn--circle" data-action="watchlist" data-tmdb-id="${movie.tmdb_id}">
                            ${isInWatchlist ? '-' : '+'}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

