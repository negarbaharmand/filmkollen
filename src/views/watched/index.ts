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
            container.appendChild(EmptyState("watched list"));
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
        container.appendChild(EmptyState("watched list"));
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" />
            <h3>${movie.title} (${movie.releaseYear?.slice(0,4) ?? '—'})</h3>
            <div class="rating">Your rating: ${movie.rating ?? '—'}</div>
            <button class="favorite-btn">${movie.is_favorite ? '★ Favorite' : '☆ Favorite'}</button>
            <button class="remove-btn">Remove</button>
            <button class="edit-btn">Edit Rating/Review</button>
        `;

        // Toggle favorite
        const favBtn = card.querySelector(".favorite-btn")!;
        favBtn.addEventListener("click", async () => {
            movie.is_favorite = movie.is_favorite ? 0 : 1;
            favBtn.textContent = movie.is_favorite ? '★ Favorite' : '☆ Favorite';
            try {
                await updateMovie(movie.id, { is_favorite: movie.is_favorite === 1});
            } catch (err) {
                console.error("Failed to update favorite:", err);
            }
        });

        // Remove movie
        const removeBtn = card.querySelector(".remove-btn")!;
        removeBtn.addEventListener("click", async () => {
            try {
                await deleteMovie(movie.id);
                container.removeChild(card);
            } catch (err) {
                console.error("Failed to remove movie:", err);
            }
        });

        // Edit rating/review
        const editBtn = card.querySelector(".edit-btn")!;
        editBtn.addEventListener("click", async () => {
            const rating = prompt("Enter your rating (1–5):", movie.personal_rating?.toString() ?? "");
            const review = prompt("Enter your review:", movie.review ?? "");
            if (rating) {
                movie.personal_rating = Number(rating);
                movie.review = review ?? "";
                card.querySelector(".rating")!.textContent = `Your rating: ${movie.personal_rating}`;
                try {
                    await updateMovie(movie.id, { personal_rating: movie.personal_rating, review: movie.review });
                } catch (err) {
                    console.error("Failed to update rating/review:", err);
                }
            }
        });

        container.appendChild(card);
    });
}
