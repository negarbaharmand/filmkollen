// src/views/watchlist/index.ts
import { MovieCard } from "../../components/movieCard";
import { attachDescriptionState } from '../../lib/helpers';
import { getMoviesByStatus } from '../../services/movieApi';
import type { Movie, TMDBMovie } from '../../types/movie';
import { EmptyState } from '../../components/EmptyState';
import { toggleWatchlist, toggleWatched } from '../../lib/store';

export default function watchlist(): HTMLElement {
    const container = document.createElement('main');
    container.className = 'watchlist-page';

    // Initial HTML structure
    container.innerHTML = `
        <div class="watchlist-header">
            <h1>My Watchlist</h1>
            <p class="film-count" id="filmCount">Loading...</p>
        </div>
        <div id="watchlistContainer" class="movie-grid">
            <p class="loading-state">Loading your watchlist...</p>
        </div>
    `;

    // Loading the watchlist
    loadWatchlist(container);

    return container;
}

// Function to load watchlist data
async function loadWatchlist(container: HTMLElement): Promise<void> {
    try {
        const data = await getMoviesByStatus("watchlist");
        renderMovies(container, data.movies, data.totalCount);
    } catch (error) {
        console.error('Error loading watchlist:', error);
        renderMovies(container, [], 0);
    }
}

// Convert Movie (database format) to TMDBMovie (for toggle functions)
function convertToTMDBMovie(movie: Movie): TMDBMovie {
    return {
        id: movie.tmdb_id,
        title: movie.title,
        poster: movie.poster,
        releaseYear: movie.releaseYear,
        rating: movie.rating,
        overview: movie.overview,
        adult: movie.adult,
        tmdb_id: undefined
    };
}

// Attach event handlers to movie cards
function attachCardInteractions(container: HTMLElement, movies: Movie[]): void {
    const cards = container.querySelectorAll<HTMLElement>('.movie-card');

    cards.forEach((card, index) => {
        const movie = movies[index];
        if (!movie) return;

        // Convert to TMDBMovie for toggle functions. TMDBMovie is the format our store functions expect.
        const tmdbMovie = convertToTMDBMovie(movie);

        // Watchlist button
        const watchlistBtn = card.querySelector<HTMLButtonElement>(
            'button[data-action="watchlist"]'
        );
        watchlistBtn?.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            try {
                await toggleWatchlist(tmdbMovie, false); // Don't trigger app re-render
                // Reload only the watchlist after toggle
                await loadWatchlist(container);
            } catch (error) {
                console.error('Failed to toggle watchlist:', error);
            }
        });

        // Watched button
        const watchedBtn = card.querySelector<HTMLButtonElement>(
            'button[data-action="watched"]'
        );
        watchedBtn?.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            try {
                await toggleWatched(tmdbMovie, false); // Don't trigger app re-render
                // Reload only the watchlist after toggle
                await loadWatchlist(container);
            } catch (error) {
                console.error('Failed to toggle watched:', error);
            }
        });
    });
}

// Function to render movies in the watchlist
function renderMovies(container: HTMLElement, movies: Movie[], totalCount: number): void {
    const filmCount = container.querySelector('#filmCount');
    const moviesContainer = container.querySelector<HTMLElement>('#watchlistContainer');

    if (!filmCount || !moviesContainer) return;

    // Preserve current height to prevent layout shift
    const currentHeight = moviesContainer.offsetHeight;
    if (currentHeight > 0) {
        moviesContainer.style.minHeight = `${currentHeight}px`;
    }

    // Update film count
    filmCount.textContent = `${totalCount} ${totalCount === 1 ? 'Movie' : 'Movies'}`;

    // If no movies, show empty message
    if (movies.length === 0) {
        moviesContainer.innerHTML = '';
        moviesContainer.appendChild(EmptyState("Your watchlist is empty. Start adding movies!"));
        moviesContainer.style.minHeight = '';
        return;
    }

    // Render movie cards
    moviesContainer.innerHTML = movies
        .map(movie => MovieCard(movie, { showAddedDate: true }))
        .join('');

    // Add fade-in animation
    moviesContainer.classList.add('fade-in');
    setTimeout(() => moviesContainer.classList.remove('fade-in'), 300);

    attachDescriptionState();
    attachCardInteractions(container, movies);
    
    // Reset min height after rendering
    moviesContainer.style.minHeight = '';
}
