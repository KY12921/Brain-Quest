// ------------------------------------------------------------------
// Brain Quest — Welcome carousel, shown once per device before the
// first sign-in/sign-up. "Seen" is tracked in localStorage (device
// preference, same pattern as the light/dark toggle) since there's
// no account yet at this point to store it against.
// ------------------------------------------------------------------

let _carouselIndex = 0;
const CAROUSEL_SLIDE_COUNT = 3;

function goToCarouselSlide(index) {
  _carouselIndex = index;
  for (let i = 0; i < CAROUSEL_SLIDE_COUNT; i++) {
    document.getElementById(`carousel-slide-${i}`).classList.toggle("hidden", i !== index);
    document.getElementById(`carousel-dot-${i}`).classList.toggle("active", i === index);
  }
  document.getElementById("carousel-next-btn").textContent = index === CAROUSEL_SLIDE_COUNT - 1 ? "Get Started" : "Next";
}

function hasSeenWelcomeCarousel() {
  try { return localStorage.getItem("bqSeenWelcomeCarousel") === "true"; } catch (e) { return false; }
}

function finishCarousel() {
  try { localStorage.setItem("bqSeenWelcomeCarousel", "true"); } catch (e) {}
  showScreen("auth-section");
}

document.getElementById("carousel-next-btn").addEventListener("click", () => {
  if (_carouselIndex < CAROUSEL_SLIDE_COUNT - 1) {
    goToCarouselSlide(_carouselIndex + 1);
  } else {
    finishCarousel();
  }
});

document.getElementById("carousel-skip-btn").addEventListener("click", finishCarousel);
