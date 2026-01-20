import "./style.css";
import { setRenderCallback } from "./lib/store.ts";

// static HTML
import headerHTML from "./views/static/header/index.html?raw";
import footerHTML from "./views/static/footer/index.html?raw";

// Dynamic pages
import browse from "./views/browse/index.ts";
import about from "./views/about/index.ts";
import watchlist from "./views/watchlist/index.ts";  

const currentPage = (): string | HTMLElement => {
  const path = window.location.pathname;
  switch (path) {
    case "/":
      return browse();
    case "/about":
      return about();
    case "/watchlist":  
      return watchlist();
    default:
      return "404";
  }
};

const app = document.querySelector("#app")!;

const renderApp = () => {
  const page = currentPage();
    
  if(typeof page === "string") {
    app.innerHTML = `
          ${headerHTML} 
          ${page} 
          ${footerHTML}`;
  } else {
    app.innerHTML = 
    `${headerHTML} 
     ${footerHTML}`;

     app.insertBefore(page, app.querySelector("footer")!);
  }
};

renderApp();

window.addEventListener("popstate", () => {
  renderApp();
});

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const link = target.closest("a");
  
  if (link && link.href.startsWith(window.location.origin)) {
    e.preventDefault();
    const path = new URL(link.href).pathname;
    window.history.pushState({}, "", path);
    renderApp();
  }
});

setRenderCallback(renderApp);