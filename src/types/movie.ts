export interface Movie {
    id: number;
    title: string;
    overview: string;
    posterPath: string | null;
    releaseDate: string;
    voteAverage: number;
  }