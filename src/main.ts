import "./style.css";
import { setRenderCallback } from "./lib/store.ts";
import { watched } from "./views/watched/index.ts";

// static HTML
import headerHTML from "./views/static/header/index.html?raw";
import footerHTML from "./views/static/footer/index.html?raw";

// Dynamic pages
import browse from "./views/browse/index.ts";
import about from "./views/about/index.ts";
import { setupNavHighlighting } from "./lib/helpers.ts";
import watchlist from "./views/watchlist/index.ts";  



document.addEventListener("DOMContentLoaded", () => {
  setupNavHighlighting();
});
 
const currentPage = (): string | HTMLElement => {
  const path = window.location.pathname;
  switch (path) {
    case "/":
      return browse();
    case "/about":
      return about();
    case "/watchlist":  
      return watchlist();
    case "/watched":
      return watched(); 
    default:
      return "404";
  }
};

const app = document.querySelector("#app")!;

//function to render the app
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
  // Re-run nav highlighting after the new DOM exists
  setupNavHighlighting();
};

//initialise app rendering
//if the app change, it rerenders the app
renderApp();

window.addEventListener("popstate", () => {
  renderApp();
});
//Intercepting link and handling navigation
//This prevents full page reloads and keeps the state of the SPA
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

//Set render callback to re-render app on state changes
setRenderCallback(renderApp);