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
