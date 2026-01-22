import { getMoviesByStatus, updateMovie, deleteMovie} from "../../services/movieApi";
import type { Movie } from "../../types/movie";
import { EmptyState } from '../../components/EmptyState';
import './style.css';

export function watched(): HTMLElement {
    const root = document.createElement("main");
    root.className = "watched-page";

    root.innerHTML = `
        <div class="watched-header">
            <h1>Watched Movies</h1>
        </div>
        <div class="filters">
            <button data-filter="all">All</button>
            <button data-filter="favorites">Favorites</button>
            <button data-filter="5">5⭐</button>
            <button data-filter="4">4⭐</button>
        </div>
        <p class="film-count" id="filmCount">Loading...</p>
        <div id="watchedContainer" class="movie-grid"></div>
    `;

    loadWatched(root);

    return root;
}

// Load watched movies
async function loadWatched(root: HTMLElement) {
    const container = root.querySelector('#watchedContainer')! as HTMLElement;
    const filmCount = root.querySelector('#filmCount')! as HTMLElement;

    try {
        const data = await getMoviesByStatus("watched"); // returns { movies: Movie[], totalCount: number }

        if (data.movies.length === 0) {
            container.innerHTML = "";
            container.appendChild(EmptyState("Your watched list is empty. Start watching movies!"));
            filmCount.textContent = `0 Movies`;
            return;
        }
        renderMovies(container, data.movies);
        filmCount.textContent = `${data.totalCount} ${data.totalCount === 1 ? 'Movie' : 'Movies'}`;

        // Setup filters
        const filterButtons = root.querySelectorAll(".filters button");
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const filter = (btn as HTMLButtonElement).dataset.filter!;
                let filtered: Movie[] = [];

                switch (filter) {
                    case "all":
                        filtered = data.movies;
                        break;
                    case "favorites":
                        filtered = data.movies.filter(m => m.is_favorite);
                        break;
                    case "5":
                    case "4":
                        filtered = data.movies.filter(m => m.personal_rating === Number(filter));
                        break;
                }

                renderMovies(container, filtered);
            });
        });

    
    } catch (err) {
        console.error("Error loading watched movies:", err);
        container.innerHTML = "<p class='empty-message'>Failed to load watched movies.</p>";
        filmCount.textContent = "0 Movies";
    }
}
// Render movies
function renderMovies(container: HTMLElement, movies: Movie[]) {
    container.innerHTML = "";

    if (movies.length === 0) {
        container.appendChild(EmptyState("No movies match your filter."));
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" />
            <h3>${movie.title} (${movie.releaseYear?.slice(0,4) ?? '—'})</h3>
            <div class="rating">Your rating: ${movie.personal_rating ?? '—'}</div>
            <button class="favorite-btn">${movie.is_favorite ? '★ Favorite' : '☆ Favorite'}</button>
            <button class="remove-btn">Remove</button>
            <button class="edit-btn">Edit Rating/Review</button>
        `;

        // Toggle favorite
        const favBtn = card.querySelector(".favorite-btn")!;
        favBtn.addEventListener("click", async () => {
            movie.is_favorite = !movie.is_favorite;
            favBtn.textContent = movie.is_favorite ? '★ Favorite' : '☆ Favorite';
            try {
                await updateMovie(movie.id, { is_favorite: movie.is_favorite });
            } catch (err) {
                console.error("Failed to update favorite:", err);
                // Revert on error
                movie.is_favorite = !movie.is_favorite;
                favBtn.textContent = movie.is_favorite ? '★ Favorite' : '☆ Favorite';
            }
        });

        // Remove movie
        const removeBtn = card.querySelector(".remove-btn")!;
        removeBtn.addEventListener("click", async () => {
            if (!confirm(`Are you sure you want to remove "${movie.title}" from your watched list?`)) {
                return;
            }
            try {
                await deleteMovie(movie.id);
                card.remove();
                // Reload the list to update count
                loadWatched(root);
            } catch (err) {
                console.error("Failed to remove movie:", err);
                alert("Failed to remove movie. Please try again.");
            }
        });

        // Edit rating/review
        const editBtn = card.querySelector(".edit-btn")!;
        editBtn.addEventListener("click", async () => {
            const rating = prompt("Enter your rating (1–5):", movie.personal_rating?.toString() ?? "");
            const review = prompt("Enter your review:", movie.review ?? "");
            if (rating) {
                const ratingNum = Number(rating);
                if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                    alert("Please enter a valid rating between 1 and 5.");
                    return;
                }
                const oldRating = movie.personal_rating;
                const oldReview = movie.review;
                movie.personal_rating = ratingNum;
                movie.review = review ?? "";
                card.querySelector(".rating")!.textContent = `Your rating: ${movie.personal_rating}`;
                try {
                    await updateMovie(movie.id, { personal_rating: movie.personal_rating, review: movie.review });
                } catch (err) {
                    console.error("Failed to update rating/review:", err);
                    // Revert on error
                    movie.personal_rating = oldRating;
                    movie.review = oldReview;
                    card.querySelector(".rating")!.textContent = `Your rating: ${movie.personal_rating ?? '—'}`;
                    alert("Failed to update rating/review. Please try again.");
                }
            }
        });

        container.appendChild(card);
    });
}
