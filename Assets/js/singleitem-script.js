/* jshint esversion: 11 */

document
  .querySelectorAll(".arabica_article-gallery-container")
  .forEach((container) => {
    if (container.querySelector(".arabica_article-mobile-gallery")) {
      container.classList.add("has-mobile-gallery");
    }
  });

// Move paragraphs with footnotes (excluding those with "ref")
document.addEventListener("DOMContentLoaded", function () {
  const articleContent = document.querySelector(".arabica_article-content");
  const footnoteContainer = document.querySelector(".arabica_foot-reference");
  if (!articleContent || !footnoteContainer) return;

  let hasFootnotes = false;
  let node = articleContent.firstElementChild;

  while (node) {
    const ftnLink =
      node.tagName === "P" ? node.querySelector('a[name^="_ftn"]') : null;
    if (
      node.tagName === "P" &&
      ftnLink &&
      !ftnLink.getAttribute("name").includes("ref")
    ) {
      hasFootnotes = true;
      let currentNode = node;
      let next = node.nextElementSibling;

      footnoteContainer.appendChild(currentNode);

      while (next && ["P", "UL", "OL"].includes(next.tagName)) {
        if (next.tagName === "P") {
          const ednLink = next.querySelector('a[name^="_edn"]');
          if (ednLink) break;
        }
        let toMove = next;
        next = toMove.nextElementSibling;
        footnoteContainer.appendChild(toMove);
      }
      node = next;
    } else {
      node = node.nextElementSibling;
    }
  }

  if (!hasFootnotes) {
    footnoteContainer.remove();

    // Inject CSS rule only if there are no footnotes
    const style = document.createElement("style");
    style.textContent = `
      .arabica_article-sources {
        border-top: 0 !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(
      ".arabica_foot-reference p, .arabica_foot-source li, .arabica_foot-reference li, .arabica_foot-source p"
    )
    .forEach((el) => {
      // Regex checks for any Arabic characters in the range \u0600 to \u06FF
      if (!/[\u0600-\u06FF]/.test(el.textContent)) {
        el.setAttribute("dir", "ltr");
      }
    });
});

// Define reference title keywords.
const referenceTitles = [
  "Reference",
  "Sources",
  "Citations",
  "Bibliography",
  "المراجع",
  "المصادر",
  "الاستشهادات",
  "قائمةالمراجع",
  "المرجعية",
  "المصادر والمراجع",
];

// Find all h2 elements within the article content.
const headings = document.querySelectorAll("div.arabica_article-content h2");
let referenceFound = false;

headings.forEach((heading) => {
  const normalizedText = heading.textContent
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  if (
    referenceTitles.some((title) =>
      normalizedText.includes(title.toLowerCase().replace(/\s+/g, ""))
    )
  ) {
    referenceFound = true;

    const elementsToMove = [heading];
    let nextElem = heading.nextElementSibling;

    // Collect siblings until a <p><a name="...ftn or edn..."></a></p> is found
    while (nextElem) {
      const isStopParagraph =
        nextElem.tagName.toLowerCase() === "p" &&
        nextElem.querySelector('a[name*="ftn"], a[name*="edn"]');

      if (isStopParagraph) break;

      elementsToMove.push(nextElem);
      nextElem = nextElem.nextElementSibling;
    }

    const targetContainer = document.querySelector(".arabica_article-sources");
    if (targetContainer) {
      elementsToMove.forEach((el) => targetContainer.appendChild(el));
    }
  }
});

// If no reference header is found, remove the foot-source container.
if (!referenceFound) {
  const footSource = document.querySelector(".arabica_foot-source");
  if (footSource) {
    footSource.remove();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  function smoothScroll(el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  const contentContainer = document.querySelector(".arabica_article-content");
  const tocContainer     = document.querySelector(".arabica_article-table-content");
  const footContainer    = document.querySelector(".arabica_foot-container");

  if (contentContainer && tocContainer) {
    let tocHTML        = "";
    let currentSection = "";
    let index          = 0;

    // Function to process a container's headings (h2 & h3)
    const processHeadings = (container) => {
      const headings = container.querySelectorAll("h2, h3");
      headings.forEach((heading) => {
        // Ensure each heading has an ID
        if (!heading.id) {
          heading.id = "heading-" + index++;
        }

        if (heading.tagName === "H2") {
          // Close previous section if needed
          if (currentSection) {
            tocHTML += "</div>";
          }
          // Start a new section for H2
          currentSection = `<div class="arabica_toc-section">
                              <a href="#${heading.id}" class="arabica_toc-link">
                                ${heading.innerText}
                              </a>`;
          tocHTML += currentSection;
        } else if (heading.tagName === "H3") {
          // Append H3 as an indented link
          tocHTML += `<a href="#${heading.id}" class="arabica_toc-link arabica_toc-indent">
                        ${heading.innerText}
                      </a>`;
        }
      });
    };

    // Process article headings first
    processHeadings(contentContainer);
    // Close the last open section if any
    if (currentSection) {
      tocHTML += "</div>";
      currentSection = "";
    }

    // Process foot container headings after article headings
    if (footContainer) {
      processHeadings(footContainer);
      if (currentSection) {
        tocHTML += "</div>";
      }
    }

    tocContainer.innerHTML = tocHTML;

    // ========== Apply smooth scrolling to TOC links ==========
    const tocLinks = tocContainer.querySelectorAll(".arabica_toc-link");
    tocLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default jump
        const targetId      = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          smoothScroll(targetElement);
        }
      });
    });

    // ========== Active TOC Link on Scroll ==========
    const headings = document.querySelectorAll(
      ".arabica_article-content h2, .arabica_article-content h3, " +
      ".arabica_foot-container h2, .arabica_foot-container h3"
    );

    const updateActiveTOC = () => {
      let currentId = "";
      const threshold = 100;

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= threshold) {
          currentId = heading.id;
        }
      });

      tocLinks.forEach((link) => {
        const linkTarget = link.getAttribute("href").substring(1);
        link.classList.toggle("active", linkTarget === currentId);
      });
    };

    document.addEventListener("scroll", updateActiveTOC);
    // Initial activation
    updateActiveTOC();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Helper: escape special characters for attribute values.
  function escapeAttr(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const article = document.querySelector(".arabica_article-content");
  if (!article) return;

  // Helper: Clone a node, remove EDN numbering anchors, and set its direction.
  function getCleanHTML(el) {
    const temp = el.cloneNode(true);
    // Remove all anchors whose name starts with "_edn"
    temp.querySelectorAll('a[name^="_edn"]').forEach((a) => a.remove());

    // For any <li> elements inside, set the direction individually.
    temp.querySelectorAll("li").forEach((li) => {
      const liDir = /[\u0600-\u06FF]/.test(li.textContent) ? "rtl" : "ltr";
      li.setAttribute("dir", liDir);
    });

    // Set direction for the outer element based on its overall text.
    const dir = /[\u0600-\u06FF]/.test(temp.textContent) ? "rtl" : "ltr";
    temp.setAttribute("dir", dir);
    return temp.outerHTML;
  }

  // Step 1: Extract EDN reference texts from groups of nodes.
  // For each group, start with a <p> that contains an EDN anchor (but not one with _ednref),
  // then append following siblings if they are <p>, <ul>, or <ol> until you encounter a new EDN group.
  const ednRefs = {};
  let node = article.firstElementChild;
  while (node) {
    // Check if this node is a paragraph containing an EDN anchor (excluding _ednref)
    if (node.tagName === "P") {
      const ednAnchor = node.querySelector(
        'a[name^="_edn"]:not([name^="_ednref"])'
      );
      if (ednAnchor) {
        const nameAttr = ednAnchor.getAttribute("name");
        const key = nameAttr.replace("_edn", "");

        // Start building the reference content with the current node's cleaned HTML.
        let refTextHTML = getCleanHTML(node);

        // Look at subsequent siblings while they are allowed types.
        let next = node.nextElementSibling;
        while (next && ["P", "UL", "OL"].includes(next.tagName)) {
          // If the next element is a paragraph that itself starts a new EDN group, then break.
          if (
            next.tagName === "P" &&
            next.querySelector('a[name^="_edn"]:not([name^="_ednref"])')
          ) {
            break;
          }
          // Append this element's cleaned HTML.
          refTextHTML += getCleanHTML(next);
          // Remove the element from the DOM.
          let toRemove = next;
          next = next.nextElementSibling;
          toRemove.remove();
        }
        ednRefs[key] = refTextHTML.trim();
        // Remove the current group node and continue iteration from the next node.
        let current = node;
        node = next;
        current.remove();
        continue; // Skip normal iteration since we've updated node.
      }
    }
    node = node.nextElementSibling;
  }

  // Step 2: Replace EDN reference links with the clickable icon and hidden dropdown.
  const ednRefLinks = article.querySelectorAll('a[name^="_ednref"]');
  ednRefLinks.forEach((link) => {
    const nameAttr = link.getAttribute("name"); // e.g. "_ednref1"
    const key = nameAttr.replace("_ednref", "");
    const refText = ednRefs[key] || "";
    // Determine overall direction from the stored reference text.
    const direction = /[\u0600-\u06FF]/.test(refText) ? "rtl" : "ltr";
    const dropdownId =
      "arabica_ref-dropdown-" + Math.random().toString(36).substring(2, 9);
    const replacementHTML = `
<a class="arabica_ref-icon" data-ref-id="${dropdownId}" data-reference="${escapeAttr(
      refText
    )}">
  <i class="fa-light fa-circle-info arabica_ref-icon-light active"></i>
  <i class="fa-solid fa-circle-info arabica_ref-icon-solid inactive"></i>
</a>
<div id="${dropdownId}" class="arabica_ref-dropdown">
  <div class="arabica_ref-actions">
    <span class="arabica_ref-copy-icon" title="Copy">
      <i class="fa-regular fa-copy"></i>
    </span>
    <span class="arabica_ref-copied-text">✓ تم النسخ</span>
    <span class="arabica_ref-close-icon" title="Close">
      <i class="fa-regular fa-circle-xmark"></i>
    </span>
  </div>
  <div class="arabica_ref-text" dir="${direction}">
    <span dir="${direction}">${refText}</span>
  </div>
</div>
`;
    link.outerHTML = replacementHTML;
  });

  // Step 3: Attach event listeners for interactivity (toggle dropdown, copy, etc.)
  const refIcons = article.querySelectorAll(".arabica_ref-icon");
  refIcons.forEach((icon) => {
    const dropdownId = icon.getAttribute("data-ref-id");
    const dropdownEl = document.getElementById(dropdownId);

    dropdownEl.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      if (dropdownEl.classList.contains("open")) {
        dropdownEl.classList.remove("open");
        resetIconStyles(icon);
      } else {
        closeAllDropdowns();
        positionDropdown(icon, dropdownEl);
        dropdownEl.classList.add("open");
        icon
          .querySelector(".arabica_ref-icon-light")
          .classList.remove("active");
        icon.querySelector(".arabica_ref-icon-light").classList.add("inactive");
        icon
          .querySelector(".arabica_ref-icon-solid")
          .classList.remove("inactive");
        icon.querySelector(".arabica_ref-icon-solid").classList.add("active");
      }
    });

    icon.addEventListener("mouseenter", function () {
      if (!dropdownEl.classList.contains("open")) {
        icon
          .querySelector(".arabica_ref-icon-light")
          .classList.remove("active");
        icon.querySelector(".arabica_ref-icon-light").classList.add("inactive");
        icon
          .querySelector(".arabica_ref-icon-solid")
          .classList.remove("inactive");
        icon.querySelector(".arabica_ref-icon-solid").classList.add("active");
      }
    });
    icon.addEventListener("mouseleave", function () {
      if (!dropdownEl.classList.contains("open")) {
        resetIconStyles(icon);
      }
    });

    const closeIcon = dropdownEl.querySelector(".arabica_ref-close-icon");
    closeIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownEl.classList.remove("open");
      resetIconStyles(icon);
    });

    const copyIcon = dropdownEl.querySelector(".arabica_ref-copy-icon");
    const copiedText = dropdownEl.querySelector(".arabica_ref-copied-text");
    copyIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      const refTextEl = dropdownEl.querySelector(".arabica_ref-text");
      const htmlContent = refTextEl.innerHTML.trim();
      const plainContent = refTextEl.innerText.trim().replace(/\s+/g, " ");
      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([htmlContent], { type: "text/html" }),
        "text/plain": new Blob([plainContent], { type: "text/plain" }),
      });
      navigator.clipboard
        .write([clipboardItem])
        .then(() => {
          copyIcon.style.display = "none";
          copiedText.classList.add("show");
          setTimeout(() => {
            copyIcon.style.display = "inline-block";
            copiedText.classList.remove("show");
          }, 5000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    });
  });

  // Close dropdowns when clicking anywhere outside
  document.addEventListener("click", function () {
    closeAllDropdowns();
  });

  // Close dropdowns when pressing the Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllDropdowns();
    }
  });

  // Helper to reset icon styles.
  function resetIconStyles(icon) {
    icon.querySelector(".arabica_ref-icon-solid").classList.remove("active");
    icon.querySelector(".arabica_ref-icon-solid").classList.add("inactive");
    icon.querySelector(".arabica_ref-icon-light").classList.remove("inactive");
    icon.querySelector(".arabica_ref-icon-light").classList.add("active");
  }

  // Close all open dropdowns.
  function closeAllDropdowns() {
    const allDropdowns = document.querySelectorAll(
      ".arabica_ref-dropdown.open"
    );
    allDropdowns.forEach((d) => {
      d.classList.remove("open");
      const parentIcon = d.previousElementSibling;
      if (parentIcon && parentIcon.classList.contains("arabica_ref-icon")) {
        resetIconStyles(parentIcon);
      }
    });
  }

  // Position dropdown relative to its icon, switching above if needed.
  function positionDropdown(icon, dropdown) {
    const parent = icon.offsetParent;
    if (!parent) return;

    // Reset positioning and class.
    dropdown.style.top = "";
    dropdown.style.left = "";
    dropdown.classList.remove("arabica_ref-dropdown--above");

    const iconRect = icon.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const dropRect = dropdown.getBoundingClientRect();

    // Center dropdown horizontally over the icon.
    let left =
      iconRect.left - parentRect.left + iconRect.width / 2 - dropRect.width / 2;
    if (left < 0) {
      left = 0;
    } else if (left + dropRect.width > parentRect.width) {
      left = parentRect.width - dropRect.width;
    }
    dropdown.style.left = left + "px";

    // Determine available space above and below.
    const spaceBelow = window.innerHeight - iconRect.bottom;
    const spaceAbove = iconRect.top;
    let top;
    // If there isn't enough space below and there is enough above, position above.
    if (
      spaceBelow < dropRect.height + 10 &&
      spaceAbove >= dropRect.height + 10
    ) {
      top = iconRect.top - parentRect.top - dropRect.height - 10;
      dropdown.classList.add("arabica_ref-dropdown--above");
    } else {
      top = iconRect.bottom - parentRect.top + 10;
    }
    dropdown.style.top = top + "px";

    // Set the arrow offset so it points to the center of the icon.
    const arrowLeft =
      iconRect.left - parentRect.left + iconRect.width / 2 - left;
    dropdown.style.setProperty("--arrow-left", arrowLeft + "px");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  /* ========= Side Content Open/Close ========= */
  const toggleBtn = document.querySelector(".arabica_floating-btn");
  const sideContent = document.querySelector(".arabica_side-content");
  const closeBtn = document.querySelector(".arabica_close-button");
  const overlay = document.querySelector(".arabica_overlay");

  function openSideContent() {
    sideContent.classList.add("arabica_show-content");
    overlay.classList.add("arabica_show-overlay");
    // Prevent body scroll when side content is open
    document.body.classList.add("no-scroll");
  }

  function closeSideContent() {
    sideContent.classList.remove("arabica_show-content");
    overlay.classList.remove("arabica_show-overlay");
    // Restore body scroll when side content is closed
    document.body.classList.remove("no-scroll");
  }

  // Open/close when clicking toggle, close button, or overlay
  toggleBtn.addEventListener("click", openSideContent);
  closeBtn.addEventListener("click", closeSideContent);
  overlay.addEventListener("click", closeSideContent);

  // Close side content when pressing the Esc key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSideContent();
    }
  });

  // Close side content when any link (<a>) inside it is clicked
  sideContent.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      closeSideContent();
    }
  });

  /* ========= Toggle Button Hide/Show on Scroll ========= */
  // This element is the footer wrapper
  const footerWrapper = document.querySelector(".arabica_footer");

  function checkToggleBtnVisibility() {
    if (!footerWrapper) return;
    const footerRect = footerWrapper.getBoundingClientRect();
    // If the footer is visible in the viewport, hide the toggle button; otherwise, show it.
    if (footerRect.top < window.innerHeight) {
      toggleBtn.classList.add("hidden");
    } else {
      toggleBtn.classList.remove("hidden");
    }
  }

  // Check visibility on scroll and on resize, and run once on load
  window.addEventListener("scroll", checkToggleBtnVisibility);
  window.addEventListener("resize", checkToggleBtnVisibility);
  checkToggleBtnVisibility();
});

document
  .querySelectorAll('[class*="float-right-"], [class*="float-left-"]')
  .forEach((el) => {
    let match = el.className.match(/float-(right|left)-(\d+)/); // Extract float direction & number
    if (match) {
      let direction = match[1]; // "right" or "left"
      let width = match[2] + "%"; // Convert extracted number to percentage

      el.style.width = width;
      el.style.float = direction; // Apply float dynamically
      el.style.marginBottom = "0";
    }
  });
(function () {
  const sidebar = document.querySelector(".arabica_sticky-sidebar");
  const overlay = document.querySelector(".arabica_overlay");

  let lastScrollY = window.pageYOffset;
  let currentTranslation = 0;

  function updateSidebarPosition() {
    if (window.innerWidth <= 991) {
      // Reset styles if screen width is 991px or smaller
      sidebar.style.position = "static";
      overlay.style.transform = "none";
      return;
    }

    const scrollY = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const overlayHeight = overlay.offsetHeight;
    const maxTranslation = overlayHeight - viewportHeight;

    // If we're at the bottom of the page, force the translation to maxTranslation
    if (scrollY + viewportHeight >= document.documentElement.scrollHeight - 1) {
      currentTranslation = maxTranslation;
    } else {
      // Calculate how far we've scrolled since the last event.
      const delta = scrollY - lastScrollY;

      if (delta > 0) {
        // Scrolling down: increase translation up to the max.
        currentTranslation = Math.min(
          currentTranslation + delta,
          maxTranslation
        );
      } else if (delta < 0) {
        // Scrolling up: decrease translation but never below 0.
        currentTranslation = Math.max(currentTranslation + delta, 0);
      }
    }

    // Always keep the sidebar sticky at the top.
    sidebar.style.position = "sticky";
    sidebar.style.top = "0px";
    sidebar.style.height = "fit-content";
    overlay.style.transform = `translateY(-${currentTranslation}px)`;
    overlay.style.paddingBottom = `30px`;

    lastScrollY = scrollY;
  }

  function checkScreenSize() {
    updateSidebarPosition();
  }

  window.addEventListener("scroll", updateSidebarPosition);
  window.addEventListener("resize", checkScreenSize);
  checkScreenSize();
})();

