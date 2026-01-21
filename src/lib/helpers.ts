

export function setupNavHighlighting() {
  const links = document.querySelectorAll("nav ul li a") as NodeListOf<HTMLAnchorElement>;

  if (!links.length) return;

  const highlight = () => {
    const currentPath = window.location.pathname.replace(/\/$/, "");

    links.forEach(link => {
      const linkPath = link.getAttribute("href")?.replace(/\/$/, "") || "";
      link.classList.toggle("active", linkPath === currentPath);
    });
  };

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = link.getAttribute("href")!;
      history.pushState(null, "", url);
      highlight();
      // TODO: load page content dynamically
    });
  });

  window.addEventListener("popstate", highlight);
  highlight();
}

export function attachDescriptionState() {
  const movieCards = document.querySelectorAll(".movie-card");

  if (!movieCards.length) return;

  movieCards.forEach((movieCard) => {
    const poster = movieCard.querySelector<HTMLElement>(".movie-card__poster");
    if (!poster) return;

    // Show description on hover
    movieCard.addEventListener("mouseenter", () => {
      movieCard.classList.add("show-description");

      // Hide description for all other cards
      const others = Array.from(movieCards).filter((card) => card !== movieCard);
      others.forEach((card) => card.classList.remove("show-description"));
    });

    // Hide description when leaving the card
    movieCard.addEventListener("mouseleave", () => {
      movieCard.classList.remove("show-description");
    });
  });
}

