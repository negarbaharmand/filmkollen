export function EmptyState(listName: string): HTMLElement {
  const section = document.createElement("section");
  section.className = "empty-state";

  section.innerHTML = `
    <div class="empty-state__icon">🎬</div>
    <p> ${listName} </p>
  `;

  return section;
}