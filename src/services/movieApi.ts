// API-anrop till Movie API




//fetch function for user watchlist, ratings, etc.
//Create a fetch function like getWatchList(user) that will be fetching a list of films in users watchlist. 
// Make sure that function returns list of films that
//  include: poster, title, release year, rating, date when added to watchlist, count of all films in watchlist.

//Importing necessary types
import type { WatchlistResponse, WatchlistMovieRaw} from "../types/movie";
import { getPosterUrl } from "./tmdbApi";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL as string;
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN as string;
const TMDB_ACCOUNT_ID = import.meta.env.VITE_TMDB_ACCOUNT_ID as string;

// Function to get user's watchlist from TMDB ('accept' means we want JSON response, 'authorization' is for access token and 'bearer' is type of token)
export async function getWatchList(user: string): Promise<WatchlistResponse> {
    const url = `${TMDB_BASE_URL}/account/${user}/watchlist/movies?language=sv-SE&page=1&sort_by=created_at.desc`;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`
        }
    });
    
    if (!res.ok) throw new Error(`TMDB Watchlist request failed: ${res.status}`);

    const data = await res.json();

    
// Here we map the raw data from TMDB to our WatchlistMovie type. Raw meaning the original format from TMDB API.
    return {
        movies: data.results.map((raw: WatchlistMovieRaw) => ({
            id: raw.id,
            poster: getPosterUrl(raw.poster_path),
            title: raw.title,
            releaseYear: raw.release_date
                ? new Date(raw.release_date).getFullYear()
                : 0,
            rating: raw.vote_average,
            addedDate: raw.added_date || new Date().toISOString(),
        })),
        totalCount: data.total_results,
    };
}


