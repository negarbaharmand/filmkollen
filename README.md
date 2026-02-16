# Filmkollen 🍿

## 📋 Overview

Filmkollen is a movie tracking application built with TypeScript. Users can browse movies, manage their watchlist, and track watched movies with personal ratings and reviews. The app uses the TMDB API for movie data and an Express/SQLite backend for user data.

![Overview of the app](./public/UI.png)

## ✨ Features

### Browse & Search (`/`)

- Browse popular movies from TMDB
- Real-time search with debouncing
- Movie cards with poster, title, rating, release year, and description
- Add to watchlist or mark as watched
- Movie details modal

### Watchlist (`/watchlist`)

- View all movies in your watchlist
- Shows date added
- Mark as watched or remove from list
- Empty state handling

### Watched Movies (`/watched`)

- View all watched movies with personal ratings (1-5 stars)
- Filter by favorites, rating, or TMDB score
- Sort by date watched or rating
- Edit ratings/reviews, toggle favorites, remove movies

---

## 🛠️ Tech Stack

- **Frontend:** TypeScript, Vite, Vanilla JS (SPA)
- **Backend:** Express.js, SQLite
- **API:** TMDB API for movie data
- **State Management:** Custom Store class
- **Styling:** CSS with responsive design

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Setup

1. **Backend:**

```bash
cd server
npm install
npm run dev
# Backend runs on http://localhost:3000
```

2. **Frontend:**

```bash
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

3. **Environment Variables:**
   Create a `.env` file in the root directory:

```
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

---

## 📚 Key Implementation Details

- **TMDB Integration:** Fetches popular movies and search results, handles image URLs
- **Backend API:** Full CRUD operations for movies (GET, POST, PUT, DELETE)
- **State Management:** Global store for watchlist and watched movies with reactive updates
- **TypeScript:** Strict typing throughout, no `any` types
- **Error Handling:** User-friendly error messages and loading states
- **Accessibility:** ARIA attributes, keyboard navigation, semantic HTML

---

## 📚 Resources

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
