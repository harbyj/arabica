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
  // **Video Section**
  // Select all video elements on the page
  const videos = document.querySelectorAll("video");

  // Global event listener: Pause all other videos when one starts playing
  document.addEventListener(
    "play",
    function (e) {
      videos.forEach((video) => {
        if (video !== e.target) {
          video.pause();
        }
      });
    },
    true
  );

  videos.forEach((video, index) => {
    // Disable default browser controls
    video.controls = false;
    video.removeAttribute("controls");

    // Wrap the video in a container if not already wrapped
    let container = video.parentElement;
    if (!container.classList.contains("arabica_video-container")) {
      container = document.createElement("div");
      container.classList.add("arabica_video-container");
      video.parentElement.insertBefore(container, video);
      container.appendChild(video);
    }

    // Inject custom controls into this container
    injectControls(container, video, index);

    // Setup event listeners for video and its controls
    setupVideoEvents(video, container, index);
  });

  // **Function to Inject Video Controls**
  function injectControls(container, video, index) {
    // Rewind indicator
    const rewindIndicator = document.createElement("div");
    rewindIndicator.className = "skip-indicator left-indicator";
    rewindIndicator.id = "rewind-" + index;
    rewindIndicator.innerHTML = `<span>10s</span>
      <svg class="arabica_video-icon" fill="none" height="24" viewBox="0 0 24 24" width="24"
        xmlns="http://www.w3.org/2000/svg">
        <path d="m6.46967 10.4697c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0zm1.78033 5.5303c0 .4142.33579.75.75.75s.75-.3358.75-.75zm-5.5-4c0-.4142-.33579-.75-.75-.75s-.75.3358-.75.75zm3.24903-8 .4505.59962zm-1.99903 1.99903.54801.51204.02745-.02939.02416-.03215zm.01269-4.99568c.00185-.414213-.33244-.751495-.74665-.753343s-.75149.332437-.75334.746647zm-.75885 1.98236-.75-.00334zm3.68 3.68.00334.75zm1.98906.74114c.41421-.00185.74849-.33913.74664-.75334s-.33913-.7485-.75334-.74665zm-5.26052-1.50418-.59312.45902zm.3545.3545-.45902.59312zm12.23312 5.74283v2h1.5v-2zm-2.5 2v-2h-1.5v2zm1.25 1.25c-.6904 0-1.25-.5596-1.25-1.25h-1.5c0 1.5188 1.2312 2.75 2.75 2.75zm1.25-1.25c0 .6904-.5596 1.25-1.25 1.25v1.5c1.5188 0 2.75-1.2312 2.75-2.75zm-1.25-3.25c.6904 0 1.25.5596 1.25 1.25h1.5c0-1.5188-1.2312-2.75-2.75-2.75zm0-1.5c-1.5188 0-2.75 1.2312-2.75 2.75h1.5c0-.6904.5596-1.25 1.25-1.25zm-13.75 2.75c0 5.9371 4.81294 10.75 10.75 10.75v-1.5c-5.10863 0-9.25-4.1414-9.25-9.25zm10.75 10.75c5.9371 0 10.75-4.8129 10.75-10.75h-1.5c0 5.1086-4.1414 9.25-9.25 9.25zm10.75-10.75c0-5.93706-4.8129-10.75-10.75-10.75v1.5c5.1086 0 9.25 4.14137 9.25 9.25zm-10.75-10.75c-2.41966 0-4.65456.80032-6.45148 2.15038l.90101 1.19924c1.54606-1.16158 3.46683-1.84962 5.55047-1.84962zm-6.45148 2.15038c-.81333.61107-1.53707 1.33481-2.14814 2.14814l1.19924.90101c.5262-.70037 1.14954-1.32371 1.84991-1.84991zm-3.03582-2.403726-.00886 1.985716 1.49999.00669.00886-1.98571zm4.42448 6.419056 1.98572-.00886-.0067-1.49999-1.98571.00886zm-4.43334-4.43334c-.00345.77414-.00746 1.41813.04887 1.93398.05798.53093.18758 1.02026.51655 1.44534l1.18625-.91804c-.09017-.11652-.16839-.29389-.21166-.69014-.04492-.41134-.04363-.95503-.04002-1.76445zm4.42665 2.93335c-.80942.00361-1.3531.0049-1.76445-.04002-.39625-.04327-.57362-.12149-.69014-.21166l-.91804 1.18625c.42508.32897.91441.45857 1.44534.51655.51585.05633 1.15984.05232 1.93398.04887zm.53918 3.55395-1 1.00003 1.06066 1.0606 1-1zm.78033 2.53033v4h1.5v-4zm0-1.5858v.0858h1.5v-.0858zm0 .0858v1.5h1.5v-1.5zm-5.18074-4.13831c.08838.1142.18558.2211.29066.31976l1.02669-1.09358c-.04739-.04449-.09123-.0927-.1311-.14422zm.29066.31976c.0632.05933.12925.11569.19794.16884l.91804-1.18625c-.03099-.02399-.06078-.0494-.08929-.07616zm.09207-1.19447-.12673.13563 1.09601 1.0241.12674-.13564zm5.07834 5.04332c-.0184.0184-.0508.0375-.09038.0443-.03548.0062-.06566.0008-.08858-.0087s-.04806-.027-.0688-.0564c-.02313-.0329-.03257-.0693-.03257-.0953h1.5c0-1.19004-1.43883-1.78603-2.28033-.94453z" fill="#ffffff"/>
      </svg>`;
    container.appendChild(rewindIndicator);

    // Forward indicator
    const forwardIndicator = document.createElement("div");
    forwardIndicator.className = "skip-indicator right-indicator";
    forwardIndicator.id = "forward-" + index;
    forwardIndicator.innerHTML = `<svg class="arabica_video-icon" fill="none" height="24" viewBox="0 0 24 24" width="24"
        xmlns="http://www.w3.org/2000/svg">
        <g fill="#ffffff">
          <path d="m21.4873.996654c-.0019-.414209-.3391-.748494-.7533-.746646-.4143.001848-.7485.339129-.7467.753342l.0089 1.98571c.0036.80942.0049 1.35311-.04 1.76445l-.0017.01526c-.4565-.50181-.9598-.96023-1.503-1.36839-1.7969-1.35006-4.0318-2.15038-6.4515-2.15038-5.93706 0-10.75 4.81294-10.75 10.75 0 5.9371 4.81294 10.75 10.75 10.75 5.9371 0 10.75-4.8129 10.75-10.75 0-.4142-.3358-.75-.75-.75s-.75.3358-.75.75c0 5.1086-4.1414 9.25-9.25 9.25-5.10863 0-9.25-4.1414-9.25-9.25 0-5.10863 4.14137-9.25 9.25-9.25 2.0836 0 4.0044.68804 5.5505 1.84962.4989.37489.9588.79909 1.3723 1.26532-.0283.00379-.0579.00738-.0888.01076-.4114.04492-.9551.04363-1.7645.04002l-1.9857-.00886c-.4142-.00185-.7515.33244-.7533.74665-.0019.41421.3324.75149.7466.75334l2.029.00905c.7549.00339 1.3845.00621 1.8907-.04906.5309-.05798 1.0203-.18758 1.4453-.51655.0678-.05245.133-.10802.1955-.1665.106-.0993.2041-.20699.2931-.3221.329-.42508.4586-.91441.5166-1.44534.0553-.50618.0524-1.13575.0491-1.89062z"/>
          <path d="m9.75 10.4142c0-1.19004-1.43883-1.78603-2.28033-.94453l-1 1.00003c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0l.71967-.7196v5.1893c0 .4142.33579.75.75.75s.75-.3358.75-.75z"/>
          <path clip-rule="evenodd" d="m15 9.25c-1.5188 0-2.75 1.2312-2.75 2.75v2c0 1.5188 1.2312 2.75 2.75 2.75s2.75-1.2312 2.75-2.75v-2c0-1.5188-1.2312-2.75-2.75-2.75zm-1.25 2.75c0-.6904.5596-1.25 1.25-1.25s1.25.5596 1.25 1.25v2c0 .6904-.5596 1.25-1.25 1.25s-1.25-.5596-1.25-1.25z" fill-rule="evenodd"/>
        </g>
      </svg>
        <span>10s</span>`;
    container.appendChild(forwardIndicator);

    // Large overlay indicator (for transient play/pause feedback)
    const playPauseIndicator = document.createElement("div");
    playPauseIndicator.className = "play-pause-indicator";
    playPauseIndicator.id = "playPauseIndicator-" + index;
    playPauseIndicator.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    container.appendChild(playPauseIndicator);

    // Controls container
    const controls = document.createElement("div");
    controls.className = "arabica_video-controls";

    // Play/Pause button
    const playPauseBtn = document.createElement("button");
    playPauseBtn.className = "play-btn";
    playPauseBtn.id = "playPause-" + index;
    playPauseBtn.innerHTML = `
      <svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    controls.appendChild(playPauseBtn);

    // Restart button
    const restartBtn = document.createElement("button");
    restartBtn.className = "restart-btn";
    restartBtn.id = "restart-" + index;
    restartBtn.innerHTML = `
      <svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>
    `;
    controls.appendChild(restartBtn);

    // Current time display
    const currentTime = document.createElement("span");
    currentTime.className = "arabica_video-time";
    currentTime.innerHTML = `<span id="currentTime-${index}">0:00</span>`;
    controls.appendChild(currentTime);

    // Progress bar container
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.id = "progressContainer-" + index;
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.id = "progressBar-" + index;
    progressContainer.appendChild(progressBar);
    // Add progress thumb
    const progressThumb = document.createElement("div");
    progressThumb.className = "progress-thumb";
    progressContainer.appendChild(progressThumb);
    controls.appendChild(progressContainer);

    // Duration display
    const duration = document.createElement("span");
    duration.className = "arabica_video-time";
    duration.innerHTML = `<span id="duration-${index}">0:00</span>`;
    controls.appendChild(duration);

    // Volume button
    const volumeBtn = document.createElement("button");
    volumeBtn.className = "volume-btn";
    volumeBtn.id = "volume-" + index;
    volumeBtn.innerHTML = `
      <svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        <line class="slash" x1="22" y1="2" x2="2" y2="22" />
      </svg>
    `;
    controls.appendChild(volumeBtn);

    // Fullscreen button
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.className = "fullscreen-btn";
    fullscreenBtn.id = "fullscreen-" + index;
    fullscreenBtn.innerHTML = `
      <svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    `;
    controls.appendChild(fullscreenBtn);

    container.appendChild(controls);
  }

  // **Function to Setup Video Events**
  function setupVideoEvents(video, container, index) {
    const playPauseBtn = container.querySelector("#playPause-" + index);
    const restartBtn = container.querySelector("#restart-" + index);
    const fullscreenBtn = container.querySelector("#fullscreen-" + index);
    const progressContainer = container.querySelector(
      "#progressContainer-" + index
    );
    const progressBar = container.querySelector("#progressBar-" + index);
    const progressThumb = progressContainer.querySelector(".progress-thumb");
    const currentTimeEl = container.querySelector("#currentTime-" + index);
    const durationEl = container.querySelector("#duration-" + index);
    const rewindIndicator = container.querySelector("#rewind-" + index);
    const forwardIndicator = container.querySelector("#forward-" + index);
    const playPauseIndicator = container.querySelector(
      "#playPauseIndicator-" + index
    );
    const volumeBtn = container.querySelector("#volume-" + index);
    const playBtnIcon = playPauseBtn.querySelector("path");

    // SVG paths for play and pause icons
    const playIconPath = "M8 5v14l11-7z";
    const pauseIconPath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

    // Show overlay indicator with animation
    function showOverlay(iconPath) {
      playPauseIndicator.style.display = "block";
      playPauseIndicator.style.opacity = "1";
      playPauseIndicator.querySelector("path").setAttribute("d", iconPath);
      setTimeout(() => {
        playPauseIndicator.style.transition = "opacity 0.5s ease-out";
        playPauseIndicator.style.opacity = "0";
        setTimeout(() => {
          playPauseIndicator.style.display = "none";
          playPauseIndicator.style.transition = "";
        }, 500);
      }, 1000);
    }

    // On page load, if the video is paused, show the play icon overlay
    if (video.paused) {
      playPauseIndicator.style.display = "block";
      playPauseIndicator.style.opacity = "1";
      playPauseIndicator.querySelector("path").setAttribute("d", playIconPath);
    }

    // Toggle play/pause with overlay feedback
    function togglePlay() {
      if (video.paused) {
        showOverlay(playIconPath);
        video.play();
        playBtnIcon.setAttribute("d", pauseIconPath);
      } else {
        showOverlay(pauseIconPath);
        video.pause();
        playBtnIcon.setAttribute("d", playIconPath);
      }
    }

    playPauseBtn.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay);
    playPauseIndicator.addEventListener("click", togglePlay);

    volumeBtn.addEventListener("click", toggleMute);
    function toggleMute() {
      video.muted = !video.muted;
      updateVolumeButton();
    }
    function updateVolumeButton() {
      volumeBtn.classList.toggle("muted", video.muted);
    }

    restartBtn.addEventListener("click", () => {
      video.currentTime = 0;
      video.play();
      playBtnIcon.setAttribute("d", pauseIconPath);
      showOverlay(playIconPath);
    });

    fullscreenBtn.addEventListener("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    });

    video.addEventListener("timeupdate", () => {
      if (video.duration) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressThumb.style.left = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(video.currentTime);
      }
    });

    // Update progress by clicking on the progress container
    progressContainer.addEventListener("click", (e) => {
      video.currentTime =
        (e.offsetX / progressContainer.offsetWidth) * video.duration;
    });

    // Dragging logic for progress thumb with fix to prevent text selection
    let isDragging = false;

    function startDragging(e) {
      if (!isFinite(video.duration)) return;
      e.preventDefault(); // Prevent default mousedown behavior (e.g., text selection)
      isDragging = true;
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", stopDragging);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault(); // Prevent default mousemove behavior (e.g., text selection)
      const rect = progressContainer.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newPercent = Math.max(
        0,
        Math.min(100, (offsetX / rect.width) * 100)
      );
      const newTime = (newPercent / 100) * video.duration;
      video.currentTime = newTime;
      progressBar.style.width = `${newPercent}%`;
      progressThumb.style.left = `${newPercent}%`;
    }

    function stopDragging() {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDragging);
    }

    progressThumb.addEventListener("mousedown", startDragging);

    // Touch events for dragging
    function startDraggingTouch(e) {
      if (!isFinite(video.duration)) return;
      e.preventDefault();
      if (e.touches.length > 0) {
        isDragging = true;
        document.addEventListener("touchmove", dragTouch, { passive: false });
        document.addEventListener("touchend", stopDraggingTouch);
      }
    }

    function dragTouch(e) {
      if (!isDragging || e.touches.length === 0) return;
      e.preventDefault();
      const rect = progressContainer.getBoundingClientRect();
      const offsetX = e.touches[0].clientX - rect.left;
      const newPercent = Math.max(
        0,
        Math.min(100, (offsetX / rect.width) * 100)
      );
      const newTime = (newPercent / 100) * video.duration;
      video.currentTime = newTime;
      progressBar.style.width = `${newPercent}%`;
      progressThumb.style.left = `${newPercent}%`;
    }

    function stopDraggingTouch() {
      isDragging = false;
      document.removeEventListener("touchmove", dragTouch);
      document.removeEventListener("touchend", stopDraggingTouch);
    }

    progressThumb.addEventListener("touchstart", startDraggingTouch);

    // Allow updating progress with mouse wheel scroll
    progressContainer.addEventListener("wheel", (e) => {
      e.preventDefault(); // Prevent page scroll
      const step = 5; // seconds to adjust per wheel tick
      if (e.deltaY < 0) {
        video.currentTime = Math.min(video.duration, video.currentTime + step);
      } else {
        video.currentTime = Math.max(0, video.currentTime - step);
      }
    });

    // Allow updating progress with touch drag
    progressContainer.addEventListener("touchstart", function (e) {
      const updateTime = (clientX) => {
        const rect = progressContainer.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        video.currentTime = (offsetX / rect.width) * video.duration;
      };
      updateTime(e.touches[0].clientX);
      const onTouchMove = (moveEvent) => {
        updateTime(moveEvent.touches[0].clientX);
      };
      progressContainer.addEventListener("touchmove", onTouchMove);
      progressContainer.addEventListener(
        "touchend",
        function touchEndHandler() {
          progressContainer.removeEventListener("touchmove", onTouchMove);
          progressContainer.removeEventListener("touchend", touchEndHandler);
        }
      );
    });

    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
      return `${minutes}:${seconds}`;
    }

    video.addEventListener("ended", () => {
      playBtnIcon.setAttribute("d", playIconPath);
    });

    video.addEventListener("dblclick", (e) => {
      const rect = video.getBoundingClientRect();
      if (e.clientX < rect.width / 2) {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showIndicator(rewindIndicator);
      } else {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        showIndicator(forwardIndicator);
      }
    });

    function showIndicator(indicator) {
      indicator.style.display = "flex";
      setTimeout(() => {
        indicator.style.display = "none";
      }, 800);
    }

    video.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(video.duration);
    });

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        updateVolumeButton();
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // **Audio Section**
  // Select all audio elements on the page
  const audios = document.querySelectorAll("audio");

  // Global listener: Pause all other audios when one starts playing
  document.addEventListener(
    "play",
    function (e) {
      audios.forEach((audio) => {
        if (audio !== e.target) {
          audio.pause();
        }
      });
    },
    true
  );

  audios.forEach((audio, index) => {
    // Disable default browser controls
    audio.controls = false;
    audio.removeAttribute("controls");

    // Wrap the audio element in a container if not already wrapped
    let container = audio.parentElement;
    if (!container.classList.contains("arabica_audio-container")) {
      container = document.createElement("div");
      container.classList.add("arabica_audio-container");
      audio.parentElement.insertBefore(container, audio);
      container.appendChild(audio);
    }

    // Inject custom controls
    injectAudioControls(container, audio, index);

    // Setup event listeners for this audio and its controls
    setupAudioEvents(audio, container, index);
  });

  // **Function to Inject Audio Controls**
  function injectAudioControls(container, audio, index) {
    const controls = document.createElement("div");
    controls.className = "arabica_video-controls";

    // Play/Pause button
    const playPauseBtn = document.createElement("button");
    playPauseBtn.className = "play-btn";
    playPauseBtn.id = "playPause-" + index;
    playPauseBtn.innerHTML = `
      <svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"></path>
      </svg>
    `;
    controls.appendChild(playPauseBtn);

    // Restart button
    const restartBtn = document.createElement("button");
    restartBtn.className = "restart-btn";
    restartBtn.id = "restart-" + index;
    restartBtn.innerHTML = `
      <svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
      </svg>
    `;
    controls.appendChild(restartBtn);

    // Current time display
    const currentTimeSpan = document.createElement("span");
    currentTimeSpan.className = "arabica_video-time";
    currentTimeSpan.innerHTML = `<span id="currentTime-${index}">0:00</span>`;
    controls.appendChild(currentTimeSpan);

    // Progress bar container
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.id = "progressContainer-" + index;
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.id = "progressBar-" + index;
    progressContainer.appendChild(progressBar);
    // Add progress thumb
    const progressThumb = document.createElement("div");
    progressThumb.className = "progress-thumb";
    progressContainer.appendChild(progressThumb);
    controls.appendChild(progressContainer);

    // Duration display
    const durationSpan = document.createElement("span");
    durationSpan.className = "arabica_video-time";
    durationSpan.innerHTML = `<span id="duration-${index}">0:00</span>`;
    controls.appendChild(durationSpan);

    // Volume button
    const volumeBtn = document.createElement("button");
    volumeBtn.className = "volume-btn";
    volumeBtn.id = "volume-" + index;
    volumeBtn.innerHTML = `
      <svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
        <line class="slash" x1="22" y1="2" x2="2" y2="22"></line>
      </svg>
    `;
    controls.appendChild(volumeBtn);

    // Append the controls container to the audio container
    container.appendChild(controls);
  }

  // **Function to Setup Audio Events**
  function setupAudioEvents(audio, container, index) {
    const playPauseBtn = container.querySelector("#playPause-" + index);
    const restartBtn = container.querySelector("#restart-" + index);
    const progressContainer = container.querySelector(
      "#progressContainer-" + index
    );
    const progressBar = container.querySelector("#progressBar-" + index);
    const progressThumb = progressContainer.querySelector(".progress-thumb");
    const currentTimeEl = container.querySelector("#currentTime-" + index);
    const durationEl = container.querySelector("#duration-" + index);
    const volumeBtn = container.querySelector("#volume-" + index);
    const playBtnIcon = playPauseBtn.querySelector("path");

    // Define SVG paths for play and pause icons
    const playIconPath = "M8 5v14l11-7z";
    const pauseIconPath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

    // Toggle play/pause state
    function togglePlay() {
      if (audio.paused) {
        audio.play();
        playBtnIcon.setAttribute("d", pauseIconPath);
      } else {
        audio.pause();
        playBtnIcon.setAttribute("d", playIconPath);
      }
    }

    playPauseBtn.addEventListener("click", togglePlay);
    audio.addEventListener("click", togglePlay);

    // Restart functionality
    restartBtn.addEventListener("click", () => {
      audio.currentTime = 0;
      audio.play();
      playBtnIcon.setAttribute("d", pauseIconPath);
    });

    // Update progress bar and current time during playback
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressThumb.style.left = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    });

    // Allow seeking by clicking on the progress container
    progressContainer.addEventListener("click", (e) => {
      audio.currentTime =
        (e.offsetX / progressContainer.offsetWidth) * audio.duration;
    });

    // Dragging logic for progress thumb with fix to prevent text selection
    let isDragging = false;

    function startDragging(e) {
      if (!isFinite(audio.duration)) return;
      e.preventDefault(); // Prevent default mousedown behavior (e.g., text selection)
      isDragging = true;
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", stopDragging);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault(); // Prevent default mousemove behavior (e.g., text selection)
      const rect = progressContainer.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newPercent = Math.max(
        0,
        Math.min(100, (offsetX / rect.width) * 100)
      );
      const newTime = (newPercent / 100) * audio.duration;
      audio.currentTime = newTime;
      progressBar.style.width = `${newPercent}%`;
      progressThumb.style.left = `${newPercent}%`;
    }

    function stopDragging() {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDragging);
    }

    progressThumb.addEventListener("mousedown", startDragging);

    // Touch events for dragging
    function startDraggingTouch(e) {
      if (!isFinite(audio.duration)) return;
      e.preventDefault();
      if (e.touches.length > 0) {
        isDragging = true;
        document.addEventListener("touchmove", dragTouch, { passive: false });
        document.addEventListener("touchend", stopDraggingTouch);
      }
    }

    function dragTouch(e) {
      if (!isDragging || e.touches.length === 0) return;
      e.preventDefault();
      const rect = progressContainer.getBoundingClientRect();
      const offsetX = e.touches[0].clientX - rect.left;
      const newPercent = Math.max(
        0,
        Math.min(100, (offsetX / rect.width) * 100)
      );
      const newTime = (newPercent / 100) * audio.duration;
      audio.currentTime = newTime;
      progressBar.style.width = `${newPercent}%`;
      progressThumb.style.left = `${newPercent}%`;
    }

    function stopDraggingTouch() {
      isDragging = false;
      document.removeEventListener("touchmove", dragTouch);
      document.removeEventListener("touchend", stopDraggingTouch);
    }

    progressThumb.addEventListener("touchstart", startDraggingTouch);

    // Allow mouse wheel scrolling on progress container
    progressContainer.addEventListener("wheel", (e) => {
      e.preventDefault();
      const increment = audio.duration * 0.01;
      if (e.deltaY < 0) {
        audio.currentTime = Math.min(
          audio.duration,
          audio.currentTime + increment
        );
      } else {
        audio.currentTime = Math.max(0, audio.currentTime - increment);
      }
    });

    // Allow touch scrolling on progress container
    let touchStartX = null;
    progressContainer.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
      }
    });

    progressContainer.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0 && touchStartX !== null) {
        e.preventDefault();
        let touchX = e.touches[0].clientX;
        let deltaX = touchX - touchStartX;
        let containerWidth = progressContainer.offsetWidth;
        let timeDelta = (deltaX / containerWidth) * audio.duration;
        audio.currentTime = Math.max(
          0,
          Math.min(audio.duration, audio.currentTime + timeDelta)
        );
        touchStartX = touchX;
      }
    });

    // Helper function to format time as mm:ss
    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
      return `${minutes}:${seconds}`;
    }

    // Display total duration once metadata is loaded
    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    // When playback ends, reset play icon
    audio.addEventListener("ended", () => {
      playBtnIcon.setAttribute("d", playIconPath);
    });

    // Toggle mute state
    volumeBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
      volumeBtn.classList.toggle("muted", audio.muted);
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------
         GLOBAL LIGHTBOX SETUP
     ------------------------------ */
  const lightbox = document.createElement("div");
  lightbox.classList.add("arabica_article_lightbox");

  const lightboxContent = document.createElement("div");
  lightboxContent.classList.add("arabica_article_lightbox-content");

  const closeBtn = document.createElement("span");
  closeBtn.classList.add("arabica_article_close-btn");
  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path fill="#ffffff"
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12
               5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;

  const lightboxImg = document.createElement("img");
  lightboxImg.id = "lightbox-img";

  const lightboxCaption = document.createElement("div");
  lightboxCaption.classList.add("arabica_article_lightbox-caption");
  lightboxCaption.id = "lightbox-caption";

  // Gallery grid (for multi-image lightbox)
  const galleryGrid = document.createElement("div");
  galleryGrid.classList.add("arabica_article_lightbox-gallery-grid");
  galleryGrid.style.display = "none";

  // build DOM
  lightbox.appendChild(closeBtn);
  lightboxContent.appendChild(lightboxImg);
  lightboxContent.appendChild(lightboxCaption);
  lightbox.appendChild(galleryGrid);
  lightbox.appendChild(lightboxContent);
  document.body.appendChild(lightbox);

  let currentGallery = [];
  let currentIndex = 0;
  let lbTouchStartX = 0;
  let lbTouchEndX   = 0;

  function openLightbox(src, alt, caption, gallery = []) {
    lightboxImg.src         = src;
    lightboxImg.alt         = alt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add("active");
    document.body.classList.add("no-scroll");

    if (gallery.length > 1) {
      currentGallery = gallery;
      currentIndex   = gallery.findIndex(item => item.src === src);
      updateGalleryGrid(gallery);
      galleryGrid.style.display = "flex";
    } else {
      currentGallery = [];
      galleryGrid.innerHTML = "";
      galleryGrid.style.display = "none";
    }
  }

  function closeLightbox() {
    lightbox.classList.add("closing");
    document.body.classList.remove("no-scroll");
    setTimeout(() => {
      lightbox.classList.remove("active", "closing");
      currentGallery = [];
      galleryGrid.innerHTML = "";
    }, 400);
  }

  function updateGalleryGrid(gallery) {
    galleryGrid.innerHTML = gallery
      .map((item, i) =>
        `<img
           src="${item.src}"
           alt="${item.alt}"
           data-index="${i}"
           class="${i === currentIndex ? 'active' : ''}"
         >`
      )
      .join("");

    const activeImg = galleryGrid.querySelector(`[data-index="${currentIndex}"]`);
    if (activeImg) {
      activeImg.classList.add("active");
      requestAnimationFrame(() => {
        const vw = window.innerWidth;
        const gw = galleryGrid.scrollWidth;

        if (gw > vw) {
          galleryGrid.style.left = "0";
          const center = activeImg.offsetLeft + activeImg.offsetWidth / 2;
          const idealTranslate = vw / 2 - center;
          const clamped = Math.min(0, Math.max(vw - gw, idealTranslate));
          galleryGrid.style.transition  = "transform 0.3s ease-in-out";
          galleryGrid.style.transform   = `translateX(${clamped}px)`;
        } else {
          galleryGrid.style.removeProperty("left");
          galleryGrid.style.removeProperty("transform");
          galleryGrid.style.removeProperty("transition");
        }
      });
    }
  }

  let gridTouchStartX      = 0;
  let currentGridTranslate = 0;

  galleryGrid.addEventListener("touchstart", e => {
    const vw = window.innerWidth;
    const gw = galleryGrid.scrollWidth;
    if (gw > vw) {
      gridTouchStartX = e.touches[0].clientX;
      galleryGrid.style.transition = "none";
    }
  });

  galleryGrid.addEventListener("touchmove", e => {
    const vw = window.innerWidth;
    const gw = galleryGrid.scrollWidth;
    if (gw > vw) {
      let delta = e.touches[0].clientX - gridTouchStartX;
      let tx = currentGridTranslate + delta;
      tx = Math.min(0, Math.max(vw - gw, tx));
      galleryGrid.style.transform = `translateX(${tx}px)`;
    }
  });

  galleryGrid.addEventListener("touchend", () => {
    const vw = window.innerWidth;
    const gw = galleryGrid.scrollWidth;
    if (gw > vw) {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(galleryGrid).transform);
      currentGridTranslate = matrix.m41;
      galleryGrid.style.transition = "transform 0.3s ease-in-out";
    }
  });

  function updateLightboxContent() {
    const { src, alt, caption } = currentGallery[currentIndex];
    lightboxImg.style.opacity = "0";
    setTimeout(() => {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightboxCaption.textContent = caption;
      updateGalleryGrid(currentGallery);
      lightboxImg.style.opacity = "1";
    }, 150);
  }

  const showNextImage = () => {
    if (currentGallery.length) {
      currentIndex = (currentIndex + 1) % currentGallery.length;
      updateLightboxContent();
    }
  };

  const showPrevImage = () => {
    if (currentGallery.length) {
      currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      updateLightboxContent();
    }
  };

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight" || e.key === "ArrowDown") showNextImage();
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   showPrevImage();
  });

  let lastWheel = 0;
  lightbox.addEventListener("wheel", e => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheel < 400) return;
    lastWheel = now;
    if (e.deltaY > 0) showNextImage();
    if (e.deltaY < 0) showPrevImage();
  }, { passive: false });

  galleryGrid.addEventListener("click", e => {
    if (e.target.tagName === "IMG") {
      currentIndex = parseInt(e.target.dataset.index, 10);
      updateLightboxContent();
    }
  });

  lightboxImg.addEventListener("touchstart", e => { lbTouchStartX = e.touches[0].clientX; });
  lightboxImg.addEventListener("touchmove",  e => { lbTouchEndX   = e.touches[0].clientX; });
  lightboxImg.addEventListener("touchend",   () => {
    if (lbTouchStartX - lbTouchEndX > 50) showNextImage();
    if (lbTouchEndX - lbTouchStartX > 50) showPrevImage();
  });

  /* ------------------------------
         GALLERY SLIDER SETUP
     ------------------------------ */
  document.querySelectorAll(".arabica_article-gallery-container").forEach(container => {
    const isMobile = window.matchMedia("only screen and (max-width: 767px)").matches;
    const selector = (
      isMobile ? ".arabica_article-image-gallery, .arabica_article-mobile-gallery"
        : ".arabica_article-image-gallery"
    );

    const galleryItems = container.querySelectorAll(selector);
    if (!galleryItems.length) return;

    const slider        = document.createElement("div");
    slider.className    = "arabica_article_slider";
    slider.style.position = "relative";

    const sliderWrapper = document.createElement("div");
    sliderWrapper.className = "arabica_article_slider_wrapper";

    galleryItems.forEach(item => sliderWrapper.appendChild(item));
    slider.appendChild(sliderWrapper);

    const prevBtn = document.createElement("button");
    prevBtn.className = "arabica_article_slider-nav arabica_article_slider-prev";
    prevBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#ffffff" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
      </svg>
    `;

    const nextBtn = document.createElement("button");
    nextBtn.className = "arabica_article_slider-nav arabica_article_slider-next";
    nextBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#ffffff" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
      </svg>
    `;

    const counter = document.createElement("span");
    counter.className = "arabica_article_slider-counter";
    counter.innerHTML = `<i class="fa-regular fa-images"></i> 1 / ${galleryItems.length}`;

    slider.append(prevBtn, nextBtn, counter);
    container.innerHTML = "";
    container.appendChild(slider);

    let currentSlide      = 0;
    let sliderWidth       = slider.offsetWidth;
    let startX            = 0;
    let startY            = 0;
    let isDragging        = false;
    let isHorizontalDrag  = false;

    const setSliderPosition = () => {
      sliderWrapper.style.transform = `translateX(-${currentSlide * sliderWidth}px)`;
    };

    const updateSliderHeight = () => {
      const el = sliderWrapper.children[currentSlide];
      if (el) slider.style.height = `${el.offsetHeight}px`;
    };

    const updateNavButtonsPosition = () => {
      const slideEl = sliderWrapper.children[currentSlide];
      if (!slideEl) return; // no slide, bail out

      const imgEl = slideEl.querySelector("img");
      if (imgEl) {
        const imgRect = imgEl.getBoundingClientRect();
        const sliderRect = slider.getBoundingClientRect();
        const centerY = imgRect.top - sliderRect.top + imgEl.offsetHeight / 2;
        prevBtn.style.top = `${centerY}px`;
        nextBtn.style.top = `${centerY}px`;
      }
    };

    const updateCounter = () => {
      counter.innerHTML = `<i class="fa-regular fa-images"></i> ${
        currentSlide + 1
      } / ${galleryItems.length}`;

      const slideEl = sliderWrapper.children[currentSlide];
      const capEl = slideEl ? slideEl.querySelector("figcaption") : null;
      const gap = capEl ? capEl.offsetHeight + 10 : 10;
      counter.style.bottom = `${gap}px`;
    };

    const updateSliderLayout = () => {
      sliderWidth = slider.offsetWidth;
      setSliderPosition();
      updateSliderHeight();
      updateNavButtonsPosition();
      updateCounter();
    };

    // init
    updateSliderLayout();
    window.addEventListener("resize", updateSliderLayout);

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % galleryItems.length;
      sliderWrapper.style.transition = "transform 0.3s ease-in-out";
      setSliderPosition();
      updateSliderLayout();
    };

    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + galleryItems.length) % galleryItems.length;
      sliderWrapper.style.transition = "transform 0.3s ease-in-out";
      setSliderPosition();
      updateSliderLayout();
    };

    nextBtn.addEventListener("click", nextSlide);
    prevBtn.addEventListener("click", prevSlide);

    // touch ↔ drag
    sliderWrapper.addEventListener("touchstart", e => {
      isDragging = true;
      isHorizontalDrag = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      sliderWrapper.style.transition = "none";
    });

    sliderWrapper.addEventListener("touchmove", e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!isHorizontalDrag) {
        if (Math.abs(dx) > Math.abs(dy)) isHorizontalDrag = true;
        else return;
      }
      sliderWrapper.style.transform = `translateX(-${currentSlide * sliderWidth - dx}px)`;
    });

    sliderWrapper.addEventListener("touchend", e => {
      if (!isDragging) return;
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (isHorizontalDrag) {
        if (dx < -50) nextSlide();
        else if (dx > 50) prevSlide();
        else setSliderPosition();
      } else {
        setSliderPosition();
      }
      sliderWrapper.style.transition = "transform 0.3s ease-in-out";
    });

    // hookup lightbox on click
    sliderWrapper.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", e => {
        const href = link.href;
        if (/\.(jpe?g|png|gif|webp|svg)$/i.test(href)) {
          e.preventDefault();
          const imgEl       = link.querySelector("img");
          const altText     = imgEl ? imgEl.alt : "";
          const captionText = link.nextElementSibling &&
            link.nextElementSibling.tagName.toLowerCase() === "figcaption" ? link.nextElementSibling.textContent
              : "";
          const gallery = [...container.querySelectorAll("a")].map(a => ({
            src: a.href,
            alt: a.querySelector("img")?.alt || "",
            caption:
              a.nextElementSibling &&
              a.nextElementSibling.tagName.toLowerCase() === "figcaption" ? a.nextElementSibling.textContent
                : ""
          }));
          openLightbox(href, altText, captionText, gallery);
        }
      });
    });
  });

  /* ------------------------------
     MOBILE GALLERY LIGHTBOX ON DESKTOP
     ------------------------------ */
  if (!window.matchMedia("only screen and (max-width: 767px)").matches) {
    document
      .querySelectorAll(
        ".arabica_article-gallery-container .arabica_article-mobile-gallery a"
      )
      .forEach(link => {
        const href = link.href;
        if (/\.(jpe?g|png|gif|webp|svg)$/i.test(href)) {
          link.addEventListener("click", e => {
            e.preventDefault();
            const imgEl       = link.querySelector("img");
            const altText     = imgEl ? imgEl.alt : "";
            const captionText =
              link.nextElementSibling &&
              link.nextElementSibling.tagName.toLowerCase() === "figcaption" ? link.nextElementSibling.textContent
                : "";
            const containerEl = link.closest(
              ".arabica_article-gallery-container"
            );
            const gallery = [...containerEl.querySelectorAll(
              ".arabica_article-mobile-gallery a"
            )].map(a => ({
              src: a.href,
              alt: a.querySelector("img")?.alt || "",
              caption:
                a.nextElementSibling &&
                a.nextElementSibling.tagName.toLowerCase() === "figcaption" ? a.nextElementSibling.textContent
                  : ""
            }));
            openLightbox(href, altText, captionText, gallery);
          });
        }
      });
  }

  /* ------------------------------
         SINGLE IMAGE SETUP
     ------------------------------ */
  document
    .querySelectorAll(
      ".arabica_article-content a, .arabica_article-image a, " +
      ".arabica_news-content a, .arabica_news-image a"
    )
    .forEach(anchor => {
      const href = anchor.href;
      if (
        /\.(jpe?g|png|gif|webp|svg)$/i.test(href) &&
        !anchor.closest(
          ".arabica_article-image-gallery, .arabica_article-mobile-gallery"
        )
      ) {
        anchor.addEventListener("click", e => {
          e.preventDefault();
          const imgEl       = anchor.querySelector("img");
          const altText     = imgEl ? imgEl.alt : "";
          const captionText =
            anchor.nextElementSibling &&
            anchor.nextElementSibling.tagName.toLowerCase() === "figcaption" ? anchor.nextElementSibling.textContent
              : "";
          openLightbox(href, altText, captionText);
        });
      }
    });
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

document.addEventListener("DOMContentLoaded", function () {
  const galleries = document.querySelectorAll(
    ".arabica_article-image-gallery, .arabica_article-mobile-gallery"
  );

  galleries.forEach((gallery) => {
    const img = gallery.querySelector("img");

    if (img) {
      const galleryRatio = gallery.clientWidth / gallery.clientHeight;
      const imageRatio = img.naturalWidth / img.naturalHeight;

      // Calculate 15% tolerance range
      const lowerBound = galleryRatio * 0.85;
      const upperBound = galleryRatio * 1.15;

      if (imageRatio >= lowerBound && imageRatio <= upperBound) {
        img.style.objectFit = "cover";
      } else {
        img.style.objectFit = "contain";
      }
    }
  });
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

document.addEventListener("DOMContentLoaded", () => {
  // only on desktop
  if (window.innerWidth < 768) return;

  document
    .querySelectorAll(".arabica_article-gallery-container")
    .forEach((container) => {
      if (!container.querySelector(".arabica_article-mobile-gallery")) return;

      // wrap & prepare positioning context
      const wrapper = document.createElement("div");
      wrapper.className = "slider-container";
      wrapper.style.position = "relative"; // make wrapper the positioning parent
      container.parentNode.insertBefore(wrapper, container);
      wrapper.appendChild(container);

      // create SVG buttons
      const prev = document.createElement("button");
      prev.className = "slider-btn prev hidden";
      prev.setAttribute("aria-label", "Previous");
      prev.style.position = "absolute"; // absolutely position them
      prev.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#ffffff" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
        </svg>`;

      const next = document.createElement("button");
      next.className = "slider-btn next hidden";
      next.setAttribute("aria-label", "Next");
      next.style.position = "absolute";
      next.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#ffffff" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
        </svg>`;

      wrapper.append(prev, next);

      // determine LTR/RTL placement
      const isRtl = getComputedStyle(container).direction === "rtl";
      if (isRtl) {
        prev.style.right = "8px";
        next.style.left = "8px";
      } else {
        prev.style.left = "8px";
        next.style.right = "8px";
      }

      // grab items for scroll-step logic
      const items = container.querySelectorAll(
        ".arabica_article-mobile-gallery"
      );
      const gap = parseInt(getComputedStyle(container).gap) || 0;
      const step = () => items[0].getBoundingClientRect().width + gap;

      // show/hide buttons based on scroll
      function updateButtons() {
        const raw = container.scrollLeft;
        const norm = isRtl ? -raw : raw;
        const max = container.scrollWidth - container.clientWidth;
        prev.classList.toggle("visible", norm > 1);
        prev.classList.toggle("hidden", norm <= 1);
        next.classList.toggle("visible", norm + 1 < max);
        next.classList.toggle("hidden", norm + 1 >= max);
      }

      prev.addEventListener("click", () => {
        container.scrollBy({
          left: isRtl ? step() : -step(),
          behavior: "smooth",
        });
      });
      next.addEventListener("click", () => {
        container.scrollBy({
          left: isRtl ? -step() : step(),
          behavior: "smooth",
        });
      });
      container.addEventListener("scroll", updateButtons);
      window.addEventListener("resize", updateButtons);

      // ——— NEW: center buttons on the image ——–
      const img = container.querySelector("img");
      function positionButtons() {
        // get image mid‑point relative to wrapper
        const imgRect = img.getBoundingClientRect();
        const wrapRect = wrapper.getBoundingClientRect();
        const centerY = imgRect.top - wrapRect.top + imgRect.height / 2;
        prev.style.top = `${centerY}px`;
        next.style.top = `${centerY}px`;
      }
      window.addEventListener("resize", positionButtons);
      container.addEventListener("scroll", positionButtons);
      // initial placement
      positionButtons();
      // ————————————————————————

      // initial visibility state
      updateButtons();
    });
});
