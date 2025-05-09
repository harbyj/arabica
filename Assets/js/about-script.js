$(function() {
  function updateLineHeight() {
    var $container = $(".arabica_timeline-container");
    // grab the last item's content
    var $lastContent = $container
      .find(".arabica_timeline-items .arabica_timeline-item:last-of-type .arabica_timeline-content");

    var containerRect = $container[0].getBoundingClientRect();
    var lastRect = $lastContent[0].getBoundingClientRect();
    var viewportWidth = $(window).width();
    var targetBottom, startOffset;

    if (viewportWidth <= 767) {
      // Mobile view
      targetBottom = lastRect.top - containerRect.top + 36;
      startOffset = 60;
    } else if (viewportWidth <= 991) {
      // Tablet view
      targetBottom = lastRect.top - containerRect.top + 42;
      startOffset = 70;
    } else {
      // Desktop view
      targetBottom = lastRect.top - containerRect.top + (lastRect.height / 2);
      startOffset = 125;
    }

    var newHeight = targetBottom - startOffset;
    // set the CSS custom property
    $container.css("--line-height", newHeight + "px");
  }

  // Run on load and resize
  $(window).on("load resize", updateLineHeight);
});
