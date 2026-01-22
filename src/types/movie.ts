
// Raw API response types (snake_case from TMDB API)
export type TMDBListResponse<T> = {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
};
// type for data we GET for TMDB movies
export type TMDBMovieRaw = {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    adult: boolean,
};


// type to store movies in watchlist and watched list 
export interface Movie {
    id: number;
    tmdb_id: number;
    title: string;
    poster: string | null;
    releaseYear: string;
    rating: string;
    overview: string;
    status: 'watchlist' | 'watched';
    personal_rating: number | null;
    review: string | null;
    is_favorite: boolean;
    addedDate: string;
    date_watched: string | null;
    adult: boolean,
}

// type for movies in browse page that dont yet have an instance in our db
export interface TMDBMovie extends Omit<Movie, 'tmdb_id' | 'status' | 'personal_rating' | 'review' | 'is_favorite' | 'addedDate' | 'date_watched'> {
  tmdb_id: undefined; 
}


// type of movie we send/receive from exress db
export interface ExpressMovie {
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
    is_favorite: boolean;
    date_added: string;
    date_watched: string | null;
}

// type for response when we fetch watchlist
export interface WatchlistResponse {
    movies: Movie[];
    totalCount: number;
}

// type for response when we fetch movies (alias for consistency)
export interface ExpressMovieResponse {
    movies: Movie[];
    totalCount: number;
}

// type for updating a movie in the database
export interface UpdateMovieRequest {
    status?: 'watchlist' | 'watched';
    personal_rating?: number | null;
    review?: string | null;
    is_favorite?: boolean;
    date_watched?: string | null;
}
