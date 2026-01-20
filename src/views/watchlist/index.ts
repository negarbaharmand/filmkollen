// src/views/watchlist/index.ts
import { getMoviesByStatus } from '../../services/movieApi';
import type { Movie } from '../../types/movie';

export default function watchlist(): HTMLElement {
    const container = document.createElement('main');
    container.className = 'watchlist-page';

    // Initial HTML structure
    container.innerHTML = `
        <div class="watchlist-header">
            <h1>Min Watchlist</h1>
            <p class="film-count" id="filmCount">Laddar...</p>
        </div>
        <div id="watchlistContainer" class="movies-grid"></div>
    `;

    //loading the watchlist
    loadWatchlist(container);

    return container;
}
 //function to load watchlist data
async function loadWatchlist(container: HTMLElement): Promise<void> {
    try {
        const data = await getMoviesByStatus("watchlist");
        renderMovies(container, data.movies, data.totalCount);
    } catch (error) {
        console.error('Error loading watchlist:', error);
        renderMovies(container, [], 0);
    }
}
 //function to render movies in the watchlist
function renderMovies(container: HTMLElement, movies: Movie[], totalCount: number): void {
    const filmCount = container.querySelector('#filmCount');
    const moviesContainer = container.querySelector('#watchlistContainer');

    if (!filmCount || !moviesContainer) return;

    // update film count
    filmCount.textContent = `${totalCount} ${totalCount === 1 ? 'Movie' : 'Movies'}`;

    // if no movies, show empty message
    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p class="empty-message">Your watchlist is empty. Start adding movies!</p>';
        return;
    }

    // render movie cards
    moviesContainer.innerHTML = movies
        .map(movie => createMovieCard(movie))
        .join('');
}

// Function to create a movie card HTML
function createMovieCard(movie: Movie): string {
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