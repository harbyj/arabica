/* jshint esversion: 6 */
      // Slider images
      document.addEventListener("DOMContentLoaded", function () {
        const slides = document.querySelectorAll(".arabica_slide");
        const buttons = document.querySelectorAll(
          ".arabica_slider-buttons button"
        );
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

      // Get Load More
      const loadMoreBtn = document.getElementById("loadMoreBtn");
      const articles = document.querySelectorAll(".arabica_featured-article");
      const plusIcon = loadMoreBtn.querySelector(
        ".arabica_featured-pager .fa-plus"
      );
      const minusIcon = loadMoreBtn.querySelector(
        ".arabica_featured-pager .fa-minus"
      );
      const loadingIcon = loadMoreBtn.querySelector(
        ".arabica_featured-pager .arabica_loading-icon"
      );

      // Initial state: show only first 2 articles and set icons
      let expanded = false;
      for (let i = 2; i < articles.length; i++) {
        articles[i].classList.add("hidden");
      }
      plusIcon.style.display = "inline-block";
      minusIcon.style.display = "none";
      loadingIcon.style.display = "none";

      // Button click event with simulated loading and animation
      loadMoreBtn.addEventListener("click", function (event) {
        event.preventDefault();

        // Hide plus/minus icons and show loading icon
        plusIcon.style.display = "none";
        minusIcon.style.display = "none";
        loadingIcon.style.display = "inline-block";
        loadMoreBtn.style.pointerEvents = "none"; // Prevent multiple clicks

        // Simulate loading delay (2 seconds)
        setTimeout(() => {
          if (!expanded) {
            // Expand: remove the hidden class to animate showing the extra articles
            for (let i = 2; i < articles.length; i++) {
              articles[i].classList.remove("hidden");
            }
            minusIcon.style.display = "inline-block";
          } else {
            // Collapse: add the hidden class to animate hiding the extra articles
            for (let i = 2; i < articles.length; i++) {
              articles[i].classList.add("hidden");
            }
            plusIcon.style.display = "inline-block";
          }
          loadingIcon.style.display = "none";
          loadMoreBtn.style.pointerEvents = "auto";
          expanded = !expanded;
        }, 0);
      });

      // Get elements for the second load-more functionality
      const loadMoreBtn2 = document.getElementById("loadMoreBtn2");
      const shortArticles = document.querySelectorAll(".arabica_short-article");
      const plusIcon2 = loadMoreBtn2.querySelector(
        ".arabica_short-pager .fa-plus"
      );
      const minusIcon2 = loadMoreBtn2.querySelector(
        ".arabica_short-pager .fa-minus"
      );
      const loadingIcon2 = loadMoreBtn2.querySelector(
        ".arabica_short-pager .arabica_loading-icon"
      );

      // Initial state: show first 6 articles, hide the rest
      let expandedShort = false;
      shortArticles.forEach((article, index) => {
        if (index >= 6) {
          article.classList.add("hidden");
          article.style.display = "none"; // Completely remove from layout initially
        }
      });

      // Set initial icon states for the second container
      plusIcon2.style.display = "inline-block";
      minusIcon2.style.display = "none";
      loadingIcon2.style.display = "none";

      // Function to show an article with animation
      function showArticle(article) {
        article.style.display = "block"; // Restore to layout
        void article.offsetWidth; // Force reflow for transition
        article.classList.remove("hidden");
      }

      // Function to hide an article with animation and remove it from layout
      function hideArticle(article) {
        article.classList.add("hidden");
        article.addEventListener(
          "transitionend",
          () => {
            if (article.classList.contains("hidden")) {
              article.style.display = "none"; // Remove from layout after transition
            }
          },
          { once: true } // Ensures the event listener runs once per transition
        );
      }

      // Button click event with a simulated loading delay and animation
      loadMoreBtn2.addEventListener("click", function (event) {
        event.preventDefault();

        // Hide plus/minus icons and show loading icon
        plusIcon2.style.display = "none";
        minusIcon2.style.display = "none";
        loadingIcon2.style.display = "inline-block";
        loadMoreBtn2.style.pointerEvents = "none"; // Prevent multiple clicks

        // Simulate a loading delay (0ms for instant effect)
        setTimeout(() => {
          if (!expandedShort) {
            // Expand: show extra articles with animation
            for (let i = 6; i < shortArticles.length; i++) {
              showArticle(shortArticles[i]);
            }
            minusIcon2.style.display = "inline-block";
          } else {
            // Collapse: hide extra articles with animation
            for (let i = 6; i < shortArticles.length; i++) {
              hideArticle(shortArticles[i]);
            }
            plusIcon2.style.display = "inline-block";
          }

          // Hide loading icon and re-enable the button
          loadingIcon2.style.display = "none";
          loadMoreBtn2.style.pointerEvents = "auto";

          // Toggle the state for next click
          expandedShort = !expandedShort;
        }, 0);
      });
   