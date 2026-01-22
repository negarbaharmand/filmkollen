# Branch Review: `watched-page-implementation/fetch-function`

## Executive Summary

The branch implements a basic watched page with filtering and sorting, but has **critical data mapping issues** and **missing required features** according to the project requirements. The implementation does not overwrite working code, but the incomplete data mapping could cause runtime errors.

---

## ✅ What's Working

1. **Basic page structure**: The watched page route is properly integrated into the routing system
2. **Filter and sort UI**: Dropdowns for filtering and sorting are implemented
3. **Type improvements**: Changed `is_favorite` from `number` to `boolean` (good improvement)
4. **Type renaming**: `WatchlistResponse` → `ExpressMovieResponse` (better naming)
5. **Store integration**: Added watched movies state management to the store

---

## ❌ Critical Issues

### 1. **Incomplete Data Mapping in `getMoviesByStatus`** ⚠️ CRITICAL

**Location**: `src/services/movieApi.ts:15-34`

**Problem**: The function only maps 7 fields but the `Movie` interface requires 13 fields. Missing fields:
- `tmdb_id` 
- `status`
- `personal_rating`
- `review`
- `is_favorite`
- `date_watched`
- `adult`

**Impact**: This will cause TypeScript errors and runtime issues when accessing these properties.

**Current code**:
```typescript
return {
    movies: data.map((raw: ExpressMovie) => ({
        id: raw.id,
        poster: getPosterUrl(raw.poster_path),
        title: raw.title,
        releaseYear: raw.release_date ? new Date(raw.release_date).getFullYear() : 0,
        rating: raw.vote_average,
        addedDate: raw.date_added || new Date().toISOString(),
        overview: raw.overview
    })),
    totalCount: data.length,
};
```

**Should be**:
```typescript
return {
    movies: data.map((raw: ExpressMovie) => ({
        id: raw.id,
        tmdb_id: raw.tmdb_id,
        poster: getPosterUrl(raw.poster_path),
        title: raw.title,
        releaseYear: raw.release_date ? new Date(raw.release_date).getFullYear().toString() : "0",
        rating: raw.vote_average?.toString() ?? "0",
        overview: raw.overview ?? "",
        status: raw.status,
        personal_rating: raw.personal_rating,
        review: raw.review,
        is_favorite: Boolean(raw.is_favorite),
        addedDate: raw.date_added,
        date_watched: raw.date_watched,
        adult: false // TODO: Get from TMDB if needed
    })),
    totalCount: data.length,
};
```

---

## ❌ Missing Required Features

According to `README.md` lines 62-77, the watched page must include:

### Missing Feature 1: Personal Rating Display (1-5 stars)
**Requirement**: "Ditt personliga betyg (1–5 stjärnor)"  
**Status**: ❌ Missing - Currently shows TMDB rating instead

### Missing Feature 2: Favorite Toggle Button
**Requirement**: "Toggle 'Markera som favorit'"  
**Status**: ❌ Missing - No button to toggle favorite status

### Missing Feature 3: Remove Button
**Requirement**: "'Ta bort'-knapp"  
**Status**: ❌ Missing - No way to remove movies from watched list

### Missing Feature 4: Edit Rating/Review Button
**Requirement**: "'Redigera betyg/recension'-knapp"  
**Status**: ❌ Missing - No way to edit personal rating or review

### Missing Feature 5: Correct Filter Options
**Requirement**: "Efter betyg (5 stjärnor, 4 stjärnor, osv.)"  
**Status**: ❌ Incorrect - Currently filtering by TMDB rating (9+, 7+) instead of personal rating (1-5 stars)

---

## ⚠️ Logic Issues

### 1. **Wrong Field for Filtering**
**Location**: `src/views/watched/index.ts:16-19`

**Problem**: Filters by `movie.rating` (TMDB rating) instead of `movie.personal_rating`

```typescript
} else if (filter == "rating_gt_9") {
    return movies.filter(movie => Number(movie.rating) >= 9)  // ❌ Wrong field
} else if (filter == "rating_gt_7") {
    return movies.filter(movie => Number(movie.rating) >= 7)  // ❌ Wrong field
}
```

**Should filter by personal_rating** (1-5 stars):
```typescript
} else if (filter == "rating_5") {
    return movies.filter(movie => movie.personal_rating === 5)
} else if (filter == "rating_4") {
    return movies.filter(movie => movie.personal_rating === 4)
}
// etc.
```

### 2. **Wrong Field for Sorting by Date**
**Location**: `src/views/watched/index.ts:24-30`

**Problem**: Sorts by `addedDate` instead of `date_watched`

```typescript
if (sortBy == "date_added_desc") {
    return movieToSort.sort((a, b) => {
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();  // ❌ Wrong field
    })
}
```

**Should sort by `date_watched`**:
```typescript
if (sortBy == "date_watched_desc") {
    return movieToSort.sort((a, b) => {
        const dateA = a.date_watched ? new Date(a.date_watched).getTime() : 0;
        const dateB = b.date_watched ? new Date(b.date_watched).getTime() : 0;
        return dateB - dateA;
    })
}
```

