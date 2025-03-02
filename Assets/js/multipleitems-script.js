/* jshint esversion: 6 */
      document.addEventListener("DOMContentLoaded", function () {
        var gridButton = document.querySelector(".arabica_grid");
        var listButton = document.querySelector(".arabica_list");
        var contentContainer = document.querySelector(
          ".arabica_featured-content"
        );

        // Load saved preference
        var savedLayout = localStorage.getItem("layoutPreference") || "list";

        // Apply the saved layout preference immediately
        if (savedLayout === "grid") {
          contentContainer.classList.add("grid-posts");
          gridButton.classList.add("active");
          listButton.classList.remove("active");
        } else {
          contentContainer.classList.remove("grid-posts");
          listButton.classList.add("active");
          gridButton.classList.remove("active");
        }

        // Function to switch layouts with animation
        function applyLayout(isGrid) {
          // Prevent switching if the current layout is already active
          if (
            (isGrid && contentContainer.classList.contains("grid-posts")) ||
            (!isGrid && !contentContainer.classList.contains("grid-posts"))
          ) {
            return;
          }

          // Add fade-out effect before switching
          contentContainer.classList.add("fade-out");

          setTimeout(function () {
            // Remove fade-out
            contentContainer.classList.remove("fade-out");

            if (isGrid) {
              contentContainer.classList.add("grid-posts");
              gridButton.classList.add("active");
              listButton.classList.remove("active");
              localStorage.setItem("layoutPreference", "grid");
            } else {
              contentContainer.classList.remove("grid-posts");
              listButton.classList.add("active");
              gridButton.classList.remove("active");
              localStorage.setItem("layoutPreference", "list");
            }

            // Force reflow to restart animation
            void contentContainer.offsetWidth;

            // Add fade-in effect
            contentContainer.classList.add("fade-in");

            // Remove fade-in after animation completes
            setTimeout(function () {
              contentContainer.classList.remove("fade-in");
            }, 0); // Matches CSS transition time
          }, 0); // Matches fade-out transition time
        }

        // Add event listeners for layout switching
        gridButton.addEventListener("click", function () {
          applyLayout(true);
        });
        listButton.addEventListener("click", function () {
          applyLayout(false);
        });
      });
	  
      function toggleDropdown(button) {
        const currentDropdown = button.parentElement;
        const dropdownWrapper = currentDropdown.querySelector(
          ".arabica_dropdown-content-wrapper"
        );
        const allDropdowns = document.querySelectorAll(".arabica_dropdown");

        allDropdowns.forEach((dropdown) => {
          if (dropdown !== currentDropdown) {
            dropdown.classList.remove("active");
            dropdown.querySelector(
              ".arabica_dropdown-content-wrapper"
            ).style.maxHeight = null;
          }
        });

        currentDropdown.classList.toggle("active");

        if (currentDropdown.classList.contains("active")) {
          dropdownWrapper.style.maxHeight = dropdownWrapper.scrollHeight + "px";
        } else {
          dropdownWrapper.style.maxHeight = null;
        }
      }

      // Function to handle "Select All" checkbox
      function toggleSelectAll(selectAllCheckbox) {
        const dropdownContent = selectAllCheckbox.closest(
          ".arabica_dropdown-content"
        );
        const checkboxes = dropdownContent.querySelectorAll(
          'input[type="checkbox"]:not(.select-all input)'
        );
        const selectAllLabel = selectAllCheckbox.closest("label");

        checkboxes.forEach((checkbox) => {
          checkbox.checked = selectAllCheckbox.checked;
          const label = checkbox.closest("label");
          if (selectAllCheckbox.checked) {
            label.classList.add("checked");
          } else {
            label.classList.remove("checked");
          }
        });

        // Ensure "Select All" label follows the checked state
        if (selectAllCheckbox.checked) {
          selectAllLabel.classList.add("checked");
        } else {
          selectAllLabel.classList.remove("checked");
        }
      }

      // Function to handle individual checkbox changes
      function handleCheckboxChange(event) {
        const dropdownContent = event.target.closest(
          ".arabica_dropdown-content"
        );
        const checkboxes = dropdownContent.querySelectorAll(
          'input[type="checkbox"]:not(.select-all input)'
        );
        const selectAllCheckbox =
          dropdownContent.querySelector(".select-all input");
        const selectAllLabel = selectAllCheckbox.closest("label");
        const checkbox = event.target;
        const label = checkbox.closest("label");

        // Toggle .checked class for individual checkboxes
        if (checkbox.checked) {
          label.classList.add("checked");
        } else {
          label.classList.remove("checked");
        }

        // Check if all individual checkboxes are selected
        const allChecked = Array.from(checkboxes).every((cb) => cb.checked);

        if (allChecked) {
          selectAllCheckbox.checked = true;
          selectAllLabel.classList.add("checked");
        } else {
          selectAllCheckbox.checked = false;
          selectAllLabel.classList.remove("checked");
        }
      }

      // Initialize event listeners
      document.addEventListener("DOMContentLoaded", function () {
        // Set all checkboxes to checked by default
        document
          .querySelectorAll(".arabica_dropdown-content")
          .forEach((dropdownContent) => {
            const selectAllCheckbox =
              dropdownContent.querySelector(".select-all input");
            selectAllCheckbox.checked = true;
            selectAllCheckbox.closest("label").classList.add("checked");

            const checkboxes = dropdownContent.querySelectorAll(
              'input[type="checkbox"]:not(.select-all input)'
            );
            checkboxes.forEach((checkbox) => {
              checkbox.checked = true;
              checkbox.closest("label").classList.add("checked");

              checkbox.addEventListener("change", handleCheckboxChange);
            });

            selectAllCheckbox.addEventListener("click", function () {
              toggleSelectAll(selectAllCheckbox);
            });
          });
      });

      // Close dropdown when clicking outside
      window.onclick = function (event) {
        if (
          !event.target.closest(".arabica_dropdown") &&
          !event.target.matches('input[type="checkbox"]')
        ) {
          document.querySelectorAll(".arabica_dropdown").forEach((dropdown) => {
            dropdown.classList.remove("active");
          });
        }
      };
    