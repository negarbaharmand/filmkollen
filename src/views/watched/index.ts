import { getMoviesByStatus, updateMovie, deleteMovie } from "../../services/movieApi";
import type { Movie } from "../../types/movie";
import { EmptyState } from '../../components/EmptyState';
import { MovieCard } from '../../components/movieCard';
import { attachDescriptionState } from '../../lib/helpers';
import { openRatingModal } from '../../components/ratingModal';
import './style.css';

let allMovies: Movie[] = [];

export function watched(): HTMLElement {
    const root = document.createElement("main");
    root.className = "watched-page";

    root.innerHTML = `
        <div class="watched-header">
            <h1>Watched Movies</h1>
            <p class="film-count" id="filmCount">Loading...</p>
        </div>
        <div class="controls">
            <div class="select-wrapper">
                <select name="filter" id="filter">
                    <option value="all">All</option>
                    <option value="favorites">Favorites</option>
                    <option value="5">5⭐</option>
                    <option value="4">4⭐</option>
                    <option value="rating_gt_9">High rated (9+)</option>
                    <option value="rating_gt_7">Good rated (7+)</option>
                </select>
            </div>
            <div class="select-wrapper">
                <select name="sort" id="sortBy">
                    <option value="date_added_desc">Date watched ↓</option>
                    <option value="date_added_asc">Date watched ↑</option>
                    <option value="rating_desc">Rating ↓</option>
                    <option value="rating_asc">Rating ↑</option>
                </select>
            </div>
        </div>
        <div id="watchedContainer" class="movie-grid"></div>
    `;

    const filterEl = root.querySelector("#filter") as HTMLSelectElement;
    const sortByEl = root.querySelector("#sortBy") as HTMLSelectElement;

    // Event listeners
    filterEl.addEventListener("change", () => {
        renderMovies(root, filterEl.value, sortByEl.value);
    });

    sortByEl.addEventListener("change", () => {
        renderMovies(root, filterEl.value, sortByEl.value);
    });

    // Initial load
    loadWatched(root);

    return root;
}

// Load watched movies
async function loadWatched(root: HTMLElement) {
    const container = root.querySelector('#watchedContainer')! as HTMLElement;
    const filmCount = root.querySelector('#filmCount')! as HTMLElement;

    try {
        const data = await getMoviesByStatus("watched");

        if (data.movies.length === 0) {
            container.innerHTML = "";
            container.appendChild(EmptyState("Your watched list is empty. Start watching movies!"));
            filmCount.textContent = `0 Movies`;
            return;
        }

        allMovies = data.movies;
        filmCount.textContent = `${data.totalCount} ${data.totalCount === 1 ? 'Movie' : 'Movies'}`;

        const filterEl = root.querySelector("#filter") as HTMLSelectElement;
        const sortByEl = root.querySelector("#sortBy") as HTMLSelectElement;
        renderMovies(root, filterEl.value, sortByEl.value);
    } catch (err) {
        console.error("Error loading watched movies:", err);
        container.innerHTML = "<p class='empty-message'>Failed to load watched movies.</p>";
        filmCount.textContent = "0 Movies";
    }
}

// Filter movies
function filterMovies(filter: string): Movie[] {
    switch (filter) {
        case "all":
            return allMovies;
        case "favorites":
            return allMovies.filter(m => m.is_favorite);
        case "5":
            return allMovies.filter(m => m.personal_rating === 5);
        case "4":
            return allMovies.filter(m => m.personal_rating === 4);
        case "rating_gt_9":
            return allMovies.filter(m => Number(m.rating) >= 9);
        case "rating_gt_7":
            return allMovies.filter(m => Number(m.rating) >= 7);
        default:
            return allMovies;
    }
}

// Sort movies
function sortMovies(sortBy: string, moviesToSort: Movie[]): Movie[] {
    const sorted = [...moviesToSort];
    switch (sortBy) {
        case "date_added_desc":
            return sorted.sort((a, b) => {
                return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
            });
        case "date_added_asc":
            return sorted.sort((a, b) => {
                return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
            });
        case "rating_desc":
            return sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
        case "rating_asc":
            return sorted.sort((a, b) => Number(a.rating) - Number(b.rating));
        default:
            return sorted;
    }
}

