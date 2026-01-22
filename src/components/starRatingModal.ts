import type { Movie } from "../types/movie";
import { updateMovie } from "../services/movieApi";

let modalRoot: HTMLDivElement | null = null;
let currentMovie: Movie | null = null;
let currentRating: number = 0;
let onRatingSaved: ((rating: number) => void) | null = null;

function ensureModalRoot(): HTMLDivElement {
  if (modalRoot) return modalRoot;

  modalRoot = document.createElement("div");
  modalRoot.className = "star-rating-modal-backdrop";
  modalRoot.setAttribute("role", "dialog");
  modalRoot.setAttribute("aria-modal", "true");
  modalRoot.style.display = "none";

  modalRoot.innerHTML = `
    <div class="star-rating-modal">
      <button class="star-rating-modal__close" aria-label="Close rating">&times;</button>
      <div class="star-rating-modal__content">
        <h2 class="star-rating-modal__title">Rate this movie</h2>
        <p class="star-rating-modal__movie-title"></p>
        <div class="star-rating-container">
          <div class="star-rating" role="radiogroup" aria-label="Movie rating">
            <button class="star" data-rating="1" aria-label="1 star" type="button">
              <span class="star-icon">☆</span>
            </button>
            <button class="star" data-rating="2" aria-label="2 stars" type="button">
              <span class="star-icon">☆</span>
            </button>
            <button class="star" data-rating="3" aria-label="3 stars" type="button">
              <span class="star-icon">☆</span>
            </button>
            <button class="star" data-rating="4" aria-label="4 stars" type="button">
              <span class="star-icon">☆</span>
            </button>
            <button class="star" data-rating="5" aria-label="5 stars" type="button">
              <span class="star-icon">☆</span>
            </button>
          </div>
          <p class="star-rating-text">Select your rating</p>
        </div>
        <div class="star-rating-modal__actions">
          <button class="star-rating-modal__btn star-rating-modal__btn--cancel">Cancel</button>
          <button class="star-rating-modal__btn star-rating-modal__btn--save" disabled>Save Rating</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  // Close on backdrop click
  modalRoot.addEventListener("click", (event) => {
    if (event.target === modalRoot) {
      closeStarRatingModal();
    }
  });

  // Close button
  const closeBtn = modalRoot.querySelector<HTMLButtonElement>(".star-rating-modal__close");
  closeBtn?.addEventListener("click", () => {
    closeStarRatingModal();
  });

  // Cancel button
  const cancelBtn = modalRoot.querySelector<HTMLButtonElement>(".star-rating-modal__btn--cancel");
  cancelBtn?.addEventListener("click", () => {
    closeStarRatingModal();
  });

  // Save button
  const saveBtn = modalRoot.querySelector<HTMLButtonElement>(".star-rating-modal__btn--save");
  saveBtn?.addEventListener("click", async () => {
    if (currentMovie && currentRating > 0) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
      try {
        await updateMovie(currentMovie.id, { personal_rating: currentRating });
        if (onRatingSaved) {
          onRatingSaved(currentRating);
        }
        closeStarRatingModal();
      } catch (error) {
        console.error("Failed to save rating:", error);
        alert("Failed to save rating. Please try again.");
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Rating";
      }
    }
  });

  // Star rating interaction
  const stars = modalRoot.querySelectorAll<HTMLButtonElement>(".star");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.rating || "0");
      setRating(rating);
    });

    star.addEventListener("mouseenter", () => {
      const rating = parseInt(star.dataset.rating || "0");
      highlightStars(rating);
    });
  });

  // Reset stars on mouse leave
  const starContainer = modalRoot.querySelector<HTMLDivElement>(".star-rating");
  starContainer?.addEventListener("mouseleave", () => {
    highlightStars(currentRating);
  });

  // Close on Escape key
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalRoot?.style.display === "flex") {
      closeStarRatingModal();
    }
  });

  return modalRoot;
}

function setRating(rating: number): void {
  currentRating = rating;
  highlightStars(rating);
  
  const saveBtn = modalRoot?.querySelector<HTMLButtonElement>(".star-rating-modal__btn--save");
  if (saveBtn) {
    saveBtn.disabled = rating === 0;
  }

  const ratingText = modalRoot?.querySelector<HTMLParagraphElement>(".star-rating-text");
  if (ratingText) {
    ratingText.textContent = rating > 0 ? `${rating} out of 5 stars` : "Select your rating";
  }
}

function highlightStars(rating: number): void {
  const stars = modalRoot?.querySelectorAll<HTMLButtonElement>(".star");
  if (!stars) return;

  stars.forEach((star, index) => {
    const starIcon = star.querySelector<HTMLSpanElement>(".star-icon");
    if (starIcon) {
      if (index < rating) {
        starIcon.textContent = "★";
        starIcon.classList.add("star-filled");
      } else {
        starIcon.textContent = "☆";
        starIcon.classList.remove("star-filled");
      }
    }
  });
}

export function closeStarRatingModal(): void {
  if (!modalRoot) return;
  modalRoot.style.display = "none";
  currentRating = 0;
  currentMovie = null;
  onRatingSaved = null;
}

export function openStarRatingModal(
  movie: Movie,
  onSave?: (rating: number) => void
): void {
  const root = ensureModalRoot();

  currentMovie = movie;
  currentRating = movie.personal_rating || 0;
  onRatingSaved = onSave || null;

  const movieTitleEl = root.querySelector<HTMLParagraphElement>(".star-rating-modal__movie-title");
  if (movieTitleEl) {
    movieTitleEl.textContent = movie.title;
  }

  // Set initial rating
  setRating(currentRating);

  root.style.display = "flex";
}
