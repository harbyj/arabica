/* jshint esversion: 6 */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    cloneNavMenu();
    initShareLinks();
    initSmoothScroll();
    initSlider();
    initLoadMore();
    initLoadMoreShort();
    initEditorModal();
    initContactForm();
    initLayoutSwitcher();
    initDropdowns();
    initEditorSeparator();
    initFootnotes();
    initFootnoteDirection();
    initReferenceSection();
    initTOC();
    initEDNReferences();
    initVideoPlayer();
    initLightboxAndGallery();
    initSideContent();
  });

  // ---------------------------
  // Mobile Navigation Toggle
  // ---------------------------
  function initMobileNav() {
    const menuToggle = document.getElementById("menuToggle");
    const menuClose = document.getElementById("menuClose");
    const mobileNav = document.getElementById("mobileNav");
    const body = document.body;

    if (menuToggle && menuClose && mobileNav) {
      menuToggle.addEventListener("click", () => {
        mobileNav.classList.add("visible");
        mobileNav.classList.remove("hidden");
        body.classList.add("no-scroll");
      });

      menuClose.addEventListener("click", () => {
        mobileNav.classList.remove("visible");
        mobileNav.classList.add("hidden");
        body.classList.remove("no-scroll");
      });
    }
  }

  // ---------------------------
  // Clone Navigation Menu for Mobile
  // ---------------------------
  function cloneNavMenu() {
    const navMenu = document.querySelector("#navMenu ul");
    const mobileNavList = document.querySelector(".arabica_mobile_nav_list");

    if (navMenu && mobileNavList) {
      mobileNavList.appendChild(navMenu.cloneNode(true));
    }
  }

  // ---------------------------
  // Native Share Dialog
  // ---------------------------
  function initShareLinks() {
    const shareLinks = document.querySelectorAll(".arabica_share-link");
    shareLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const shareData = {
          title: event.target.getAttribute("data-share-title"),
          url: event.target.getAttribute("data-share-url"),
        };

        if (navigator.share) {
          navigator
            .share(shareData)
            .then(() => console.log("Share was successful."))
            .catch((error) => console.log("Sharing failed", error));
        } else {
          alert("Web Share API is not supported in your browser.");
        }
      });
    });
  }

  // ---------------------------
  // Smooth Scroll for Anchor Links
  // ---------------------------
  function initSmoothScroll() {
    document.addEventListener("click", function (event) {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute("href").slice(1);
      if (!targetId) return;

      let targetElement = document.getElementById(targetId);
      if (!targetElement) {
        targetElement = document.getElementsByName(targetId)[0];
      }

      if (targetElement) {
        event.preventDefault();
        const offset = 20;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          offset;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    });
  }

  // ---------------------------
  // Slider Initialization
  // ---------------------------
  function initSlider() {
    const slides = document.querySelectorAll(".arabica_slide");
    const buttons = document.querySelectorAll(".arabica_slider-buttons button");
    let currentSlide = 0;
    let autoSlideInterval;
    let isPageVisible = true;
    const slider = document.querySelector(".arabica_slider");

    if (!slides.length || !buttons.length || !slider) return;

    const showSlide = (index) => {
      slides.forEach((slide, i) =>
        slide.classList.toggle("active", i === index)
      );
      buttons.forEach((button, i) =>
        button.classList.toggle("active", i === index)
      );
    };

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    };

    const startAutoSlide = () => {
      autoSlideInterval = setInterval(nextSlide, 10000);
    };

    const stopAutoSlide = () => {
      clearInterval(autoSlideInterval);
    };

    const resetTimer = () => {
      stopAutoSlide();
      startAutoSlide();
    };

    buttons.forEach((button, i) => {
      button.addEventListener("click", () => {
        currentSlide = i;
        showSlide(currentSlide);
        resetTimer();
      });
    });

    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance > swipeThreshold) {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      } else if (swipeDistance < -swipeThreshold) {
        currentSlide = (currentSlide + 1) % slides.length;
      }
      showSlide(currentSlide);
      resetTimer();
    };

    document.addEventListener("visibilitychange", () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        startAutoSlide();
      } else {
        stopAutoSlide();
      }
    });

    startAutoSlide();
    showSlide(currentSlide);
  }

  // ---------------------------
  // Load More for Featured Articles
  // ---------------------------
  function initLoadMore() {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const articles = document.querySelectorAll(".arabica_featured-article");
    if (!loadMoreBtn || !articles.length) return;

    const plusIcon = loadMoreBtn.querySelector(
      ".arabica_featured-pager .fa-plus"
    );
    const minusIcon = loadMoreBtn.querySelector(
      ".arabica_featured-pager .fa-minus"
    );
    const loadingIcon = loadMoreBtn.querySelector(
      ".arabica_featured-pager .arabica_loading-icon"
    );
    let expanded = false;

    // Initially show only first 2 articles
    for (let i = 2; i < articles.length; i++) {
      articles[i].classList.add("hidden");
    }
    plusIcon.style.display = "inline-block";
    minusIcon.style.display = "none";
    loadingIcon.style.display = "none";

    loadMoreBtn.addEventListener("click", (event) => {
      event.preventDefault();
      plusIcon.style.display = "none";
      minusIcon.style.display = "none";
      loadingIcon.style.display = "inline-block";
      loadMoreBtn.style.pointerEvents = "none";

      setTimeout(() => {
        if (!expanded) {
          for (let i = 2; i < articles.length; i++) {
            articles[i].classList.remove("hidden");
          }
          minusIcon.style.display = "inline-block";
        } else {
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
  }

  // ---------------------------
  // Load More for Short Articles
  // ---------------------------
  function initLoadMoreShort() {
    const loadMoreBtn2 = document.getElementById("loadMoreBtn2");
    const shortArticles = document.querySelectorAll(".arabica_short-article");
    if (!loadMoreBtn2 || !shortArticles.length) return;

    const plusIcon2 = loadMoreBtn2.querySelector(
      ".arabica_short-pager .fa-plus"
    );
    const minusIcon2 = loadMoreBtn2.querySelector(
      ".arabica_short-pager .fa-minus"
    );
    const loadingIcon2 = loadMoreBtn2.querySelector(
      ".arabica_short-pager .arabica_loading-icon"
    );
    let expandedShort = false;

    shortArticles.forEach((article, index) => {
      if (index >= 6) {
        article.classList.add("hidden");
        article.style.display = "none";
      }
    });
    plusIcon2.style.display = "inline-block";
    minusIcon2.style.display = "none";
    loadingIcon2.style.display = "none";

    const showArticle = (article) => {
      article.style.display = "block";
      void article.offsetWidth; // Force reflow for transition
      article.classList.remove("hidden");
    };

    const hideArticle = (article) => {
      article.classList.add("hidden");
      article.addEventListener(
        "transitionend",
        () => {
          if (article.classList.contains("hidden")) {
            article.style.display = "none";
          }
        },
        { once: true }
      );
    };

    loadMoreBtn2.addEventListener("click", (event) => {
      event.preventDefault();
      plusIcon2.style.display = "none";
      minusIcon2.style.display = "none";
      loadingIcon2.style.display = "inline-block";
      loadMoreBtn2.style.pointerEvents = "none";

      setTimeout(() => {
        if (!expandedShort) {
          for (let i = 6; i < shortArticles.length; i++) {
            showArticle(shortArticles[i]);
          }
          minusIcon2.style.display = "inline-block";
        } else {
          for (let i = 6; i < shortArticles.length; i++) {
            hideArticle(shortArticles[i]);
          }
          plusIcon2.style.display = "inline-block";
        }
        loadingIcon2.style.display = "none";
        loadMoreBtn2.style.pointerEvents = "auto";
        expandedShort = !expandedShort;
      }, 0);
    });
  }

  // ---------------------------
  // Update Timeline Line Height
  // ---------------------------
  function updateLineHeight() {
    const container = document.querySelector(".arabica_timeline-container");
    if (!container) return;

    const lastContent = container.querySelector(
      ".arabica_timeline-items .arabica_timeline-item:last-of-type .arabica_timeline-content"
    );
    if (!lastContent) return;

    const containerRect = container.getBoundingClientRect();
    const lastRect = lastContent.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    let targetBottom, startOffset;

    if (viewportWidth <= 767) {
      targetBottom = lastRect.top - containerRect.top + 36;
      startOffset = 60;
    } else if (viewportWidth <= 991) {
      targetBottom = lastRect.top - containerRect.top + 42;
      startOffset = 70;
    } else {
      targetBottom = lastRect.top - containerRect.top + lastRect.height / 2;
      startOffset = 125;
    }

    const newHeight = targetBottom - startOffset;
    container.style.setProperty("--line-height", newHeight + "px");
  }
  window.addEventListener("load", updateLineHeight);
  window.addEventListener("resize", updateLineHeight);

  // ---------------------------
  // Editor Modal Functionality
  // ---------------------------
  function initEditorModal() {
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

    if (!modal) return;

    const hideIfEmpty = (element, displayType) => {
      if (!element || element.textContent.trim() === "") {
        element.style.display = "none";
      } else {
        element.style.display = displayType;
      }
    };

    const updateSeparator = () => {
      const editorField = editorElements.editorField.textContent.trim();
      const editorTitle = editorElements.editorTitle.textContent.trim();
      editorElements.separator.style.display =
        editorField && editorTitle ? "inline" : "none";
    };

    document.querySelectorAll(".arabica_editor-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const editorInfo = link.querySelector(".arabica_editor-info");

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

        const bio = editorInfo.querySelector(".arabica_editor-bio");
        if (bio && bio.textContent.trim() !== "") {
          editorElements.editorBio.innerHTML = bio.innerHTML;
          editorElements.editorBio.style.display = "inline-block";
        } else {
          editorElements.editorBio.innerHTML = "";
          editorElements.editorBio.style.display = "none";
        }

        const image = link.querySelector(".arabica_editor-image");
        if (image) {
          editorElements.editorImage.src = "";
          setTimeout(() => {
            editorElements.editorImage.src = image.src;
            editorElements.editorImage.alt =
              editorElements.editorName.textContent || image.alt;
            editorElements.editorImage.style.display = "inline-block";
          }, 0.1);
        } else {
          editorElements.editorImage.style.display = "none";
        }

        const emailElement = editorInfo.querySelector(".arabica_editor-email");
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

        Object.entries(editorElements).forEach(([key, element]) => {
          if (key !== "separator") {
            const displayType =
              key === "editorName"
                ? "block"
                : key === "editorEmail"
                ? "inline-flex"
                : "inline-block";
            hideIfEmpty(element, displayType);
          }
        });

        updateSeparator();
        document.body.classList.add("no-scroll");
        modal.classList.add("show");
      });
    });

    const closeModal = () => {
      modal.classList.remove("show");
      document.body.classList.remove("no-scroll");
    };

    closeModalBtn.addEventListener("click", closeModal);
    window.addEventListener(
      "click",
      (event) => event.target === modal && closeModal()
    );
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("show")) {
        closeModal();
      }
    });
  }

  // ---------------------------
  // Contact Form Submission
  // ---------------------------
  function initContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const isSuccess = Math.random() > 0.5;
      const feedbackEl = document.getElementById("feedback");
      feedbackEl.style.display = "block";

      if (isSuccess) {
        feedbackEl.textContent = "تم الإرسال بنجاح!";
        feedbackEl.classList.remove("error");
        feedbackEl.classList.add("success");
      } else {
        feedbackEl.textContent = "فشل في إرسال الرسالة!";
        feedbackEl.classList.remove("success");
        feedbackEl.classList.add("error");
      }
      setTimeout(() => {
        feedbackEl.style.display = "none";
      }, 3000);
    });
  }

  // ---------------------------
  // Layout Switcher (Grid/List)
  // ---------------------------
  function initLayoutSwitcher() {
    const gridButton = document.querySelector(".arabica_grid");
    const listButton = document.querySelector(".arabica_list");
    const contentContainer = document.querySelector(
      ".arabica_featured-content"
    );
    if (!gridButton || !listButton || !contentContainer) return;

    let savedLayout = localStorage.getItem("layoutPreference") || "list";
    if (savedLayout === "grid") {
      contentContainer.classList.add("grid-posts");
      gridButton.classList.add("active");
      listButton.classList.remove("active");
    } else {
      contentContainer.classList.remove("grid-posts");
      listButton.classList.add("active");
      gridButton.classList.remove("active");
    }

    const applyLayout = (isGrid) => {
      if (
        (isGrid && contentContainer.classList.contains("grid-posts")) ||
        (!isGrid && !contentContainer.classList.contains("grid-posts"))
      ) {
        return;
      }
      contentContainer.classList.add("fade-out");

      setTimeout(() => {
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
        void contentContainer.offsetWidth;
        contentContainer.classList.add("fade-in");
        setTimeout(() => {
          contentContainer.classList.remove("fade-in");
        }, 0);
      }, 0);
    };

    gridButton.addEventListener("click", () => applyLayout(true));
    listButton.addEventListener("click", () => applyLayout(false));
  }

  // ---------------------------
  // Dropdown Functionality
  // ---------------------------
  function initDropdowns() {
    // Toggle dropdown open/close
    window.toggleDropdown = (button) => {
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
    };

    // Initialize checkbox behavior
    document
      .querySelectorAll(".arabica_dropdown-content")
      .forEach((dropdownContent) => {
        const selectAllCheckbox =
          dropdownContent.querySelector(".select-all input");
        if (selectAllCheckbox) {
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
        }
      });

    // Close dropdown when clicking outside
    window.addEventListener("click", function (event) {
      if (
        !event.target.closest(".arabica_dropdown") &&
        !event.target.matches('input[type="checkbox"]')
      ) {
        document.querySelectorAll(".arabica_dropdown").forEach((dropdown) => {
          dropdown.classList.remove("active");
        });
      }
    });
  }

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
    if (selectAllCheckbox.checked) {
      selectAllLabel.classList.add("checked");
    } else {
      selectAllLabel.classList.remove("checked");
    }
  }

  function handleCheckboxChange(event) {
    const dropdownContent = event.target.closest(".arabica_dropdown-content");
    const checkboxes = dropdownContent.querySelectorAll(
      'input[type="checkbox"]:not(.select-all input)'
    );
    const selectAllCheckbox =
      dropdownContent.querySelector(".select-all input");
    const selectAllLabel = selectAllCheckbox.closest("label");
    const checkbox = event.target;
    const label = checkbox.closest("label");

    if (checkbox.checked) {
      label.classList.add("checked");
    } else {
      label.classList.remove("checked");
    }

    const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
    if (allChecked) {
      selectAllCheckbox.checked = true;
      selectAllLabel.classList.add("checked");
    } else {
      selectAllCheckbox.checked = false;
      selectAllLabel.classList.remove("checked");
    }
  }

  // ---------------------------
  // Add Separator between Editor Fields
  // ---------------------------
  function initEditorSeparator() {
    document.querySelectorAll(".arabica_editor-category").forEach((field) => {
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
  }

  function initFootnotes() {
    // Move paragraphs with footnotes (excluding those with "ref")
    document
      .querySelectorAll(".arabica_article-content p")
      .forEach(function (p) {
        const footnote = p.querySelector('a[name^="_ftn"]');
        if (footnote && !footnote.getAttribute("name").includes("ref")) {
          const target = document.querySelector(".arabica_foot-reference");
          if (target) {
            target.appendChild(p);
          }
        }
      });
  }

  // ---------------------------
  // 2. Set Direction on Footnotes and Sources
  // ---------------------------
  function initFootnoteDirection() {
    document
      .querySelectorAll(".arabica_foot-reference p, .arabica_foot-source li")
      .forEach((el) => {
        // If no Arabic characters are detected, set direction to LTR.
        if (!/[\u0600-\u06FF]/.test(el.textContent)) {
          el.setAttribute("dir", "ltr");
        }
      });
  }

  // ---------------------------
  // 3. Process Reference Section (Headings)
  // ---------------------------
  function initReferenceSection() {
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
    ];

    const headings = document.querySelectorAll(
      "div.arabica_article-content h2"
    );
    let referenceFound = false;

    headings.forEach((heading) => {
      const headingText = heading.textContent.trim();
      if (referenceTitles.some((title) => headingText.includes(title))) {
        referenceFound = true;
        const elementsToMove = [heading];
        let nextElem = heading.nextElementSibling;

        // Collect all siblings until a <p> element is encountered.
        while (nextElem && nextElem.tagName.toLowerCase() !== "p") {
          elementsToMove.push(nextElem);
          nextElem = nextElem.nextElementSibling;
        }

        const targetContainer = document.querySelector(
          ".arabica_article-sources"
        );
        if (targetContainer) {
          elementsToMove.forEach((el) => {
            targetContainer.appendChild(el);
          });
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
  }

  // ---------------------------
  // 4. Build Table of Contents (TOC)
  // ---------------------------
  function initTOC() {
    const contentContainer = document.querySelector(".arabica_article-content");
    const tocContainer = document.querySelector(
      ".arabica_article-table-content"
    );
    const footContainer = document.querySelector(".arabica_foot-container");

    if (contentContainer && tocContainer) {
      let tocHTML = "";
      let currentSection = "";
      let index = 0;

      // Helper function to process headings (h2 & h3)
      function processHeadings(container) {
        const headings = container.querySelectorAll("h2, h3");
        headings.forEach((heading) => {
          if (!heading.id) {
            heading.id = "heading-" + index++;
          }
          if (heading.tagName === "H2") {
            if (currentSection) {
              tocHTML += "</div>";
            }
            currentSection = `<div class="arabica_toc-section"><a href="#${heading.id}" class="arabica_toc-link">${heading.innerText}</a>`;
            tocHTML += currentSection;
          } else if (heading.tagName === "H3") {
            tocHTML += `<a href="#${heading.id}" class="arabica_toc-link arabica_toc-indent">${heading.innerText}</a>`;
          }
        });
      }

      // Process article and then foot container headings.
      processHeadings(contentContainer);
      if (currentSection) {
        tocHTML += "</div>";
        currentSection = "";
      }
      if (footContainer) {
        processHeadings(footContainer);
        if (currentSection) {
          tocHTML += "</div>";
        }
      }

      tocContainer.innerHTML = tocHTML;

      // Apply smooth scrolling to TOC links.
      const tocLinks = document.querySelectorAll(".arabica_toc-link");
      tocLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          const targetId = this.getAttribute("href").substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            smoothScroll(targetElement);
          }
        });
      });
    }
  }

  // ---------------------------
  // 5. EDN Reference Processing
  // ---------------------------
  function initEDNReferences() {
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
    const paragraphs = article.querySelectorAll("p");
    const ednRefs = {};

    // Step 1: Extract EDN reference texts.
    paragraphs.forEach((p) => {
      const ednAnchor = p.querySelector(
        'a[name^="_edn"]:not([name^="_ednref"])'
      );
      if (ednAnchor) {
        const nameAttr = ednAnchor.getAttribute("name");
        const key = nameAttr.replace("_edn", "");
        let refTextHTML = "";
        let sibling = ednAnchor.nextSibling;
        while (sibling) {
          if (sibling.nodeType === Node.ELEMENT_NODE) {
            refTextHTML += sibling.outerHTML;
          } else if (sibling.nodeType === Node.TEXT_NODE) {
            refTextHTML += sibling.textContent;
          }
          sibling = sibling.nextSibling;
        }
        ednRefs[key] = refTextHTML.trim();
        p.remove();
      }
    });

    // Step 2: Replace EDN reference links.
    const ednRefLinks = article.querySelectorAll('a[name^="_ednref"]');
    ednRefLinks.forEach((link) => {
      const nameAttr = link.getAttribute("name");
      const key = nameAttr.replace("_ednref", "");
      const refText = ednRefs[key] || "";
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

    // Step 3: Attach interactivity for EDN references.
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
          icon
            .querySelector(".arabica_ref-icon-light")
            .classList.add("inactive");
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
          icon
            .querySelector(".arabica_ref-icon-light")
            .classList.add("inactive");
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

    document.addEventListener("click", function () {
      closeAllDropdowns();
    });

    function resetIconStyles(icon) {
      icon.querySelector(".arabica_ref-icon-solid").classList.remove("active");
      icon.querySelector(".arabica_ref-icon-solid").classList.add("inactive");
      icon
        .querySelector(".arabica_ref-icon-light")
        .classList.remove("inactive");
      icon.querySelector(".arabica_ref-icon-light").classList.add("active");
    }

    function closeAllDropdowns() {
      document.querySelectorAll(".arabica_ref-dropdown.open").forEach((d) => {
        d.classList.remove("open");
        const parentIcon = d.previousElementSibling;
        if (parentIcon && parentIcon.classList.contains("arabica_ref-icon")) {
          resetIconStyles(parentIcon);
        }
      });
    }

    function positionDropdown(icon, dropdown) {
      const parent = icon.offsetParent;
      if (!parent) return;
      dropdown.style.top = "";
      dropdown.style.left = "";
      dropdown.classList.remove("arabica_ref-dropdown--above");

      const iconRect = icon.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const dropRect = dropdown.getBoundingClientRect();

      let left =
        iconRect.left -
        parentRect.left +
        iconRect.width / 2 -
        dropRect.width / 2;
      left = Math.max(0, Math.min(left, parentRect.width - dropRect.width));
      dropdown.style.left = left + "px";

      const spaceBelow = window.innerHeight - iconRect.bottom;
      const spaceAbove = iconRect.top;
      let top;
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

      const arrowLeft =
        iconRect.left - parentRect.left + iconRect.width / 2 - left;
      dropdown.style.setProperty("--arrow-left", arrowLeft + "px");
    }
  }

  // ---------------------------
  // 6. Custom Video Player
  // ---------------------------
  function initVideoPlayer() {
    const videoElement = document.querySelector("video");
    if (!videoElement) return;

    // Remove default controls and wrap video if needed.
    videoElement.controls = false;
    videoElement.removeAttribute("controls");
    if (
      !videoElement.parentElement.classList.contains("arabica_video-container")
    ) {
      const container = document.createElement("div");
      container.className = "arabica_video-container";
      videoElement.parentElement.insertBefore(container, videoElement);
      container.appendChild(videoElement);
    }

    // Inject custom controls.
    injectVideoControls();

    // Video player logic.
    const video = videoElement;
    const playPauseBtn = document.getElementById("playPause");
    const restartBtn = document.getElementById("restart");
    const fullscreenBtn = document.getElementById("fullscreen");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const currentTimeEl = document.getElementById("currentTime");
    const durationEl = document.getElementById("duration");
    const rewindIndicator = document.getElementById("rewind");
    const forwardIndicator = document.getElementById("forward");
    const playPauseIndicator = document.getElementById("playPauseIndicator");
    const playBtnIcon = playPauseBtn.querySelector("path");
    const volumeBtn = document.getElementById("volume");

    const playIconPath = "M8 5v14l11-7z";
    const pauseIconPath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

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

    if (video.paused) {
      playPauseIndicator.style.display = "block";
      playPauseIndicator.style.opacity = "1";
      playPauseIndicator.querySelector("path").setAttribute("d", playIconPath);
    }

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
    volumeBtn.addEventListener("click", function toggleMute() {
      video.muted = !video.muted;
      updateVolumeButton();
    });

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
      progressBar.style.width = `${
        (video.currentTime / video.duration) * 100
      }%`;
      currentTimeEl.textContent = formatTime(video.currentTime);
    });

    progressContainer.addEventListener("click", (e) => {
      video.currentTime =
        (e.offsetX / progressContainer.offsetWidth) * video.duration;
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

  // Helper: Inject custom video controls into the container.
  function injectVideoControls() {
    const videoContainer = document.querySelector(".arabica_video-container");
    if (!videoContainer) return;

    // Rewind indicator.
    const rewindIndicator = document.createElement("div");
    rewindIndicator.className = "skip-indicator left-indicator";
    rewindIndicator.id = "rewind";
    rewindIndicator.innerHTML = `<span>10s</span>
      <svg class="arabica_video-icon" fill="none" height="24" viewBox="0 0 24 24" width="24"
        xmlns="http://www.w3.org/2000/svg">
        <path d="m6.46967 10.4697c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0zm1.78033 5.5303c0 .4142.33579.75.75.75s.75-.3358.75-.75zm-5.5-4c0-.4142-.33579-.75-.75-.75s-.75.3358-.75.75zm3.24903-8 .4505.59962zm-1.99903 1.99903.54801.51204.02745-.02939.02416-.03215zm.01269-4.99568c.00185-.414213-.33244-.751495-.74665-.753343s-.75149.332437-.75334.746647zm-.75885 1.98236-.75-.00334zm3.68 3.68.00334.75zm1.98906.74114c.41421-.00185.74849-.33913.74664-.75334s-.33913-.7485-.75334-.74665zm-5.26052-1.50418-.59312.45902zm.3545.3545-.45902.59312zm12.23312 5.74283v2h1.5v-2zm-2.5 2v-2h-1.5v2zm1.25 1.25c-.6904 0-1.25-.5596-1.25-1.25h-1.5c0 1.5188 1.2312 2.75 2.75 2.75zm1.25-1.25c0 .6904-.5596 1.25-1.25 1.25v1.5c1.5188 0 2.75-1.2312 2.75-2.75zm-1.25-3.25c.6904 0 1.25.5596 1.25 1.25h1.5c0-1.5188-1.2312-2.75-2.75-2.75zm0-1.5c-1.5188 0-2.75 1.2312-2.75 2.75h1.5c0-.6904.5596-1.25 1.25-1.25zm-13.75 2.75c0 5.9371 4.81294 10.75 10.75 10.75v-1.5c-5.10863 0-9.25-4.1414-9.25-9.25zm10.75 10.75c5.9371 0 10.75-4.8129 10.75-10.75h-1.5c0 5.1086-4.1414 9.25-9.25 9.25zm10.75-10.75c0-5.93706-4.8129-10.75-10.75-10.75v1.5c5.1086 0 9.25 4.14137 9.25 9.25zm-10.75-10.75c-2.41966 0-4.65456.80032-6.45148 2.15038l.90101 1.19924c1.54606-1.16158 3.46683-1.84962 5.55047-1.84962zm-6.45148 2.15038c-.81333.61107-1.53707 1.33481-2.14814 2.14814l1.19924.90101c.5262-.70037 1.14954-1.32371 1.84991-1.84991zm-3.03582-2.403726-.00886 1.985716 1.49999.00669.00886-1.98571zm4.42448 6.419056 1.98572-.00886-.0067-1.49999-1.98571.00886zm-4.43334-4.43334c-.00345.77414-.00746 1.41813.04887 1.93398.05798.53093.18758 1.02026.51655 1.44534l1.18625-.91804c-.09017-.11652-.16839-.29389-.21166-.69014-.04492-.41134-.04363-.95503-.04002-1.76445zm4.42665 2.93335c-.80942.00361-1.3531.0049-1.76445-.04002-.39625-.04327-.57362-.12149-.69014-.21166l-.91804 1.18625c.42508.32897.91441.45857 1.44534.51655.51585.05633 1.15984.05232 1.93398.04887zm.53918 3.55395-1 1.00003 1.06066 1.0606 1-1zm.78033 2.53033v4h1.5v-4zm0-1.5858v.0858h1.5v-.0858zm0 .0858v1.5h1.5v-1.5zm-5.18074-4.13831c.08838.1142.18558.2211.29066.31976l1.02669-1.09358c-.04739-.04449-.09123-.0927-.1311-.14422zm.29066.31976c.0632.05933.12925.11569.19794.16884l.91804-1.18625c-.03099-.02399-.06078-.0494-.08929-.07616zm.09207-1.19447-.12673.13563 1.09601 1.0241.12674-.13564zm5.07834 5.04332c-.0184.0184-.0508.0375-.09038.0443-.03548.0062-.06566.0008-.08858-.0087s-.04806-.027-.0688-.0564c-.02313-.0329-.03257-.0693-.03257-.0953h1.5c0-1.19004-1.43883-1.78603-2.28033-.94453z" fill="#ffffff"/>
      </svg>`;
    rewindIndicator && videoContainer.appendChild(rewindIndicator);

    // Forward indicator.
    const forwardIndicator = document.createElement("div");
    forwardIndicator.className = "skip-indicator right-indicator";
    forwardIndicator.id = "forward";
    forwardIndicator.innerHTML = `<svg class="arabica_video-icon" fill="none" height="24" viewBox="0 0 24 24" width="24"
        xmlns="http://www.w3.org/2000/svg">
        <g fill="#ffffff">
          <path d="m21.4873.996654c-.0019-.414209-.3391-.748494-.7533-.746646-.4143.001848-.7485.339129-.7467.753342l.0089 1.98571c.0036.80942.0049 1.35311-.04 1.76445l-.0017.01526c-.4565-.50181-.9598-.96023-1.503-1.36839-1.7969-1.35006-4.0318-2.15038-6.4515-2.15038-5.93706 0-10.75 4.81294-10.75 10.75 0 5.9371 4.81294 10.75 10.75 10.75 5.9371 0 10.75-4.8129 10.75-10.75 0-.4142-.3358-.75-.75-.75s-.75.3358-.75.75c0 5.1086-4.1414 9.25-9.25 9.25-5.10863 0-9.25-4.1414-9.25-9.25 0-5.10863 4.14137-9.25 9.25-9.25 2.0836 0 4.0044.68804 5.5505 1.84962.4989.37489.9588.79909 1.3723 1.26532-.0283.00379-.0579.00738-.0888.01076-.4114.04492-.9551.04363-1.7645.04002l-1.9857-.00886c-.4142-.00185-.7515.33244-.7533.74665-.0019.41421.3324.75149.7466.75334l2.029.00905c.7549.00339 1.3845.00621 1.8907-.04906.5309-.05798 1.0203-.18758 1.4453-.51655.0678-.05245.133-.10802.1955-.1665.106-.0993.2041-.20699.2931-.3221.329-.42508.4586-.91441.5166-1.44534.0553-.50618.0524-1.13575.0491-1.89062z"/>
          <path d="m9.75 10.4142c0-1.19004-1.43883-1.78603-2.28033-.94453l-1 1.00003c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0l.71967-.7196v5.1893c0 .4142.33579.75.75.75s.75-.3358.75-.75z"/>
          <path clip-rule="evenodd" d="m15 9.25c-1.5188 0-2.75 1.2312-2.75 2.75v2c0 1.5188 1.2312 2.75 2.75 2.75s2.75-1.2312 2.75-2.75v-2c0-1.5188-1.2312-2.75-2.75-2.75zm-1.25 2.75c0-.6904.5596-1.25 1.25-1.25s1.25.5596 1.25 1.25v2c0 .6904-.5596 1.25-1.25 1.25s-1.25-.5596-1.25-1.25z" fill-rule="evenodd"/>
        </g>
      </svg>
      <span>10s</span>`;
    forwardIndicator && videoContainer.appendChild(forwardIndicator);

    // Play/Pause overlay indicator.
    const playPauseIndicator = document.createElement("div");
    playPauseIndicator.className = "play-pause-indicator";
    playPauseIndicator.id = "playPauseIndicator";
    playPauseIndicator.innerHTML = `<svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>`;
    videoContainer.appendChild(playPauseIndicator);

    // Controls container.
    const controls = document.createElement("div");
    controls.className = "arabica_video-controls";

    // Play/Pause button.
    const playPauseBtn = document.createElement("button");
    playPauseBtn.className = "play-btn";
    playPauseBtn.id = "playPause";
    playPauseBtn.innerHTML = `<svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>`;
    controls.appendChild(playPauseBtn);

    // Restart button.
    const restartBtn = document.createElement("button");
    restartBtn.className = "restart-btn";
    restartBtn.id = "restart";
    restartBtn.innerHTML = `<svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>`;
    controls.appendChild(restartBtn);

    // Current time display.
    const currentTime = document.createElement("span");
    currentTime.className = "arabica_video-time";
    currentTime.innerHTML = `<span id="currentTime">0:00</span>`;
    controls.appendChild(currentTime);

    // Progress bar container.
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.id = "progressContainer";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.id = "progressBar";
    progressContainer.appendChild(progressBar);
    controls.appendChild(progressContainer);

    // Duration display.
    const duration = document.createElement("span");
    duration.className = "arabica_video-time";
    duration.innerHTML = `<span id="duration">0:00</span>`;
    controls.appendChild(duration);

    // Volume button.
    const volumeBtn = document.createElement("button");
    volumeBtn.className = "volume-btn";
    volumeBtn.id = "volume";
    volumeBtn.innerHTML = `<svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        <line class="slash" x1="22" y1="2" x2="2" y2="22" />
      </svg>`;
    controls.appendChild(volumeBtn);

    // Fullscreen button.
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.className = "fullscreen-btn";
    fullscreenBtn.id = "fullscreen";
    fullscreenBtn.innerHTML = `<svg class="arabica_video-icon" viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>`;
    controls.appendChild(fullscreenBtn);

    videoContainer.appendChild(controls);
  }

  // ---------------------------
  // 7. Lightbox and Gallery Slider
  // ---------------------------
  function initLightboxAndGallery() {
    // Global Lightbox Setup
    const lightbox = document.createElement("div");
    lightbox.classList.add("arabica_article_lightbox");

    const lightboxContent = document.createElement("div");
    lightboxContent.classList.add("arabica_article_lightbox-content");

    const closeBtn = document.createElement("span");
    closeBtn.classList.add("arabica_article_close-btn");
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#ffffff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>`;
    const lightboxImg = document.createElement("img");
    lightboxImg.id = "lightbox-img";

    const lightboxCaption = document.createElement("div");
    lightboxCaption.classList.add("arabica_article_lightbox-caption");
    lightboxCaption.id = "lightbox-caption";

    const galleryGrid = document.createElement("div");
    galleryGrid.classList.add("arabica_article_lightbox-gallery-grid");
    galleryGrid.style.display = "none";

    lightbox.appendChild(closeBtn);
    lightboxContent.appendChild(lightboxImg);
    lightboxContent.appendChild(lightboxCaption);
    lightbox.appendChild(galleryGrid);
    lightbox.appendChild(lightboxContent);
    document.body.appendChild(lightbox);

    let currentGallery = [];
    let currentIndex = 0;
    let lbTouchStartX = 0;
    let lbTouchEndX = 0;

    function openLightbox(imgSrc, imgAlt, caption, gallery = []) {
      lightboxImg.setAttribute("src", imgSrc);
      lightboxImg.setAttribute("alt", imgAlt);
      lightboxCaption.textContent = caption;
      lightbox.classList.add("active");
      document.body.classList.add("no-scroll");

      if (gallery.length > 1) {
        currentGallery = gallery;
        currentIndex = gallery.findIndex((item) => item.src === imgSrc);
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
        .map(
          (item, index) =>
            `<img src="${item.src}" alt="${
              item.alt
            }" data-index="${index}" class="${
              index === currentIndex ? "active" : ""
            }">`
        )
        .join("");
      const activeImg = galleryGrid.querySelector(
        `[data-index="${currentIndex}"]`
      );
      if (activeImg) {
        activeImg.classList.add("active");
      }
    }

    function updateLightboxContent() {
      const { src, alt, caption } = currentGallery[currentIndex];
      lightboxImg.style.opacity = 0;
      setTimeout(() => {
        lightboxImg.setAttribute("src", src);
        lightboxImg.setAttribute("alt", alt);
        lightboxCaption.textContent = caption;
        updateGalleryGrid(currentGallery);
        lightboxImg.style.opacity = 1;
      }, 150);
    }

    function showNextImage() {
      if (currentGallery.length > 0) {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateLightboxContent();
      }
    }

    function showPrevImage() {
      if (currentGallery.length > 0) {
        currentIndex =
          (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateLightboxContent();
      }
    }

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        showNextImage();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        showPrevImage();
      }
    });
    let lastWheelTime = 0;
    lightbox.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTime < 400) return;
        lastWheelTime = now;
        e.deltaY > 0 ? showNextImage() : showPrevImage();
      },
      { passive: false }
    );
    galleryGrid.addEventListener("click", (e) => {
      if (e.target.tagName === "IMG") {
        currentIndex = parseInt(e.target.getAttribute("data-index"), 10);
        updateLightboxContent();
      }
    });
    lightboxImg.addEventListener("touchstart", (e) => {
      lbTouchStartX = e.touches[0].clientX;
    });
    lightboxImg.addEventListener("touchmove", (e) => {
      lbTouchEndX = e.touches[0].clientX;
    });
    lightboxImg.addEventListener("touchend", () => {
      if (lbTouchStartX - lbTouchEndX > 50) {
        showNextImage();
      } else if (lbTouchEndX - lbTouchStartX > 50) {
        showPrevImage();
      }
    });

    // Gallery Slider Setup for image containers.
    document.querySelectorAll(".arabica_article-image").forEach((container) => {
      const galleryItems = container.querySelectorAll(
        ".arabica_article-image-gallery"
      );
      if (galleryItems.length > 0) {
        const slider = document.createElement("div");
        slider.className = "arabica_article_slider";
        const sliderWrapper = document.createElement("div");
        sliderWrapper.className = "arabica_article_slider_wrapper";

        galleryItems.forEach((item) => {
          sliderWrapper.appendChild(item);
        });
        slider.appendChild(sliderWrapper);

        const prevSliderBtn = document.createElement("button");
        prevSliderBtn.className =
          "arabica_article_slider-nav arabica_article_slider-prev";
        prevSliderBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="#ffffff" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        `;
        const nextSliderBtn = document.createElement("button");
        nextSliderBtn.className =
          "arabica_article_slider-nav arabica_article_slider-next";
        nextSliderBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="#ffffff" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
        `;
        slider.appendChild(prevSliderBtn);
        slider.appendChild(nextSliderBtn);

        container.innerHTML = "";
        container.appendChild(slider);

        let currentSlide = 0;
        let sliderWidth = slider.offsetWidth;
        let startX = 0;
        let isDragging = false;

        const setSliderPosition = () => {
          sliderWrapper.style.transform = `translateX(-${
            currentSlide * sliderWidth
          }px)`;
        };

        const updateSliderHeight = () => {
          const currentSlideElement = sliderWrapper.children[currentSlide];
          if (currentSlideElement) {
            slider.style.height = currentSlideElement.offsetHeight + "px";
          }
        };

        const updateNavButtonsPosition = () => {
          const currentSlideElement = sliderWrapper.children[currentSlide];
          if (currentSlideElement) {
            const imgEl = currentSlideElement.querySelector("img");
            if (imgEl) {
              const imageRect = imgEl.getBoundingClientRect();
              const sliderRect = slider.getBoundingClientRect();
              const navCenter =
                imageRect.top - sliderRect.top + imageRect.height / 2;
              prevSliderBtn.style.top = navCenter + "px";
              nextSliderBtn.style.top = navCenter + "px";
            }
          }
        };

        const updateSliderLayout = () => {
          sliderWidth = slider.offsetWidth;
          setSliderPosition();
          updateSliderHeight();
          updateNavButtonsPosition();
        };

        slider.style.height = sliderWrapper.children[0].offsetHeight + "px";
        updateSliderLayout();
        window.addEventListener("resize", updateSliderLayout);

        const nextSlide = () => {
          currentSlide = (currentSlide + 1) % galleryItems.length;
          sliderWrapper.style.transition = "transform 0.3s ease-in-out";
          setSliderPosition();
          updateSliderLayout();
        };

        const prevSlide = () => {
          currentSlide =
            (currentSlide - 1 + galleryItems.length) % galleryItems.length;
          sliderWrapper.style.transition = "transform 0.3s ease-in-out";
          setSliderPosition();
          updateSliderLayout();
        };

        nextSliderBtn.addEventListener("click", nextSlide);
        prevSliderBtn.addEventListener("click", prevSlide);

        sliderWrapper.addEventListener("touchstart", (event) => {
          isDragging = true;
          startX = event.touches[0].clientX;
          sliderWrapper.style.transition = "none";
        });
        sliderWrapper.addEventListener("touchmove", (event) => {
          if (!isDragging) return;
          const currentX = event.touches[0].clientX;
          const deltaX = currentX - startX;
          sliderWrapper.style.transform = `translateX(-${
            currentSlide * sliderWidth - deltaX
          }px)`;
        });
        sliderWrapper.addEventListener("touchend", (event) => {
          if (!isDragging) return;
          isDragging = false;
          const endX = event.changedTouches[0].clientX;
          const deltaX = endX - startX;
          if (deltaX < -50) {
            nextSlide();
          } else if (deltaX > 50) {
            prevSlide();
          } else {
            setSliderPosition();
          }
          sliderWrapper.style.transition = "transform 0.3s ease-in-out";
        });

        // Single image lightbox for anchors not in slider.
        sliderWrapper.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(href)) {
              e.preventDefault();
              const img = link.querySelector("img");
              const captionElem = link.nextElementSibling;
              const caption =
                captionElem &&
                captionElem.tagName.toLowerCase() === "figcaption"
                  ? captionElem.textContent
                  : "";
              const gallery = Array.from(container.querySelectorAll("a")).map(
                (a) => {
                  const aCaptionElem = a.nextElementSibling;
                  return {
                    src: a.getAttribute("href"),
                    alt: a.querySelector("img").getAttribute("alt"),
                    caption:
                      aCaptionElem &&
                      aCaptionElem.tagName.toLowerCase() === "figcaption"
                        ? aCaptionElem.textContent
                        : "",
                  };
                }
              );
              openLightbox(href, img.getAttribute("alt"), caption, gallery);
            }
          });
        });
      }
    });

    // Single image lightbox for standalone anchors.
    document
      .querySelectorAll(
        ".arabica_article-content a, .arabica_article-image a, .arabica_news-content a, .arabica_news-image a"
      )
      .forEach((anchor) => {
        if (
          /\.(jpg|jpeg|png|gif|webp)$/i.test(anchor.getAttribute("href")) &&
          !anchor.closest(".arabica_article-image-gallery")
        ) {
          anchor.addEventListener("click", (e) => {
            e.preventDefault();
            const href = anchor.getAttribute("href");
            const img = anchor.querySelector("img");
            const alt = img ? img.getAttribute("alt") : "";
            const captionElem = anchor.nextElementSibling;
            const caption =
              captionElem && captionElem.tagName.toLowerCase() === "figcaption"
                ? captionElem.textContent
                : "";
            openLightbox(href, alt, caption, []);
          });
        }
      });
  }

  // ---------------------------
  // 8. Side Content Open/Close and Toggle Button Visibility
  // ---------------------------
  function initSideContent() {
    const toggleBtn = document.querySelector(".arabica_floating-btn");
    const sideContent = document.querySelector(".arabica_side-content");
    const closeBtn = document.querySelector(".arabica_close-button");
    const overlay = document.querySelector(".arabica_overlay");
    const footerWrapper = document.querySelector(".arabica_footer");

    function openSideContent() {
      sideContent.classList.add("arabica_show-content");
      overlay.classList.add("arabica_show-overlay");
      document.body.classList.add("no-scroll");
    }

    function closeSideContent() {
      sideContent.classList.remove("arabica_show-content");
      overlay.classList.remove("arabica_show-overlay");
      document.body.classList.remove("no-scroll");
    }

    toggleBtn && toggleBtn.addEventListener("click", openSideContent);
    closeBtn && closeBtn.addEventListener("click", closeSideContent);
    overlay && overlay.addEventListener("click", closeSideContent);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSideContent();
    });
    sideContent &&
      sideContent.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          closeSideContent();
        }
      });

    function checkToggleBtnVisibility() {
      if (!footerWrapper) return;
      const footerRect = footerWrapper.getBoundingClientRect();
      if (footerRect.top < window.innerHeight) {
        toggleBtn && toggleBtn.classList.add("hidden");
      } else {
        toggleBtn && toggleBtn.classList.remove("hidden");
      }
    }

    window.addEventListener("scroll", checkToggleBtnVisibility);
    window.addEventListener("resize", checkToggleBtnVisibility);
    checkToggleBtnVisibility();
  }

  // ---------------------------
  // Optional: smoothScroll helper function.
  // ---------------------------
  function smoothScroll(target) {
    const offset = 20;
    const targetPosition =
      target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: targetPosition, behavior: "smooth" });
  }
})();
