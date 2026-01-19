// src/views/watchlist/index.ts
import { getWatchList } from '../../services/movieApi';
import type { WatchlistMovie } from '../../types/movie';

const TMDB_ACCOUNT_ID = import.meta.env.VITE_TMDB_ACCOUNT_ID as string;

export default function watchlist(): HTMLElement {
    const container = document.createElement('main');
    container.className = 'watchlist-page';

    // Initial struktur
    container.innerHTML = `
        <div class="watchlist-header">
            <h1>Min Watchlist</h1>
            <p class="film-count" id="filmCount">Laddar...</p>
        </div>
        <div id="watchlistContainer" class="movies-grid"></div>
    `;

    // Ladda watchlist
    loadWatchlist(container);

    return container;
}
 //funktion för att ladda watchlistan 
async function loadWatchlist(container: HTMLElement): Promise<void> {
    try {
        const data = await getWatchList(TMDB_ACCOUNT_ID);
        renderMovies(container, data.movies, data.totalCount);
    } catch (error) {
        console.error('Error loading watchlist:', error);
        renderMovies(container, [], 0);
    }
}
 //funktion för att rendera filmerna i watchlistan
function renderMovies(container: HTMLElement, movies: WatchlistMovie[], totalCount: number): void {
    const filmCount = container.querySelector('#filmCount');
    const moviesContainer = container.querySelector('#watchlistContainer');

    if (!filmCount || !moviesContainer) return;

    // Uppdatera antal
    filmCount.textContent = `${totalCount} ${totalCount === 1 ? 'film' : 'filmer'}`;

    // Om tom
    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p class="empty-message">Din watchlist är tom. Börja lägga till filmer!</p>';
        return;
    }

    // Rendera filmer
    moviesContainer.innerHTML = movies
        .map(movie => createMovieCard(movie))
        .join('');
}

// funktion för att skapa ett filmkort
function createMovieCard(movie: WatchlistMovie): string {
    const posterUrl = movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster';
    const addedDate = new Date(movie.addedDate).toLocaleDateString('sv-SE', {
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
                <p class="rating">⭐ ${movie.rating.toFixed(1)}/10</p>
                <p class="added-date">Tillagd: ${addedDate}</p>
            </div>
        </div>
    `;
}