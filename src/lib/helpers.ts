

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
