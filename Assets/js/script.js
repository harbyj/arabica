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

// Function to trigger the native share dialog
function openShareDialog(event) {
  event.preventDefault(); // Prevent the default link behavior

  // Get the share data from the data attributes of the clicked link
  const shareData = {
    title: event.target.getAttribute("data-share-title"), // Get the title
    url: event.target.getAttribute("data-share-url"), // Get the URL
  };

  // Check if the Web Share API is supported by the browser
  if (navigator.share) {
    // Trigger the share dialog
    navigator
      .share(shareData)
      .then(() => console.log("Share was successful."))
      .catch((error) => console.log("Sharing failed", error));
  } else {
    // Fallback for browsers that do not support the Web Share API
    alert("Web Share API is not supported in your browser.");
  }
}

// Attach the function to all share links
document.querySelectorAll(".arabica_share-link").forEach((link) => {
  link.addEventListener("click", openShareDialog);
});

document.addEventListener("click", function (event) {
  // Check if the clicked element or its parent is an anchor with an href starting with "#"
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return; // Not a link, ignore

  const targetId = anchor.getAttribute("href").slice(1); // remove the '#'
  if (!targetId) return; // href is just '#' or empty

  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    event.preventDefault(); // Prevent the default jump

    // Optional: adjust the offset if you have fixed headers, etc.
    const offset = 20;
    const targetPosition =
      targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
});
(function () {
  // Define an array of selectors for allowed scrollable elements
  const allowedSelectors = [
    ".modal",
    ".arabica_mobile_nav",
    ".arabica_side-content",
    ".arabica_article_lightbox",
  ];

  // Helper function: returns true if the event target is within any allowed container.
  function isInsideAllowedContainer(e) {
    return allowedSelectors.some((selector) => e.target.closest(selector));
  }

  function preventOuterScroll(e) {
    // Only prevent scroll if the body has the no-scroll class
    // and the event target is NOT inside one of the allowed containers
    if (
      document.body.classList.contains("no-scroll") &&
      !isInsideAllowedContainer(e)
    ) {
      e.preventDefault();
    }
  }

  // Prevent scrolling from mouse wheel/trackpad actions on the outer body
  window.addEventListener("wheel", preventOuterScroll, { passive: false });

  // Prevent scrolling on touch devices outside of allowed containers
  window.addEventListener("touchmove", preventOuterScroll, { passive: false });

  // Prevent scrolling from key presses (e.g., arrow keys) when the body is set to no-scroll
  window.addEventListener(
    "keydown",
    function (e) {
      if (
        document.body.classList.contains("no-scroll") &&
        !isInsideAllowedContainer(e)
      ) {
        const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", " "];
        if (scrollKeys.includes(e.key)) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );
})();
