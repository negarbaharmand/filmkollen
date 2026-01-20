// src/views/browse/index.ts
import type { TMDBMovie } from "../../types/movie";
import { getPopularMovies, searchMovies } from "../../services/tmdbApi";
import { renderSearch } from "../../components/ search";
import { movieCard } from "../../components/movieCardTMDB";



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
