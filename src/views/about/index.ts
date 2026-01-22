// En enkel vy som visar en hårdkodad film med information om filmen.

const demoMovie = {
  title: "Cats",
  overview: "En grupp katter samlas för den årliga Jellicle-balen där en av dem ska väljas för ett nytt liv.",
  releaseYear: "2019",
  rating: "4.4",
  posterUrl: "https://www.themoviedb.org/t/p/w1280/aCNch5FmzT2WaUcY44925owIZXY.jpg"
};

export default function about() {
  const about = document.createElement("div");
  about.classList.add("about");

  about.innerHTML = `
    <section class="about-movie">
      <h2>Om filmen</h2>
      <div class="about-movie__card">
        <div class="about-movie__poster">
          <img src="${demoMovie.posterUrl}" alt="${demoMovie.title}" />
        </div>
        <div class="about-movie__content">
          <h3>${demoMovie.title} (${demoMovie.releaseYear})</h3>
          <p><strong>Betyg (TMDB):</strong> ${demoMovie.rating}</p>
          <p>${demoMovie.overview}</p>
        </div>
      </div>
    </section>
  `;

  return about;
}