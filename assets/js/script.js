// THEME TOGGLE
(function() {
  const storageKey = "wlwTheme";
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function getSavedTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function setSavedTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Theme still works for the current page if storage is unavailable.
    }
  }

  function getInitialTheme() {
    const savedTheme = getSavedTheme();
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    return systemPrefersDark.matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      const isDark = theme === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      button.textContent = isDark ? "Light" : "Dark";
    });
  }

  applyTheme(getInitialTheme());

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".navbar").forEach((navbar) => {
      if (navbar.querySelector(".theme-toggle")) return;

      const button = document.createElement("button");
      button.className = "theme-toggle";
      button.type = "button";
      button.addEventListener("click", () => {
        const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        setSavedTheme(nextTheme);
        applyTheme(nextTheme);
      });

      const hamburger = navbar.querySelector(".hamburger");
      navbar.insertBefore(button, hamburger || null);
    });

    applyTheme(root.getAttribute("data-theme") || getInitialTheme());
  });

  systemPrefersDark.addEventListener("change", (event) => {
    if (getSavedTheme()) return;
    applyTheme(event.matches ? "dark" : "light");
  });
})();

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
    const dot = document.createElement("button");
    dot.classList.add("dot");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
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
    hamburger.setAttribute("role", "button");
    hamburger.setAttribute("tabindex", "0");
    hamburger.setAttribute("aria-label", "Toggle navigation menu");
    hamburger.setAttribute("aria-expanded", "false");

    function setNavOpen(isOpen) {
      navMenu.classList.toggle("show", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    }

    // Toggle menu when hamburger is clicked
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent click bubbling
      setNavOpen(!navMenu.classList.contains("show"));
    });

    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setNavOpen(!navMenu.classList.contains("show"));
      }
    });

    // Close nav when clicking a link
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        setNavOpen(false);
      });
    });

    // Close nav on any scroll (after ~3px)
    let lastScrollY = 0;
    window.addEventListener("scroll", () => {
      if (navMenu.classList.contains("show")) {
        if (Math.abs(window.scrollY - lastScrollY) > 3) {
          setNavOpen(false);
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
        setNavOpen(false);
      }
    });
  }
});

// === COMMUNITY POPUP HANDLER ===
document.addEventListener("DOMContentLoaded", function() {
  const popup = document.getElementById("community-popup");
  const closeBtn = document.querySelector(".close-btn");
  const form = document.getElementById("community-form");
  const openPopupBtn = document.getElementById("open-popup");
  let lastFocusedElement = null;

  if (!popup) return;

  function openPopup() {
    lastFocusedElement = document.activeElement;
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
    const firstFocusable = popup.querySelector("button, input, textarea, select, a[href]");
    if (firstFocusable) firstFocusable.focus();
  }

  function closePopup(markClosed = true) {
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    if (markClosed) localStorage.setItem("communityPopupDismissed", "true");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  popup.setAttribute("aria-hidden", "true");

  // Automatically show popup after 3 seconds for first-time visitors
  if (!localStorage.getItem("communityJoined") && !localStorage.getItem("communityPopupDismissed")) {
    setTimeout(() => {
      openPopup();
    }, 3000);
  }

  // Show popup when "Join Us" button is clicked
  if (openPopupBtn) {
    openPopupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openPopup();
    });
  }

  // Close popup when clicking "×" button
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closePopup();
    });
  }

  // Close popup when clicking outside the popup box
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("show")) closePopup();
  });

  if (!form) return;

  // Handle email submission
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

      if (res.ok) {
        alert(data.message || "🎉 Thanks for joining the What Lagos Wore community!");
        localStorage.setItem("communityJoined", "true");
        closePopup(false);
        form.reset();
      } else {
        alert(data.message || "❌ Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Something went wrong. Please try again later.");
    }
  });
});

// SIMPLE CLICK-ONLY DROPDOWN (DESKTOP + MOBILE)
document.addEventListener("DOMContentLoaded", () => {

  const dropdown = document.querySelector(".dropdown");
  const toggle = document.querySelector(".dropdown-toggle");
  const menu = document.querySelector(".dropdown-menu");

  if (!dropdown || !toggle || !menu) return;
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(dropdown.classList.contains("open")));
  });

  // Close when clicking outside
  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });

  // Don’t close when clicking inside menu
  menu.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});
