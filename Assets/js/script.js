document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const mobileNav = document.getElementById("mobileNav");
  const body = document.body;

  // Show the mobile nav when the toggle button is clicked
  menuToggle.addEventListener("click", () => {
    mobileNav.classList.add("visible");
    mobileNav.classList.remove("hidden");
    body.classList.add("no-scroll");
  });

  // Hide the mobile nav when the close button is clicked
  menuClose.addEventListener("click", () => {
    mobileNav.classList.remove("visible");
    mobileNav.classList.add("hidden");
    body.classList.remove("no-scroll");
  });
});

// Select the existing navigation menu and the mobile navigation container
const navMenu = document.querySelector("#navMenu ul");
const mobileNavList = document.querySelector(".arabica_mobile_nav_list");

// Clone the entire <ul> and append it to the mobile navigation container
if (navMenu && mobileNavList) {
  mobileNavList.appendChild(navMenu.cloneNode(true));
}

// Slider images
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".arabica_slide");
  const buttons = document.querySelectorAll(".arabica_slider-buttons button");
  let currentSlide = 0;
  let autoSlideInterval;
  let isPageVisible = true;

  // Function to show a specific slide
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });

    buttons.forEach((button, i) => {
      button.classList.toggle("active", i === index);
    });
  }

  // Function to move to the next slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Function to start the auto-slide interval
  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 10000); // Change slide every 10 seconds
  }

  // Function to stop the auto-slide interval
  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  // Function to reset the timer when manually navigating
  function resetTimer() {
    stopAutoSlide();
    startAutoSlide();
  }

  // Handle manual navigation via buttons
  buttons.forEach((button, i) => {
    button.addEventListener("click", () => {
      currentSlide = i;
      showSlide(currentSlide);
      resetTimer(); // Reset the timer on manual navigation
    });
  });

  // Handle touch swipe events
  let touchStartX = 0;
  let touchEndX = 0;

  const slider = document.querySelector(".arabica_slider");

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50; // Minimum swipe distance to trigger a slide change
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > swipeThreshold) {
      // Swipe right (previous slide)
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    } else if (swipeDistance < -swipeThreshold) {
      // Swipe left (next slide)
      currentSlide = (currentSlide + 1) % slides.length;
    }

    showSlide(currentSlide);
    resetTimer(); // Reset the timer on swipe
  }

  // Pause auto-slide when the page is not visible
  document.addEventListener("visibilitychange", () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      startAutoSlide(); // Resume auto-slide when the page is visible
    } else {
      stopAutoSlide(); // Pause auto-slide when the page is hidden
    }
  });

  // Start the auto-slide initially
  startAutoSlide();
  showSlide(currentSlide); // Show the first slide
});
document.addEventListener("DOMContentLoaded", function () {
  // Check if the browser supports IntersectionObserver
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll("img.lazyload");

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        // If the image is in view (intersection ratio > 0)
        if (entry.isIntersecting) {
          const image = entry.target;
          const src = image.getAttribute("data-src");

          // Replace the src with the data-src (actual image URL)
          image.src = src;

          // Optionally, remove the observer after loading the image
          image.classList.remove("lazyload");
          observer.unobserve(image);
        }
      });
    });

    // Start observing each lazy-loaded image
    lazyImages.forEach((image) => {
      imageObserver.observe(image);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    // You can use a basic scroll event or a lazy loading library like lazysizes
    const lazyImages = document.querySelectorAll("img.lazyload");
    lazyImages.forEach((image) => {
      image.src = image.getAttribute("data-src");
    });
  }
});
