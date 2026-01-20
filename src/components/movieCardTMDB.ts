import { getPosterUrl } from "../services/tmdbApi";
import type { TMDBMovie } from "../types/movie";

export function movieCard(m: TMDBMovie, index: number): string {
    const poster = getPosterUrl(m.poster);

    return `
        <article class="movie-card" >
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
                    <button id="addToWatched"><i class="fa-solid fa-eye fa-xl"></i></button>
                    <button id="addToWatchlist">+</button>
                </div>
            </div>
            <p class="movie-card__place" >0${index + 1}</p>
        </article>
    `;
}