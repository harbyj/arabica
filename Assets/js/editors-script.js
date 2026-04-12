/* jshint esversion: 11 */
$(function() {
  // Cache modal and close button
  var $modal = $("#editorModal");
  var $closeModalBtn = $(".modal-close");

  // Cache editor elements
  var $editorName   = $("#editorName");
  var $editorRegion = $("#editorRegion");
  var $editorTitle  = $("#editorTitle");
  var $editorField  = $("#editorField");
  var $editorBio    = $("#editorBio");
  var $editorImage  = $("#editorImage");
  var $editorEmail  = $("#editorEmail");
  var $separator    = $(".modal-separator");

  // Helper to hide or show element based on its text
  function hideIfEmpty($el, displayType) {
    if (!$el.length || $.trim($el.text()) === "") {
      $el.hide();
    } else {
      $el.css("display", displayType);
    }
  }

  // Toggle separator based on field and title
  function updateSeparator() {
    var hasField = $.trim($editorField.text()) !== "";
    var hasTitle = $.trim($editorTitle.text()) !== "";
    if (hasField && hasTitle) {
      $separator.css("display", "inline");
    } else {
      $separator.hide();
    }
  }

  // Click handler for editor name link
  $(".arabica_editor-link").on("click", function(e) {
    e.preventDefault();
    var $link = $(this);
    var $info = $link.closest(".arabica_editor-info");

    // Update a text element from a selector within the info
    function updateContent($el, selector, displayType) {
      var $target = $info.find(selector);
      if ($target.length && $.trim($target.text()) !== "") {
        $el.text($.trim($target.text())).css("display", displayType);
      } else {
        $el.text("").hide();
      }
    }

    // Name (from the clicked link itself)
    var name = $.trim($link.find(".arabica_editor-name").text());
    if (name) {
      $editorName.text(name).css("display", "block");
    } else {
      $editorName.text("").hide();
    }

    // Region (if exists)
    updateContent($editorRegion, ".arabica_editor-region", "inline-block");

    // Title (job)
    updateContent($editorTitle, ".arabica_editor-job", "inline-block");

    // Field (category) - preserve link (query param already added on page load)
    var $categorySrc = $info.find(".arabica_editor-category");
    if ($categorySrc.length && $.trim($categorySrc.text()) !== "") {
      var categoryHref = $categorySrc.attr("href") || "#";
      var categoryText = $.trim($categorySrc.text());
      $editorField
        .attr("href", categoryHref)
        .text(categoryText)
        .css("display", "inline-block");
    } else {
      $editorField.attr("href", "#").text("").hide();
    }

    // Bio (HTML)
    var $bioSrc = $info.find(".arabica_editor-bio");
    if ($bioSrc.length && $.trim($bioSrc.text()) !== "") {
      $editorBio.html($bioSrc.html()).css("display", "inline-block");
    } else {
      $editorBio.empty().hide();
    }

    // Image (if exists)
    var $imgSrc = $info.find(".arabica_editor-image");
    if ($imgSrc.length) {
      $editorImage.attr("src", "");
      setTimeout(function() {
        $editorImage
          .attr("src", $imgSrc.attr("src"))
          .attr("alt", name || $imgSrc.attr("alt"))
          .css("display", "inline-block");
      }, 1);
    } else {
      $editorImage.hide();
    }

    // Email - extract from link and show only icon
    var $emailSrc = $info.find(".arabica_editor-email-link");
    if ($emailSrc.length) {
      var emailHref = $emailSrc.attr("href");
      if (emailHref && emailHref.indexOf("mailto:") === 0) {
        $editorEmail
          .attr("href", emailHref)
          .html('<i class="fa-regular fa-envelope"></i>')
          .css({ display: "inline-flex", alignItems: "center" });
      } else {
        $editorEmail.attr("href", "#").empty().hide();
      }
    } else {
      $editorEmail.attr("href", "#").empty().hide();
    }

    // Hide any other empty elements
    hideIfEmpty($editorName,   "block");
    hideIfEmpty($editorRegion, "inline-block");
    hideIfEmpty($editorTitle,  "inline-block");
    hideIfEmpty($editorField,  "inline-block");
    hideIfEmpty($editorBio,    "inline-block");
    hideIfEmpty($editorImage,  "inline-block");

    // Update separator
    updateSeparator();

    // Show modal and disable body scroll
    $("body").addClass("no-scroll");
    $modal.fadeIn(200).addClass("show");
  });

  // Close modal function
  function closeModal() {
    $modal.removeClass("show");
    $modal.fadeOut(200, function() {
      $("body").removeClass('no-scroll');
    });
  }

  // Close handlers
  $closeModalBtn.on("click", closeModal);
  $(window).on("click", function(e) {
    if ($(e.target).is($modal)) {
      closeModal();
    }
  });
  $(window).on("keydown", function(e) {
    if (e.key === "Escape" && $modal.hasClass("show")) {
      closeModal();
    }
  });

  // Add query parameter to category links on page load
  $(".arabica_editor-category").each(function() {
    var $category = $(this);
    var categoryText = $.trim($category.text());
    if (categoryText) {
      var categoryHref = $category.attr("href") || "#";
      var separator = categoryHref.indexOf("?") !== -1 ? "&" : "?";
      var categoryUrl = categoryHref + separator + "c=" + encodeURIComponent(categoryText);
      $category.attr("href", categoryUrl);
    }
  });

  // Initial separator insert between job and category on page load (if needed)
  $(".arabica_editor-title").each(function() {
    var $titleDiv = $(this);
    var $job = $titleDiv.find(".arabica_editor-job");
    var $category = $titleDiv.find(".arabica_editor-category");
    
    // Only add separator if it doesn't exist and both elements have content
    if ($job.length && 
        $category.length && 
        $.trim($job.text()) && 
        $.trim($category.text()) && 
        !$titleDiv.find(".editor-separator").length) {
      $("<span>")
        .addClass("editor-separator")
        .text("|")
        .insertAfter($job);
    }
  });
});