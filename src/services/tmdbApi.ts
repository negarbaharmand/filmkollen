// API-anrop till TMDB API
//Only fetch from TMDB: popular, search, details, image URL building
// src/services/tmdbApi.ts
import type { TMDBMovie, TMDBListResponse, TMDBMovieRaw } from "../types/movie";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

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

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${path}`);
    const searchParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: "en-US",
        ...params,
    });
    url.search = searchParams.toString();

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
    return (await res.json()) as T;
}

async function fetchMovies(path: string, params: Record<string, string>): Promise<TMDBMovie[]> {
    const data = await tmdbFetch<TMDBListResponse<TMDBMovieRaw>>(path, params);
    return data.results.map(transformMovie);
}

export async function getPopularMovies(page = 1): Promise<TMDBMovie[]> {
    return fetchMovies("/movie/popular", { page: String(page) });
}

export async function searchMovies(query: string, page = 1): Promise<TMDBMovie[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return fetchMovies("/search/movie", {
        query: trimmed,
        page: String(page),
        include_adult: "false",
    });
}

export function getPosterUrl(posterPath: string | null | undefined): string | null {
    if (!posterPath) return null;
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}
