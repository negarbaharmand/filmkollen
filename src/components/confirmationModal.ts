let modalRoot: HTMLDivElement | null = null;
let resolvePromise: ((confirmed: boolean) => void) | null = null;

function ensureModalRoot(): HTMLDivElement {
  if (modalRoot) return modalRoot;

  modalRoot = document.createElement("div");
  modalRoot.className = "confirmation-modal-backdrop";
  modalRoot.setAttribute("role", "dialog");
  modalRoot.setAttribute("aria-modal", "true");
  modalRoot.style.display = "none";

  modalRoot.innerHTML = `
    <div class="confirmation-modal">
      <button class="confirmation-modal__close" aria-label="Close">&times;</button>
      <div class="confirmation-modal__content">
        <h2 class="confirmation-modal__title">Confirm Action</h2>
        <p class="confirmation-modal__message"></p>
        <div class="confirmation-modal__actions">
          <button class="confirmation-modal__btn confirmation-modal__btn--cancel" type="button">Cancel</button>
          <button class="confirmation-modal__btn confirmation-modal__btn--confirm" type="button">Confirm</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  // Close on backdrop click
  modalRoot.addEventListener("click", (event) => {
    if (event.target === modalRoot) {
      closeConfirmationModal(false);
    }
  });

  // Close button
  const closeBtn = modalRoot.querySelector<HTMLButtonElement>(".confirmation-modal__close");
  closeBtn?.addEventListener("click", () => {
    closeConfirmationModal(false);
  });

  // Cancel button
  const cancelBtn = modalRoot.querySelector<HTMLButtonElement>(".confirmation-modal__btn--cancel");
  cancelBtn?.addEventListener("click", () => {
    closeConfirmationModal(false);
  });

  // Confirm button
  const confirmBtn = modalRoot.querySelector<HTMLButtonElement>(".confirmation-modal__btn--confirm");
  confirmBtn?.addEventListener("click", () => {
    closeConfirmationModal(true);
  });

  // Close on Escape key
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalRoot?.style.display === "flex") {
      closeConfirmationModal(false);
    }
  });

  return modalRoot;
}

function closeConfirmationModal(confirmed: boolean): void {
  if (!modalRoot) return;
  modalRoot.style.display = "none";
  if (resolvePromise) {
    resolvePromise(confirmed);
    resolvePromise = null;
  }
}

export function showConfirmationModal(message: string, title: string = "Confirm Action"): Promise<boolean> {
  const root = ensureModalRoot();

  const titleEl = root.querySelector<HTMLHeadingElement>(".confirmation-modal__title");
  const messageEl = root.querySelector<HTMLParagraphElement>(".confirmation-modal__message");

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;

  root.style.display = "flex";

  return new Promise<boolean>((resolve) => {
    resolvePromise = resolve;
  });
}
