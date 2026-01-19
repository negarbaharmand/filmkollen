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


// Används för att lagra filmer i watchlist och watched-listan -Ella
export interface DatabaseMovie {
    id: number;
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    release_date: string | null;
    vote_average: number | null;
    overview: string | null;
    status: 'watchlist' | 'watched';
    personal_rating: number | null;
    review: string | null;
    is_favorite: number;
    date_added: string;
    date_watched: string | null;
}


// Skickas till backend när man lägger till film i watchlist/watched -Ella
export interface CreateMovieRequest {
    tmdb_id: number;
    title: string;
    poster_path?: string | null;
    release_date?: string | null;
    vote_average?: number | null;
    overview?: string | null;
    status: 'watchlist' | 'watched';
    personal_rating?: number | null;
    review?: string | null;
    is_favorite?: boolean;
    date_watched?: string | null;
}