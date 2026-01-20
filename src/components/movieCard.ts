import type { Movie } from "../types/movie";

export function MovieCard(movie: Movie): string {
    const posterUrl = movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster';
    const addedDate = new Date(movie.addedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <div class="movie-card" data-movie-id="${movie.id}">
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="release-year">📅 ${movie.releaseYear}</p>
                <p class="rating">⭐ ${movie.rating}/10</p>
                <p class="added-date">Added: ${addedDate}</p>
            </div>
        </div>
    `;
}