import type { Movie } from "../types/movie";

export function MovieCard(movie: Movie): string {
    const posterUrl = movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster';
    const addedDate = new Date(movie.addedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <article class="movie-card" data-movie-id="${movie.id}">
            <div class="movie-card__poster">
                <img src="${posterUrl}" alt="Poster for ${movie.title}" loading="lazy" />
            
            </div>
            <div class="movie-card__details">
                <p class="movie-card__rating">⭐ ${movie.rating} </p>
                <h3 class="movie-card__title">${movie.title}</h3>
                <p class="movie-card__meta">${movie.releaseYear} ${movie.adult ? "18+" : ""} </p>
                <div class="movie-card__overview-wrapper">
                    <p class="movie-card__overview">${movie.overview ?? ""}</p>
                </div>
                <div class="movie-card__footer">
                    <p class="movie-card__added-date">Added: ${addedDate}</p>

                    <div class="movie-card__actions">
                        <button id="addToWatched"><i class="fa-solid fa-eye fa-xl"></i></button>
                        <button id="addToWatchlist">+</button>
                    </div>
                </div>
            </div>
        </article>
    ` 
}

