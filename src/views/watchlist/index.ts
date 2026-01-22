// src/views/watchlist/index.ts
import { MovieCard } from '../../components/movieCard';
import { attachDescriptionState } from '../../lib/helpers';
import { getMoviesByStatus } from '../../services/movieApi';
import type { Movie } from '../../types/movie';
import { EmptyState } from '../../components/EmptyState';
export default function watchlist(): HTMLElement {
    const container = document.createElement('main');
    container.className = 'watchlist-page';

    // Initial HTML structure
    container.innerHTML = `
        <div class="watchlist-header">
            <h1>My Watchlist</h1>
            <p class="film-count" id="filmCount">Loading...</p>
        </div>
        <div id="watchlistContainer" class="movie-grid"></div>
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
        moviesContainer.innerHTML = ''
        moviesContainer.appendChild(EmptyState("Your watchlist is empty. Start adding movies!"));
    return;
}

    // render movie cards
    moviesContainer.innerHTML = movies
        .map(movie => MovieCard(movie))
        .join('');

    attachDescriptionState()
}

