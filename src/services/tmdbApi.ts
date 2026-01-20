// Simple helper module for talking to the TMDB API from the frontend.
// It does three things:
// 1) Fetch popular movies
// 2) Search for movies
// 3) Build full image URLs for posters

// TMDBMovieRaw = shape from TMDB API (poster_path, release_date, ...)
// TMDBMovie    = our own cleaned shape (posterPath, releaseDate, ...)
import type { TMDBMovie, TMDBMovieRaw } from "../types/movie";

// Vite exposes env variables on import.meta.env.
// These must be defined in a .env file with VITE_ prefix.
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL as string;
export const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string;

// Convert one "raw" TMDB movie object (from the API) into our own TMDBMovie type.
function transformMovie(raw: TMDBMovieRaw): TMDBMovie {
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview,
    posterPath: raw.poster_path,
    releaseDate: raw.release_date,
    voteAverage: raw.vote_average,
  };
}

// ========== POPULAR ==========
// Fetch a page of "popular" movies from TMDB.
// page = which result page we want (1, 2, 3, ...)

export async function getPopularMovies(page = 1): Promise<TMDBMovie[]> {
  const url =
    `${TMDB_BASE_URL}/movie/popular` +
    `?api_key=${TMDB_API_KEY}` +
    `&language=en-US` +
    `&page=${page}`;

  // Call TMDB with fetch
  const res = await fetch(url);
  if (!res.ok) {
    // If TMDB returns an error status (e.g. 401, 404, 500) we throw.
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  // Parse JSON and map the "results" array to our TMDBMovie type.
  const data = (await res.json()) as { results: TMDBMovieRaw[] };
  return data.results.map(transformMovie);
}

// ========== SEARCH ==========
// Search for movies by text query.

export async function searchMovies(query: string, page = 1): Promise<TMDBMovie[]> {
  const trimmed = query.trim();
  // If user hasn't typed anything, we just return an empty list.
  if (!trimmed) return [];

  const url =
    `${TMDB_BASE_URL}/search/movie` +
    `?api_key=${TMDB_API_KEY}` +
    `&language=en-US` +
    `&include_adult=false` +
    `&page=${page}` +
    `&query=${encodeURIComponent(trimmed)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  const data = (await res.json()) as { results: TMDBMovieRaw[] };
  return data.results.map(transformMovie);
}

// ========== POSTER URL ==========
// Helper for turning a "poster path" from TMDB into a full image URL.
// If there is no poster, we return null so the UI can show a placeholder.

export function getPosterUrl(posterPath: string | null | undefined): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}
