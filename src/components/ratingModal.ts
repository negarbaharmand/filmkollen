import type { Movie } from "../types/movie";
import { updateMovie } from "../services/movieApi";

let modalRoot: HTMLDivElement | null = null;

function ensureModalRoot(): HTMLDivElement {
  if (modalRoot) return modalRoot;

  modalRoot = document.createElement("div");
  modalRoot.className = "rating-modal-backdrop";
  modalRoot.setAttribute("role", "dialog");
  modalRoot.setAttribute("aria-modal", "true");
  modalRoot.style.display = "none";

  modalRoot.innerHTML = `
    <div class="rating-modal">
      <button class="rating-modal__close" aria-label="Close rating">&times;</button>
      <div class="rating-modal__content">
        <h2 class="rating-modal__title">Rate this movie</h2>
        <p class="rating-modal__movie-title"></p>
        <div class="rating-modal__stars" role="radiogroup" aria-label="Movie rating">
          <button class="star-btn" data-rating="1" aria-label="1 star" type="button">
            <span class="star">☆</span>
          </button>
          <button class="star-btn" data-rating="2" aria-label="2 stars" type="button">
            <span class="star">☆</span>
          </button>
          <button class="star-btn" data-rating="3" aria-label="3 stars" type="button">
            <span class="star">☆</span>
          </button>
          <button class="star-btn" data-rating="4" aria-label="4 stars" type="button">
            <span class="star">☆</span>
          </button>
          <button class="star-btn" data-rating="5" aria-label="5 stars" type="button">
            <span class="star">☆</span>
          </button>
        </div>
        <p class="rating-modal__selected-rating"></p>
        <div class="rating-modal__actions">
          <button class="rating-modal__btn rating-modal__btn--cancel" type="button">Cancel</button>
          <button class="rating-modal__btn rating-modal__btn--save" type="button" disabled>Save Rating</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  // Close on backdrop click
  modalRoot.addEventListener("click", (event) => {
    if (event.target === modalRoot) {
      closeRatingModal();
    }
  });

  // Close button
  const closeBtn = modalRoot.querySelector<HTMLButtonElement>(".rating-modal__close");
  closeBtn?.addEventListener("click", () => {
    closeRatingModal();
  });

  // Cancel button
  const cancelBtn = modalRoot.querySelector<HTMLButtonElement>(".rating-modal__btn--cancel");
  cancelBtn?.addEventListener("click", () => {
    closeRatingModal();
  });

  // Close on Escape key
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalRoot?.style.display === "flex") {
      closeRatingModal();
    }
  });

  return modalRoot;
}

export function closeRatingModal(): void {
  if (!modalRoot) return;
  modalRoot.style.display = "none";
  // Reset stars
  const starBtns = modalRoot.querySelectorAll<HTMLButtonElement>(".star-btn");
  starBtns.forEach(btn => {
    const star = btn.querySelector(".star");
    if (star) star.textContent = "☆";
    btn.classList.remove("active");
  });
  const selectedRatingEl = modalRoot.querySelector<HTMLParagraphElement>(".rating-modal__selected-rating");
  if (selectedRatingEl) selectedRatingEl.textContent = "";
  const saveBtn = modalRoot.querySelector<HTMLButtonElement>(".rating-modal__btn--save");
  if (saveBtn) saveBtn.disabled = true;
}

export function openRatingModal(
  movie: Movie,
  onRatingSaved?: (rating: number) => void
): void {
  const root = ensureModalRoot();

  const movieTitleEl = root.querySelector<HTMLParagraphElement>(".rating-modal__movie-title");
  const starBtns = root.querySelectorAll<HTMLButtonElement>(".star-btn");
  const selectedRatingEl = root.querySelector<HTMLParagraphElement>(".rating-modal__selected-rating");
  const saveBtn = root.querySelector<HTMLButtonElement>(".rating-modal__btn--save");

  if (!movieTitleEl || !selectedRatingEl || !saveBtn) {
    return;
  }

  movieTitleEl.textContent = movie.title;

  // Set current rating if exists
  let selectedRating: number | null = movie.personal_rating ?? null;
  
  if (selectedRating) {
    updateStarDisplay(starBtns, selectedRating);
    selectedRatingEl.textContent = `Your rating: ${selectedRating}/5`;
    saveBtn.disabled = false;
  } else {
    selectedRatingEl.textContent = "";
    saveBtn.disabled = true;
  }

  // Handle star clicks - get fresh reference after potential DOM updates
  const getStarButtons = () => root.querySelectorAll<HTMLButtonElement>(".star-btn");
  
  getStarButtons().forEach((btn, index) => {
    const rating = index + 1;
    
    // Remove previous listeners by cloning
    const newBtn = btn.cloneNode(true) as HTMLButtonElement;
    btn.replaceWith(newBtn);

    newBtn.addEventListener("click", () => {
      selectedRating = rating;
      const currentStarBtns = getStarButtons();
      updateStarDisplay(currentStarBtns, rating);
      selectedRatingEl.textContent = `Your rating: ${rating}/5`;
      saveBtn.disabled = false;
    });

    // Hover effect
    newBtn.addEventListener("mouseenter", () => {
      const currentStarBtns = getStarButtons();
      updateStarDisplay(currentStarBtns, rating, true);
    });
  });

  // Handle star container mouse leave
  const starsContainer = root.querySelector<HTMLDivElement>(".rating-modal__stars");
  if (starsContainer) {
    starsContainer.addEventListener("mouseleave", () => {
      const currentStarBtns = getStarButtons();
      if (selectedRating) {
        updateStarDisplay(currentStarBtns, selectedRating);
      } else {
        updateStarDisplay(currentStarBtns, 0);
      }
    });
  }

  // Handle save button
  const newSaveBtn = saveBtn.cloneNode(true) as HTMLButtonElement;
  saveBtn.replaceWith(newSaveBtn);

  newSaveBtn.addEventListener("click", async () => {
    if (selectedRating === null) return;

    newSaveBtn.disabled = true;
    newSaveBtn.textContent = "Saving...";

    try {
      await updateMovie(movie.id, { personal_rating: selectedRating });
      if (onRatingSaved) {
        onRatingSaved(selectedRating);
      }
      closeRatingModal();
    } catch (error) {
      console.error("Failed to save rating:", error);
      alert("Failed to save rating. Please try again.");
      newSaveBtn.disabled = false;
      newSaveBtn.textContent = "Save Rating";
    }
  });

  root.style.display = "flex";
}

function updateStarDisplay(
  starBtns: NodeListOf<HTMLButtonElement>,
  rating: number,
  isHover: boolean = false
): void {
  starBtns.forEach((btn, index) => {
    const star = btn.querySelector(".star");
    const starRating = index + 1;
    
    if (star) {
      if (starRating <= rating) {
        star.textContent = "★";
        star.className = "star filled";
        btn.classList.add("active");
      } else {
        star.textContent = "☆";
        star.className = "star";
        btn.classList.remove("active");
      }
    }
  });
}
