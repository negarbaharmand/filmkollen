// src/views/browse/index.ts
import type { TMDBMovie } from "../../types/movie";
import { getPopularMovies, searchMovies, getPosterUrl } from "../../services/tmdbApi";
import { renderSearch } from "../../components/ search";
import { toggleWatchlist, toggleWatched } from "../../services/movieApi";
import store from "../../lib/store";

function movieCard(m: TMDBMovie): string {
    const poster = getPosterUrl(m.posterPath);
    const year = m.releaseDate ? m.releaseDate.slice(0, 4) : "—";
    const rating = Number.isFinite(m.voteAverage) ? m.voteAverage.toFixed(1) : "—";
    
    // Kollar om filmen finns i watchlist eller watched för att visa rätt knapptext -Ella
    const isInWatchlist = store.isInWatchlist(m.id);
    const isWatched = store.isWatched(m.id);

    return `
        <article class="movie-card" data-movie-id="${m.id}">
            <div class="movie-card__poster">
                ${
                    poster
                        ? `<img src="${poster}" alt="Poster for ${m.title}" loading="lazy" />`
                        : `<div class="poster-placeholder" aria-label="No poster available"></div>`
                }
            </div>
            <h3 class="movie-card__title">${m.title}</h3>
            <p class="movie-card__meta">⭐ ${rating} · ${year}</p>
            <p class="movie-card__overview">${m.overview ?? ""}</p>
            <div class="movie-card__actions">
                <!-- Watchlist-knapp: lägger till/tar bort film från watchlist -Ella -->
                <button class="btn-watchlist" data-action="watchlist">
                    ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                <!-- Watched-knapp: markerar film som sedd/osedd -Ella -->
                <button class="btn-watched" data-action="watched">
                    ${isWatched ? 'Mark as Unwatched' : 'Mark as Watched'}
                </button>
            </div>
        </article>
    `;
}

function renderSplit(topRoot: HTMLElement, restRoot: HTMLElement, movies: TMDBMovie[]) {
    const top5 = movies.slice(0, 5);
    const rest = movies.slice(5);

    topRoot.innerHTML = top5.length > 0 
        ? top5.map(movieCard).join("")
        : '<p class="empty-state">No movies found</p>';
    restRoot.innerHTML = rest.length > 0 
        ? rest.map(movieCard).join("")
        : "";
}

function renderError(root: HTMLElement, message: string) {
    root.innerHTML = `<p class="error-state" role="alert">${message}</p>`;
}

export default function browse(): HTMLElement {
    const root = document.createElement("main");
    root.className = "browse";

    root.innerHTML = `
        <section class="browse__header">
            <h1>Movies</h1>
            <div id="search-root"></div>
        </section>

        <section class="browse__section">
            <h2>Top 5</h2>
            <div id="top5" class="movie-grid" aria-live="polite"></div>
        </section>

        <section class="browse__section">
            <h2>More</h2>
            <div id="rest" class="movie-grid" aria-live="polite"></div>
        </section>
    `;

    const topRoot = root.querySelector<HTMLElement>("#top5")!;
    const restRoot = root.querySelector<HTMLElement>("#rest")!;
    const searchRoot = root.querySelector<HTMLElement>("#search-root")!;

    let popularCache: TMDBMovie[] = [];

    const loadPopular = async () => {
        topRoot.innerHTML = "Loading...";
        restRoot.innerHTML = "";
        try {
            await store.loadDatabaseMovies();
            popularCache = await getPopularMovies(1);
            renderSplit(topRoot, restRoot, popularCache);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load movies";
            renderError(topRoot, `Error: ${errorMessage}`);
            restRoot.innerHTML = "";
        }
    };

    void loadPopular();

    // Event listener för knappklick - hanterar watchlist/watched-knappar -Ella
    root.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const action = target.getAttribute('data-action');
        
        if (!action) return;
        
        const card = target.closest('.movie-card') as HTMLElement;
        if (!card) return;
        
        const movieId = parseInt(card.getAttribute('data-movie-id') || '0', 10);
        const movie = popularCache.find(m => m.id === movieId);
        
        if (!movie) return;
        
        try {
            // Anropar rätt toggle-funktion baserat på vilken knapp som klickades -Ella
            if (action === 'watchlist') {
                await toggleWatchlist(movie);
            } else if (action === 'watched') {
                await toggleWatched(movie);
            }
            
            // Laddar om databasen och uppdaterar vyn -Ella
            await store.loadDatabaseMovies();
            renderSplit(topRoot, restRoot, popularCache);
        } catch (error) {
            console.error('Error toggling movie status:', error);
            alert('Failed to update movie status. Please try again.');
        }
    });

    renderSearch(searchRoot, async (value: string) => {
        const q = value.trim();

        if (!q) {
            renderSplit(topRoot, restRoot, popularCache);
            return;
        }

        topRoot.innerHTML = "Searching...";
        restRoot.innerHTML = "";

        try {
            const results = await searchMovies(q, 1);
            // Uppdatera popularCache med sökresultat så knapparna fungerar -Ella
            popularCache = results;
            renderSplit(topRoot, restRoot, results);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to search movies";
            renderError(topRoot, `Error: ${errorMessage}`);
            restRoot.innerHTML = "";
        }
    });

    return root;
}