### 3. **Missing Return Type**
**Location**: `src/views/watched/index.ts:10`

**Problem**: `filterMovies` function has no return type, and doesn't return in all code paths

```typescript
const filterMovies = (filter: string) => {  // ❌ No return type
    // ...
    // Missing return statement for some paths
}
```

**Should be**:
```typescript
const filterMovies = (filter: string): Movie[] | undefined => {
    // ...
}
```

### 4. **Double Rendering**
**Location**: `src/views/watched/index.ts:88-96`

**Problem**: `renderMovies()` is called twice - once inside `loadWatched()` and once after the promise resolves

```typescript
async function loadWatched(): Promise<void> {
    try {
        const data = await getMoviesByStatus("watched");
        movies = data.movies        
        renderMovies();  // ❌ Called here
    } catch (error) {
        console.error('Error loading watched movies:', error);
        renderMovies();  // ❌ And here
    }
}

// Then in watched():
loadWatched().then(() => {
    renderMovies(filterEl.value, sortByEl.value);  // ❌ Called again
});
```

---

## 🧹 Code Quality Issues

### 1. **Commented Test Code Should Be Removed**
**Location**: `src/views/browse/index.ts:7-28`

**Problem**: Commented code for testing should be deleted before merge

```typescript
//import { addMovie } from "../../services/movieApi";
//commented code is used to quickly add items to watched list for easier testing, to be deleted later on
// addMovie(movies[0], "watched")
// addMovie(movies[1], "watched")
// ... etc
```

### 2. **Duplicate Comment**
**Location**: `src/lib/store.ts:52, 64`

**Problem**: Same comment appears twice

```typescript
  // ========== WATCHED MOVIES ==========
  async loadWatchedMovies() { ... }

  // ========== WATCHED MOVIES ==========  // ❌ Duplicate
  async loadWatchListMovies() { ... }
```

**Should be**:
```typescript
  // ========== WATCHED MOVIES ==========
  async loadWatchedMovies() { ... }

  // ========== WATCHLIST MOVIES ==========
  async loadWatchListMovies() { ... }
```

### 3. **Inconsistent Formatting**
**Location**: `src/lib/helpers.ts`

**Problem**: Only formatting changes (indentation) - this is fine, but note that it's a style-only change

---

## ✅ Code That's NOT Overwritten

Good news: The branch does **not** overwrite working functionality:

1. ✅ **Watchlist page** - Still works, only text changed from Swedish to English
2. ✅ **Browse page** - Only commented test code added, no functional changes
3. ✅ **Type definitions** - `is_favorite: number → boolean` is an improvement
4. ✅ **Store** - New methods added, existing ones untouched
5. ✅ **Helpers** - Only formatting changes

---

## 📋 Recommendations

### Priority 1 (Must Fix Before Merge)
1. ✅ Fix `getMoviesByStatus` data mapping to include all required fields
2. ✅ Fix filtering to use `personal_rating` instead of `rating`
3. ✅ Fix sorting to use `date_watched` instead of `addedDate`
4. ✅ Add return types to functions

### Priority 2 (Required Features)
1. ✅ Display personal rating (1-5 stars) instead of TMDB rating
2. ✅ Add favorite toggle button
3. ✅ Add remove button
4. ✅ Add edit rating/review button
5. ✅ Update filter options to match requirements (5 stars, 4 stars, etc.)

### Priority 3 (Code Quality)
1. ✅ Remove commented test code from `browse/index.ts`
2. ✅ Fix duplicate comment in `store.ts`
3. ✅ Fix double rendering issue in `watched/index.ts`

---

## 🎯 Requirements Compliance Score

| Requirement | Status | Notes |
|------------|--------|-------|
| Display all watched movies | ✅ | Working |
| Show poster, title, release year | ✅ | Working |
| Show personal rating (1-5 stars) | ❌ | Shows TMDB rating instead |
| Toggle favorite button | ❌ | Missing |
| Remove button | ❌ | Missing |
| Edit rating/review button | ❌ | Missing |
| Filter: All watched | ✅ | Working |
| Filter: Favorites only | ✅ | Working |
| Filter: By personal rating | ❌ | Filters by TMDB rating instead |
| Sort by date watched | ❌ | Sorts by date_added instead |
| Sort by rating | ⚠️ | Sorts by TMDB rating, not personal |

**Overall Compliance: 4/11 (36%)**

---

## 🔍 Testing Recommendations

Before merging, test:
1. ✅ Verify watched movies load correctly
2. ✅ Test filtering by favorites
3. ✅ Test sorting functionality
4. ❌ Test personal rating display (currently broken)
5. ❌ Test favorite toggle (missing)
6. ❌ Test remove functionality (missing)
7. ❌ Test edit rating/review (missing)

---

## 📝 Summary

The branch provides a **foundation** for the watched page but is **not ready for merge** due to:
- Critical data mapping issues
- Missing required features (4 out of 11 requirements met)
- Incorrect filtering/sorting logic

**Recommendation**: Fix critical issues first, then implement missing features before merging to main.
