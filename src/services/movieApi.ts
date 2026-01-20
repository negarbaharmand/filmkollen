// API-anrop till Movie API
import type { Movie, TMDBMovie, WatchlistResponse, ExpressMovie } from "../types/movie";
import { getPosterUrl } from "./tmdbApi";

const API_BASE_URL = "http://localhost:3000/api";

// Get all movies from database
export async function getAllMovies(): Promise<Movie[]> {
    const res = await fetch(`${API_BASE_URL}/movies`);
    if (!res.ok) throw new Error(`Failed to fetch movies: ${res.status}`);
    return await res.json();
}

// Get movies by status (watchlist or watched)
export async function getMoviesByStatus(status: 'watchlist' | 'watched'): Promise<WatchlistResponse> {
    const res = await fetch(`${API_BASE_URL}/movies?status=${status}`);
    if (!res.ok) throw new Error(`Failed to fetch ${status} movies: ${res.status}`);
    const data = await res.json();

    return {
        movies: data.map((raw: ExpressMovie) => ({
            id: raw.id,
            poster: getPosterUrl(raw.poster_path),
            title: raw.title,
            releaseYear: raw.release_date
                ? new Date(raw.release_date).getFullYear()
                : 0,
            rating: raw.vote_average,
            addedDate: raw.date_added || new Date().toISOString(),
        })),
        totalCount: data.length,
    };
}

// Check if a movie exists in database by tmdb_id
export async function findMovieByTmdbId(tmdbId: number): Promise<Movie | null> {
    const movies = await getAllMovies();
    return movies.find(m => m.tmdb_id === tmdbId) || null;
}

// Add movie to watchlist or watched
export async function addMovie(movie: TMDBMovie, status: 'watchlist' | 'watched'): Promise<Movie> {
    const body: Omit<ExpressMovie, 'id'> = {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster,
        release_date: movie.releaseYear,
        vote_average: Number(movie.rating) ?? 0,
        overview: movie.overview,
        status: status,
        date_watched: status === 'watched' ? new Date().toISOString() : null,
        personal_rating: 5.0,
        review: "",
        is_favorite: true,
        date_added: "not defined"
        
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

// Delete movie from database
export async function deleteMovie(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'DELETE'
    });

    if (!res.ok) throw new Error(`Failed to delete movie: ${res.status}`);
}


// Toggles between adding and removing movie from watchlist -Ella
export async function toggleWatchlist(movie: TMDBMovie): Promise<Movie | null> {
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
export async function toggleWatched(movie: TMDBMovie): Promise<Movie | null> {
    const existing = await findMovieByTmdbId(movie.id);
    
    if (existing && existing.status === 'watched') {
        // Remove from watched
        await deleteMovie(existing.id);
        return null;
    } else if (existing && existing.status === 'watchlist') {
        // Remove from watchlist first, then add as watched
        await deleteMovie(existing.id);
        return await addMovie(movie, 'watched');
    } else {
        // Add as watched
        return await addMovie(movie, 'watched');
    }
}