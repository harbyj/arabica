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

  // Click handler for each editor link
  $(".arabica_editor-link").on("click", function(e) {
    e.preventDefault();
    var $link = $(this);
    var $info = $link.find(".arabica_editor-info");

    // Update a text element from a selector within the info
    function updateContent($el, selector, displayType) {
      var $target = $info.find(selector);
      if ($target.length && $.trim($target.text()) !== "") {
        $el.text($.trim($target.text())).css("display", displayType);
      } else {
        $el.text("").hide();
      }
    }

    // Name, region, title, field
    updateContent($editorName,   ".arabica_editor-name",     "block");
    updateContent($editorRegion, ".arabica_editor-region",   "inline-block");
    updateContent($editorTitle,  ".arabica_editor-job",      "inline-block");
    updateContent($editorField,  ".arabica_editor-category", "inline-block");

    // Bio (HTML)
    var $bioSrc = $info.find(".arabica_editor-bio");
    if ($bioSrc.length && $.trim($bioSrc.text()) !== "") {
      $editorBio.html($bioSrc.html()).css("display", "inline-block");
    } else {
      $editorBio.empty().hide();
    }

    // Image
    var $imgSrc = $link.find(".arabica_editor-image");
    if ($imgSrc.length) {
      $editorImage.attr("src", "");
      setTimeout(function() {
        $editorImage
          .attr("src", $imgSrc.attr("src"))
          .attr("alt", $editorName.text() || $imgSrc.attr("alt"))
          .css("display", "inline-block");
      }, 1);
    } else {
      $editorImage.hide();
    }

    // Email
    var $emailSrc = $info.find(".arabica_editor-email");
    if ($emailSrc.length && $.trim($emailSrc.text()) !== "") {
      var email = $.trim($emailSrc.text());
      $editorEmail
        .attr("href", "mailto:" + email)
        .html(email + ' <i class="fa-solid fa-envelope"></i>')
        .css({ display: "inline-flex", alignItems: "center", gap: "10px" });
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
    hideIfEmpty($editorEmail,  "inline-flex");

    // Update separator
    updateSeparator();

    // Show modal and disable body scroll
    $("body").addClass("no-scroll");
    $modal.addClass("show");
  });

  // Close modal function
  function closeModal() {
    $modal.removeClass("show");
    $("body").removeClass("no-scroll");
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

  // Initial separator insert between category and job on page load
  $(".arabica_editor-category").each(function() {
    var $field = $(this);
    var $title = $field.next();
    if ($title.hasClass("arabica_editor-job") && $.trim($field.text()) && $.trim($title.text())) {
      $("<span>")
        .addClass("editor-separator")
        .text("|")
        .insertAfter($field);
    }
  });
});
