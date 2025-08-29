// HERO SLIDER
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
const dotsContainer = document.querySelector(".dots");

if (slides.length > 0) {
  // Add background images
  slides.forEach(slide => {
    const bg = slide.getAttribute("data-bg");
    if (bg) slide.style.backgroundImage = `url(${bg})`;
  });

  // Create dots dynamically
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      currentSlide = i;
      showSlide(currentSlide);
    });
    if (dotsContainer) dotsContainer.appendChild(dot);
  });
  const dots = document.querySelectorAll(".dot");

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      if (dots[i]) dots[i].classList.remove("active");
      if (i === index) {
        slide.classList.add("active");
        if (dots[i]) dots[i].classList.add("active");
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  // Event listeners for arrows
  if (next) next.addEventListener("click", nextSlide);
  if (prev) prev.addEventListener("click", prevSlide);

  // Auto-play
  setInterval(nextSlide, 5000);
}


// NAVBAR MOBILE TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".navbar ul");
  const navLinks = document.querySelectorAll(".navbar ul li a");

  // Only run if hamburger exists
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show");
      });
    });
  }
});


