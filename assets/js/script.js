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

  if (hamburger && navMenu) {
    // Toggle menu when hamburger is clicked
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent click bubbling
      navMenu.classList.toggle("show");
    });

    // Close nav when clicking a link
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show");
      });
    });

    // Close nav on any scroll (after ~3px)
    let lastScrollY = 0;
    window.addEventListener("scroll", () => {
      if (navMenu.classList.contains("show")) {
        if (Math.abs(window.scrollY - lastScrollY) > 3) {
          navMenu.classList.remove("show");
        }
      }
      lastScrollY = window.scrollY;
    });

    // Close nav when clicking anywhere outside nav/hamburger
    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("show") &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        navMenu.classList.remove("show");
      }
    });
  }
});

// For the Popup 
// For the Popup 
document.addEventListener("DOMContentLoaded", function() {
  const popup = document.getElementById("community-popup");
  const closeBtn = document.querySelector(".close-btn");
  const form = document.getElementById("community-form");

  // Only show once per user
  if (!localStorage.getItem("communityJoined")) {
    setTimeout(() => {
      popup.classList.add("show");
    }, 3000); // Show after 3 seconds
  }

  // Close button
  closeBtn.addEventListener("click", () => {
    popup.classList.remove("show");
    localStorage.setItem("communityJoined", "closed");
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();

    if (!email) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message || "Thank you for joining!");
      localStorage.setItem("communityJoined", "true");
      popup.classList.remove("show");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit. Please try again.");
    }
  });
});