// Render movies
function renderMovies(root: HTMLElement, filter: string = "all", sortBy: string = "date_added_desc") {
    const container = root.querySelector('#watchedContainer')! as HTMLElement;

    const filteredMovies = filterMovies(filter);
    const sortedMovies = sortMovies(sortBy, filteredMovies);

    container.innerHTML = "";

    if (sortedMovies.length === 0) {
        container.appendChild(EmptyState("No movies match your filter."));
        return;
    }

    // Render using MovieCard component and add interactive features
    sortedMovies.forEach(movie => {
        const cardHTML = MovieCard(movie);
        const cardWrapper = document.createElement("div");
        cardWrapper.innerHTML = cardHTML;
        const card = cardWrapper.firstElementChild as HTMLElement;

        if (!card) return;

        // Add interactive buttons to the card
        const actionsContainer = card.querySelector(".movie-card__actions");
        if (actionsContainer) {
            // Replace default buttons with watched-specific actions
            actionsContainer.innerHTML = `
                <button class="favorite-btn" data-movie-id="${movie.id}">
                    ${movie.is_favorite ? '★ Favorite' : '☆ Favorite'}
                </button>
                <button class="rate-btn" data-movie-id="${movie.id}">Rate</button>
                <button class="remove-btn" data-movie-id="${movie.id}">Remove</button>
            `;
        } else {
            // If actions container doesn't exist, create one
            const details = card.querySelector(".movie-card__details");
            if (details) {
                const actionsDiv = document.createElement("div");
                actionsDiv.className = "movie-card__actions";
                actionsDiv.innerHTML = `
                    <button class="favorite-btn" data-movie-id="${movie.id}">
                        ${movie.is_favorite ? '★ Favorite' : '☆ Favorite'}
                    </button>
                    <button class="rate-btn" data-movie-id="${movie.id}">Rate</button>
                    <button class="remove-btn" data-movie-id="${movie.id}">Remove</button>
                `;
                details.appendChild(actionsDiv);
            }
        }

        // Add personal rating display if available
        const ratingEl = card.querySelector(".movie-card__rating");
        if (ratingEl && movie.personal_rating) {
            ratingEl.textContent = `⭐ ${movie.rating} | Your rating: ${movie.personal_rating}/5`;
        }

        // Attach event listeners
        attachMovieActions(card, movie, root);

        container.appendChild(card);
    });

    attachDescriptionState();
}

// Attach interactive actions to movie card
function attachMovieActions(card: HTMLElement, movie: Movie, root: HTMLElement) {
    // Toggle favorite
    const favBtn = card.querySelector(".favorite-btn");
    favBtn?.addEventListener("click", async () => {
        movie.is_favorite = !movie.is_favorite;
        if (favBtn) {
            favBtn.textContent = movie.is_favorite ? '★ Favorite' : '☆ Favorite';
        }
        try {
            await updateMovie(movie.id, { is_favorite: movie.is_favorite });
        } catch (err) {
            console.error("Failed to update favorite:", err);
            // Revert on error
            movie.is_favorite = !movie.is_favorite;
            if (favBtn) {
                favBtn.textContent = movie.is_favorite ? '★ Favorite' : '☆ Favorite';
            }
        }
    });

    // Rate movie
    const rateBtn = card.querySelector(".rate-btn");
    rateBtn?.addEventListener("click", () => {
        openRatingModal(movie, (rating) => {
            // Update local movie object
            movie.personal_rating = rating;
            
            // Update display
            const ratingEl = card.querySelector(".movie-card__rating");
            if (ratingEl) {
                ratingEl.textContent = `⭐ ${movie.rating} | Your rating: ${movie.personal_rating}/5`;
            }
            
            // Update in allMovies array
            const movieIndex = allMovies.findIndex(m => m.id === movie.id);
            if (movieIndex !== -1) {
                allMovies[movieIndex].personal_rating = rating;
            }
        });
    });

    // Remove movie
    const removeBtn = card.querySelector(".remove-btn");
    removeBtn?.addEventListener("click", async () => {
        if (!confirm(`Are you sure you want to remove "${movie.title}" from your watched list?`)) {
            return;
        }
        try {
            await deleteMovie(movie.id);
            // Remove from local array
            allMovies = allMovies.filter(m => m.id !== movie.id);
            // Re-render with current filters
            const filterEl = root.querySelector("#filter") as HTMLSelectElement;
            const sortByEl = root.querySelector("#sortBy") as HTMLSelectElement;
            renderMovies(root, filterEl.value, sortByEl.value);
            // Update count
            const filmCount = root.querySelector('#filmCount')! as HTMLElement;
            filmCount.textContent = `${allMovies.length} ${allMovies.length === 1 ? 'Movie' : 'Movies'}`;
        } catch (err) {
            console.error("Failed to remove movie:", err);
            alert("Failed to remove movie. Please try again.");
        }
    });
}
