import { getPosterUrl } from "../services/tmdbApi";
import type { TMDBMovie } from "../types/movie";

export function movieCard(m: TMDBMovie): string {
    const poster = getPosterUrl(m.poster);

    return `
        <article class="movie-card">
            <div class="movie-card__poster">
                ${
                    poster
                        ? `<img src="${poster}" alt="Poster for ${m.title}" loading="lazy" />`
                        : `<div class="poster-placeholder" aria-label="No poster available"></div>`
                }
            </div>
            <h3 class="movie-card__title">${m.title}</h3>
            <p class="movie-card__meta">⭐ ${m.rating} · ${m.releaseYear}</p>
            <p class="movie-card__overview">${m.overview ?? ""}</p>
        </article>
    `;
}
