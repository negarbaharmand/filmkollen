import { MovieCard } from '../../components/movieCard';
import { attachDescriptionState } from '../../lib/helpers';
import { getMoviesByStatus } from '../../services/movieApi';
import type { Movie } from '../../types/movie';

export default function watched(): HTMLElement {
    const container = document.createElement('main');
    container.className = 'watchlist-page';

    // Initial HTML structure
    container.innerHTML = `
        <div class="watched-header">
            <h1>My Watched movies</h1>
        </div>
        <div id="watchedContainer" class="movie-grid"></div>

    `;

    //loading the watchlist
    loadWatched(container);

    return container;
}
 //function to load watchlist data
async function loadWatched(container: HTMLElement): Promise<void> {
    try {
        const data = await getMoviesByStatus("watched");
        renderMovies(container, data.movies);
    } catch (error) {
        console.error('Error loading watched movies:', error);
        renderMovies(container, []);
    }
}
 //function to render movies in the watchlist
function renderMovies(container: HTMLElement, movies: Movie[]): void {
    const moviesContainer = container.querySelector('#watchedContainer');


    if ( !moviesContainer) return;

    // if no movies, show empty message
    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p class="empty-message">Your watched movie list is empty. Start viewing movies!</p>';
        return;
    }

    // render movie cards
    moviesContainer.innerHTML = movies
        .map(movie => MovieCard(movie))
        .join('');

    attachDescriptionState()
}

