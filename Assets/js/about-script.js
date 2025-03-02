 /* jshint esversion: 6 */
      function updateLineHeight() {
        const container = document.querySelector(".arabica_timeline-container");
        // Select the last timeline item's content element.
        const lastContent = container.querySelector(
          ".arabica_timeline-items .arabica_timeline-item:last-of-type .arabica_timeline-content"
        );
        const containerRect = container.getBoundingClientRect();
        const lastRect = lastContent.getBoundingClientRect();

        const viewportWidth = window.innerWidth;
        let targetBottom;
        let startOffset;

        if (viewportWidth <= 767) {
          // Mobile view: height ends at 36px of the last content; line starts at 60px.
          targetBottom = lastRect.top - containerRect.top + 36;
          startOffset = 60;
        } else if (viewportWidth <= 991) {
          // Tablet view: height ends at 42px of the last content; line starts at 70px.
          targetBottom = lastRect.top - containerRect.top + 42;
          startOffset = 70;
        } else {
          // Desktop view (min-width 992px): default behavior.
          targetBottom = lastRect.top - containerRect.top + lastRect.height / 2;
          startOffset = 125;
        }

        const newHeight = targetBottom - startOffset;
        container.style.setProperty("--line-height", newHeight + "px");
      }

      window.addEventListener("load", updateLineHeight);
      window.addEventListener("resize", updateLineHeight);