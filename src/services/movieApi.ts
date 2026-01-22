// API-anrop till Movie API
import type { Movie, TMDBMovie, WatchlistResponse, ExpressMovie, UpdateMovieRequest } from "../types/movie";
import type { Movie, TMDBMovie, ExpressMovie, ExpressMovieResponse } from "../types/movie";
import { getPosterUrl } from "./tmdbApi";

const API_BASE_URL = "http://localhost:3000/api";

// Get all movies from database
export async function getAllMovies(): Promise<Movie[]> {
    const res = await fetch(`${API_BASE_URL}/movies`);
    if (!res.ok) throw new Error(`Failed to fetch movies: ${res.status}`);
    return await res.json();
}

// Get movies by status (watchlist or watched)
export async function getMoviesByStatus(status: 'watchlist' | 'watched'): Promise<ExpressMovieResponse> {
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
            overview: raw.overview
        })),
        totalCount: data.length,
    };
}

// Check if a movie exists in database by tmdb_id
export async function findMovieByTmdbId(tmdbId: number): Promise<Movie | null> {
    const movies = await getAllMovies();
    return movies.find(m => m.tmdb_id === tmdbId) || null;
}

// Add movie to database - accepts structured data
export async function addMovie(movieData: {
    tmdb_id: number;
    title: string;
    poster_path: string;
    release_date: number;
    vote_average: number;
    overview: string;
    status: 'watchlist' | 'watched';
}): Promise<Movie> {
    const body: Omit<ExpressMovie, 'id'> = {
        tmdb_id: movieData.tmdb_id,
        title: movieData.title,
        poster_path: movieData.poster_path,
        release_date: String(movieData.release_date),
        vote_average: movieData.vote_average,
        overview: movieData.overview,
        status: movieData.status,
        date_watched: movieData.status === 'watched' ? new Date().toISOString() : null,
        personal_rating: 5.0,
        review: "",
        is_favorite: true,
        date_added: new Date().toISOString()
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

// Update existing movie in database
export async function updateMovie(id: number, updates: UpdateMovieRequest): Promise<Movie> {
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