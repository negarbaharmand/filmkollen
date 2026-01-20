// API-anrop till Movie API
import type { DatabaseMovie, CreateMovieRequest, UpdateMovieRequest, TMDBMovie } from "../types/movie";

const API_BASE_URL = "http://localhost:3000/api";

// Get all movies from database
export async function getAllMovies(): Promise<DatabaseMovie[]> {
    const res = await fetch(`${API_BASE_URL}/movies`);
    if (!res.ok) throw new Error(`Failed to fetch movies: ${res.status}`);
    return await res.json();
}

// Get movies by status (watchlist or watched)
export async function getMoviesByStatus(status: 'watchlist' | 'watched'): Promise<DatabaseMovie[]> {
    const res = await fetch(`${API_BASE_URL}/movies?status=${status}`);
    if (!res.ok) throw new Error(`Failed to fetch ${status} movies: ${res.status}`);
    return await res.json();
}

// Check if a movie exists in database by tmdb_id
export async function findMovieByTmdbId(tmdbId: number): Promise<DatabaseMovie | null> {
    const movies = await getAllMovies();
    return movies.find(m => m.tmdb_id === tmdbId) || null;
}

// Add movie to watchlist or watched
export async function addMovie(movie: TMDBMovie, status: 'watchlist' | 'watched'): Promise<DatabaseMovie> {
    const body: CreateMovieRequest = {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.posterPath,
        release_date: movie.releaseDate,
        vote_average: movie.voteAverage,
        overview: movie.overview,
        status: status,
        date_watched: status === 'watched' ? new Date().toISOString() : null
    };

    const res = await fetch(`${API_BASE_URL}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to add movie: ${res.status}`);
    }

    return await res.json();
}

// Update existing movie in database -Ella
export async function updateMovie(id: number, updates: UpdateMovieRequest): Promise<DatabaseMovie> {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });

    if (!res.ok) throw new Error(`Failed to update movie: ${res.status}`);
    return await res.json();
}

// Delete movie from database
export async function deleteMovie(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'DELETE'
    });

    if (!res.ok) throw new Error(`Failed to delete movie: ${res.status}`);
}


// Toggles between adding and removing movie from watchlist -Ella
export async function toggleWatchlist(movie: TMDBMovie): Promise<DatabaseMovie | null> {
    const existing = await findMovieByTmdbId(movie.id);
    
    if (existing && existing.status === 'watchlist') {
        // Remove from watchlist
        await deleteMovie(existing.id);
        return null;
    } else if (existing && existing.status === 'watched') {
        // Movie is watched, don't add to watchlist
        return existing;
    } else {
        // Add to watchlist
        return await addMovie(movie, 'watchlist');
    }
}


// Toggles between marking movie as watched and removing from watched -Ella
export async function toggleWatched(movie: TMDBMovie): Promise<DatabaseMovie | null> {
    const existing = await findMovieByTmdbId(movie.id);
    
    if (existing && existing.status === 'watched') {
        // Remove from watched
        await deleteMovie(existing.id);
        return null;
    } else if (existing && existing.status === 'watchlist') {
        // Update status from watchlist to watched -Ella
        return await updateMovie(existing.id, {
            status: 'watched',
            date_watched: new Date().toISOString()
        });
    } else {
        // Add as watched
        return await addMovie(movie, 'watched');
    }
}




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


