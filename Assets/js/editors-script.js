/* jshint esversion: 6 */
        const modal = document.getElementById("editorModal");
        const closeModalBtn = document.querySelector(".modal-close");
        const editorElements = {
          editorName: document.getElementById("editorName"),
          editorRegion: document.getElementById("editorRegion"),
          editorTitle: document.getElementById("editorTitle"),
          editorField: document.getElementById("editorField"),
          editorBio: document.getElementById("editorBio"),
          editorImage: document.getElementById("editorImage"),
          editorEmail: document.getElementById("editorEmail"),
          separator: document.querySelector(".modal-separator"),
        };

        // Function to hide empty or missing elements
        const hideIfEmpty = (element, displayType) => {
          if (!element || element.textContent.trim() === "") {
            element.style.display = "none";
          } else {
            element.style.display = displayType;
          }
        };

        // Function to toggle the modal-separator visibility
        const updateSeparator = () => {
          const editorField = editorElements.editorField.textContent.trim();
          const editorTitle = editorElements.editorTitle.textContent.trim();

          if (editorField && editorTitle) {
            editorElements.separator.style.display = "inline";
          } else {
            editorElements.separator.style.display = "none";
          }
        };

        document.querySelectorAll(".arabica_editor-link").forEach((link) => {
          link.addEventListener("click", function (event) {
            event.preventDefault();
            const editorInfo = link.querySelector(".arabica_editor-info");

            // Function to update content and set display type
            const updateContent = (element, selector, displayType) => {
              const target = editorInfo.querySelector(selector);
              if (element && target && target.textContent.trim() !== "") {
                element.textContent = target.textContent;
                element.style.display = displayType;
              } else if (element) {
                element.textContent = "";
                element.style.display = "none";
              }
            };

            updateContent(
              editorElements.editorName,
              ".arabica_editor-name",
              "block"
            );
            updateContent(
              editorElements.editorRegion,
              ".arabica_editor-region",
              "inline-block"
            );
            updateContent(
              editorElements.editorTitle,
              ".arabica_editor-job",
              "inline-block"
            );
            updateContent(
              editorElements.editorField,
              ".arabica_editor-category",
              "inline-block"
            );

            // Handle Bio
            const bio = editorInfo.querySelector(".arabica_editor-bio");
            if (bio && bio.textContent.trim() !== "") {
              editorElements.editorBio.innerHTML = bio.innerHTML;
              editorElements.editorBio.style.display = "inline-block";
            } else {
              editorElements.editorBio.innerHTML = "";
              editorElements.editorBio.style.display = "none";
            }

            // Handle Image
            const image = link.querySelector(".arabica_editor-image");
            if (image) {
              editorElements.editorImage.src = ""; // Clear previous image
              setTimeout(() => {
                editorElements.editorImage.src = image.src;
                editorElements.editorImage.alt =
                  editorElements.editorName.textContent || image.alt;
                editorElements.editorImage.style.display = "inline-block";
              }, 0.1);
            } else {
              editorElements.editorImage.style.display = "none";
            }

            // Handle Email (set to inline-flex)
            const emailElement = editorInfo.querySelector(
              ".arabica_editor-email"
            );
            if (emailElement && emailElement.textContent.trim() !== "") {
              const email = emailElement.textContent;
              editorElements.editorEmail.href = `mailto:${email}`;
              editorElements.editorEmail.innerHTML = `${email} <i class="fa-solid fa-envelope"></i>`;
              editorElements.editorEmail.style.display = "inline-flex";
              editorElements.editorEmail.style.alignItems = "center";
              editorElements.editorEmail.style.gap = "10px";
            } else {
              editorElements.editorEmail.href = "#";
              editorElements.editorEmail.innerHTML = "";
              editorElements.editorEmail.style.display = "none";
            }

            // Hide empty elements
            Object.entries(editorElements).forEach(([key, element]) => {
              if (key !== "separator") {
                // Avoid hiding separator here
                const displayType =
                  key === "editorName" ? "block"
                    : key === "editorEmail" ? "inline-flex"
                    : "inline-block";
                hideIfEmpty(element, displayType);
              }
            });

            // Check separator visibility after updates
            updateSeparator();

            // Prevent body scrolling when modal is open

            document.body.classList.add("no-scroll");

            // Show modal with animation
            modal.classList.add("show");
          });
        });

        function closeModal() {
          modal.classList.remove("show");
          document.body.classList.remove("no-scroll"); // Enable interactions
        }

        // Close modal on button click, background click, or ESC key
        closeModalBtn.addEventListener("click", closeModal);
        window.addEventListener(
          "click",
          (event) => event.target === modal && closeModal()
        );
        window.addEventListener(
          "keydown",
          (event) =>
            event.key === "Escape" &&
            modal.classList.contains("show") &&
            closeModal()
        );

        document.addEventListener("DOMContentLoaded", function () {
          const pairs = document.querySelectorAll(".arabica_editor-category");

          pairs.forEach((field) => {
            const title = field.nextElementSibling;
            if (
              title &&
              title.classList.contains("arabica_editor-job") &&
              field.textContent.trim() &&
              title.textContent.trim()
            ) {
              const separator = document.createElement("span");
              separator.classList.add("editor-separator");
              separator.textContent = "|";

              field.insertAdjacentElement("afterend", separator);
            }
          });
        });
   