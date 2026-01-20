// src/views/browse/index.ts
import type { TMDBMovie } from "../../types/movie";
import { getPopularMovies, searchMovies, getPosterUrl } from "../../services/tmdbApi";
import { renderSearch } from "../../components/ search";

// MOCKING MOVIE DURATION, AGE LIMIT, ACTORS LIST


function movieCard(m: TMDBMovie, index: number): string {
    const poster = getPosterUrl(m.posterPath);
    const year = m.releaseDate ? m.releaseDate.slice(0, 4) : "—";
    const rating = Number.isFinite(m.voteAverage) ? m.voteAverage.toFixed(1) : "—";

    return `
        <article class="movie-card" >
            <div class="movie-card__poster">
                ${
                    poster
                        ? `<img src="${poster}" alt="Poster for ${m.title}" loading="lazy" />`
                        : `<div class="poster-placeholder" aria-label="No poster available"></div>`
                }
            </div>
            <div class="movie-card__details">
                <p class="movie-card__rating">⭐ ${rating} </p>
                <h3 class="movie-card__title">${m.title}</h3>
                <p class="movie-card__meta">${year} · 3h 1m  · 11+ </p>
                <div class="movie-card__overview-wrapper">
                    <p class="movie-card__overview">${m.overview ?? ""}</p>
                </div>
                <div class="movie-card__footer">
                    <p class="movie-card__actors">Sam Worthington, Zoe Saldana, Sigourney weaver</p>
                    <div class="movie-card__actions">
                        <button id="addToWatched"><i class="fa-solid fa-eye fa-xl"></i></button>
                        <button id="addToWatchlist">+</button>
                    </div>
                </div>
            </div>
            <p class="movie-card__place" >0${index + 1}</p>
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

    attachDescriptionState()
}

function renderError(root: HTMLElement, message: string) {
    root.innerHTML = `<p class="error-state" role="alert">${message}</p>`;
}

export default function browse(): HTMLElement {
    const root = document.createElement("main");
    root.className = "browse";

    root.innerHTML = `

        <section class="browse__section">
            <h2>Top 5</h2>
            <div id="top5" class="movie-flex" aria-live="polite"></div>
        </section>

        <section class="browse__search">
            <div id="search-root"></div>
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
            popularCache = await getPopularMovies(1);
            renderSplit(topRoot, restRoot, popularCache);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load movies";
            renderError(topRoot, `Error: ${errorMessage}`);
            restRoot.innerHTML = "";
        }
    };

    void loadPopular();

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
            renderSplit(topRoot, restRoot, results);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to search movies";
            renderError(topRoot, `Error: ${errorMessage}`);
            restRoot.innerHTML = "";
        }
    });

    return root;
}

function attachDescriptionState() {
    const top5MovieCards = document.querySelectorAll(".movie-card")
    top5MovieCards?.forEach(movieCard => {
        const poster = movieCard.querySelector(".movie-card__poster")
        poster?.addEventListener("click", () => {
            movieCard.classList.toggle("show-description")
            if (movieCard.classList.contains("show-description")) {
                const rest = Array.from(top5MovieCards).filter(movie => movie !== movieCard);
                rest.forEach(card => card.classList.remove("show-description"));            
            }
        })
    })
}
