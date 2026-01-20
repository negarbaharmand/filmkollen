//Types for TMDB + Database movies + request bodies
export interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    posterPath: string | null;
    releaseDate: string;
    voteAverage: number;
}

// Raw API response types (snake_case from TMDB API)
export type TMDBListResponse<T> = {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
};

export type TMDBMovieRaw = {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
};


// Types for Watchlist movies
export interface WatchlistMovieRaw {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    added_date?: string;
}


export interface WatchlistMovie {
    id: number;
    poster: string | null;
    title: string;
    releaseYear: string;
    rating: number;
    addedDate: string;
}


export interface WatchlistResponse {
    movies: WatchlistMovie[];
    totalCount: number;
}