// src/views/browse/index.ts
import type { TMDBMovie } from "../../types/movie";
import { getPopularMovies, searchMovies } from "../../services/tmdbApi";
import { renderSearch } from "../../components/ search";
import { movieCard } from "../../components/movieCardTMDB";
import { attachDescriptionState } from "../../lib/helpers";
//import { addMovie } from "../../services/movieApi";


//commented code is used to quickly add items to watched list for easier testing, to be deleted later on

function renderSplit(topRoot: HTMLElement, restRoot: HTMLElement, movies: TMDBMovie[]) {
    const top5 = movies.slice(0, 5);
    const rest = movies.slice(5);

    

    // addMovie(movies[0], "watched")
    // addMovie(movies[1], "watched")
    // addMovie(movies[2], "watched")
    // addMovie(movies[3], "watched")
    // addMovie(movies[4], "watched")
    // addMovie(movies[5], "watched")
    // addMovie(movies[6], "watched")
    // addMovie(movies[7], "watched")
    // addMovie(movies[8], "watched")
    // addMovie(movies[9], "watched")
    // addMovie(movies[10], "watched")


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

