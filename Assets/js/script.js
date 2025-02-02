/* jshint esversion: 6 */
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

// Sample Load More
const loadMoreBtn = document.getElementById("loadMoreBtn");

loadMoreBtn.addEventListener("click", function (event) {
  // Prevent default link behavior
  event.preventDefault();

  // Add the loading class to show the spinner and disable clicking
  this.closest(".arabica_featured-pager").classList.add("loading");

  // Simulate loading (for example, with a setTimeout)
  setTimeout(function () {
    // Remove the loading class after some time (simulating loading complete)
    loadMoreBtn.closest(".arabica_featured-pager").classList.remove("loading");
  }, 2000); // Adjust the timeout duration as needed (2 seconds here)
});

function applyLastRowBorders() {
  const posts = document.querySelectorAll(
    ".latest-posts .arabica_latest-article"
  );
  const container = document.querySelector(".latest-posts");

  if (!container || posts.length === 0) return; // Stop if no posts exist

  let columns = 1;
  let totalPosts = 0;

  // Determine the number of columns and total posts to display based on screen size
  if (window.innerWidth >= 992) {
    columns = 3; // Desktop: 3 columns
    totalPosts = 24; // Show 24 posts for desktop
  } else if (window.innerWidth >= 768) {
    columns = 2; // Tablet: 2 columns
    totalPosts = 16; // Show 16 posts for tablet
  } else {
    columns = 1; // Mobile: 1 column
    totalPosts = 8; // Show 8 posts for mobile
  }

  // Limit posts to the totalPosts value (8 for mobile, 16 for tablet, 24 for desktop)
  const postsToShow = Array.from(posts).slice(0, totalPosts);

  // Hide any extra posts beyond the totalPosts limit
  posts.forEach((post) => {
    post.style.display = "none"; // Hide all posts initially
  });

  postsToShow.forEach((post) => {
    post.style.display = "block"; // Show the posts to display
  });

  // Reset all borders first
  posts.forEach((post) => {
    post.style.borderBottom = "";
  });

  // Calculate the total number of rows
  let totalRows = Math.ceil(postsToShow.length / columns);

  // Get the index range of the last row
  let lastRowStart = (totalRows - 1) * columns;

  // Apply bottom border to every post in the last row
  for (let i = lastRowStart; i < postsToShow.length; i++) {
    postsToShow[i].style.borderBottom = "0px";
  }
}

// Run on page load & resize
window.addEventListener("load", applyLastRowBorders);
window.addEventListener("resize", applyLastRowBorders);
