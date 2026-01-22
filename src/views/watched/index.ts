import { MovieCard } from '../../components/movieCard';
import { attachDescriptionState } from '../../lib/helpers';
import { getMoviesByStatus } from '../../services/movieApi';
import type { Movie } from '../../types/movie';


const container = document.createElement('main');
let movies: Movie[] = []

const filterMovies = (filter: string) => {
    console.log("filter movies by", filter)
    if (filter == "all") {
        return movies
    } else if (filter == "is_favorite") {
        return movies.filter(movie => movie.is_favorite)
    } else if (filter == "rating_gt_9") {
        return movies.filter(movie => Number(movie.rating) >= 9)
    } else if (filter == "rating_gt_7") {
        return movies.filter(movie => Number(movie.rating) >= 7)
    }
}

const sortMovies = (sortBy: string, movieToSort: Movie[]) => {
    if (sortBy == "date_added_desc") {
        return movieToSort.sort((a, b) => {
            return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        })
    } else if (sortBy == "date_added_asc") {
        return movieToSort.sort((a, b) => {
            return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
        })
    } else if (sortBy == "rating_desc") {
        return movieToSort.sort((a, b) => Number(b.rating) - Number(a.rating))
    } else if (sortBy == "rating_asc") {
        return movieToSort.sort((a, b) => Number(a.rating) - Number(b.rating))
    }
}



export default function watched(): HTMLElement {
    container.className = 'watched-page';
    container.innerHTML = `
        <div class="watched-header">
            <h2>My Watched movies</h2>
        </div>
        <div class="select-wrapper">
            <select name="filter" id="filter">
                <option value="all">All</option>
                <option value="is_favorite">Favorites</option>
                <option value="rating_gt_9">High rated(9+)</option>
                <option value="rating_gt_7">Good rated(7+)</option>
            </select>
        </div>
        <div class="select-wrapper">
            <select name="sort" id="sortBy">
                <option value="date_added_asc" >Date watched ↑</option>
                <option value="date_added_desc" >Date watched ↓</option>
                <option value="rating_asc">Rating ↑</option>
                <option value="rating_desc">Rating ↓</option>
            </select>
        </div>
        <div id="watchedContainer" class="movie-grid"></div>
    `;

    const filterEl = container.querySelector("#filter") as HTMLSelectElement;
    const sortByEl = container.querySelector("#sortBy") as HTMLSelectElement;

    // Event listeners
    filterEl.addEventListener("change", () => {
        renderMovies(filterEl.value, sortByEl.value);
    });

    sortByEl.addEventListener("change", () => {
        renderMovies(filterEl.value, sortByEl.value);
    });

    // initial load
    loadWatched().then(() => {
        renderMovies(filterEl.value, sortByEl.value);
    });

    return container;
}


 //function to load watchlist data
async function loadWatched(): Promise<void> {
    try {
        const data = await getMoviesByStatus("watched");
        movies = data.movies        
        renderMovies();
    } catch (error) {
        console.error('Error loading watched movies:', error);
        renderMovies();
    }
}
 //function to render movies in the watchlist
function renderMovies(filter?: string, sortBy?: string): void {
    const moviesContainer = container.querySelector('#watchedContainer');

    const filteredMovies = filter ? filterMovies(filter) : movies
    const sortedMovies = sortBy ? sortMovies(sortBy, filteredMovies ?? []) : filteredMovies


    if ( !moviesContainer) return;

    // if no movies, show empty message
    if (!sortedMovies || sortedMovies.length === 0) {
        moviesContainer.innerHTML = '<p class="empty-message">Your watched movie list is empty. Start viewing movies!</p>';
        return;
    }

    // render movie cards
    moviesContainer.innerHTML = (sortedMovies ?? []).map(MovieCard).join('');

    attachDescriptionState()
}


