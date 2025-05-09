$(document).ready(function () {
  // helper functions at top‐level of this outer function
  var smoothScroll = function ($el) {
    $("html, body").animate({ scrollTop: $el.offset().top }, "smooth");
  };

  var escapeAttr = function (text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  var getCleanHTML = function ($el) {
    var $temp = $el.clone();
    $temp.find('a[name^="_edn"]').remove();
    $temp.find("li").each(function () {
      var $li = $(this);
      var liDir = /[\u0600-\u06FF]/.test($li.text()) ? "rtl" : "ltr";
      $li.attr("dir", liDir);
    });
    var dir = /[\u0600-\u06FF]/.test($temp.text()) ? "rtl" : "ltr";
    $temp.attr("dir", dir);
    return $temp.prop("outerHTML");
  };

  var processHeadings, updateActiveTOC;
  var resetIconStyles, closeAllDropdowns, positionDropdown;

  // Move paragraphs with footnotes (excluding those with "ref")
  var $articleContent = $(".arabica_article-content");
  var $footnoteContainer = $(".arabica_foot-reference");
  if ($articleContent.length && $footnoteContainer.length) {
    var hasFootnotes = false;
    var $footnoteParagraphs = $articleContent.find('p:has(a[name^="_ftn"]:not([name*="ref"]))');

    $footnoteParagraphs.each(function () {
      hasFootnotes = true;
      var elementsToMove = [$(this)];
      var $next = $(this).next();
      while ($next.length && ["P", "UL", "OL"].indexOf($next.prop("tagName")) !== -1) {
        if ($next.is("p") && $next.find('a[name^="_edn"]').length) break;
        elementsToMove.push($next);
        $next = $next.next();
      }
      for (var i = 0; i < elementsToMove.length; i++) {
        $footnoteContainer.append(elementsToMove[i]);
      }
    });

    if (!hasFootnotes) {
      $footnoteContainer.remove();
      $("<style>")
        .text(
          ".arabica_article-sources {" +
            "border-top: 0 !important;" +
            "margin-top: 0 !important;" +
            "padding-top: 0 !important;" +
          "}"
        )
        .appendTo("head");
    }
  }

  // Set direction for foot reference and source elements
  $(
    ".arabica_foot-reference p, .arabica_foot-source li, .arabica_foot-reference li, .arabica_foot-source p"
  ).each(function () {
    if (!/[\u0600-\u06FF]/.test($(this).text())) {
      $(this).attr("dir", "ltr");
    }
  });

  // Move reference sections
  var referenceTitles = [
    "Reference",
    "Sources",
    "Citations",
    "Bibliography",
    "المراجع",
    "المراج​​ع",
    "المصادر",
    "الاستشهادات",
    "قائمةالمراجع",
    "المرجعية",
    "المصادر والمراجع",
  ];
  var $headings = $(".arabica_article-content h2");
  var referenceFound = false;

  $headings.each(function () {
    var normalizedText = $(this)
      .text()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
    for (var j = 0; j < referenceTitles.length; j++) {
      var key = referenceTitles[j].toLowerCase().replace(/\s+/g, "");
      if (normalizedText.indexOf(key) !== -1) {
        referenceFound = true;
        var elementsToMove = [$(this)];
        var $nextElem = $(this).next();
        while ($nextElem.length) {
          var isStop = $nextElem.is("p") && $nextElem.find('a[name*="ftn"], a[name*="edn"]').length;
          if (isStop) break;
          elementsToMove.push($nextElem);
          $nextElem = $nextElem.next();
        }
        var $target = $(".arabica_article-sources");
        if ($target.length) {
          for (var k = 0; k < elementsToMove.length; k++) {
            $target.append(elementsToMove[k]);
          }
        }
        break;
      }
    }
  });

  if (!referenceFound) {
    var $footSource = $(".arabica_foot-source");
    if ($footSource.length) $footSource.remove();
  }

  // Table of Contents generation (no declaration in block)
  var $contentContainer = $(".arabica_article-content");
  var $tocContainer = $(".arabica_article-table-content");
  var $footContainer = $(".arabica_foot-container");

  if ($contentContainer.length && $tocContainer.length) {
    var tocHTML = "";
    var currentSection = "";
    var idx = 0;

    processHeadings = function ($container) {
      var $h = $container.find("h2, h3");
      $h.each(function () {
        var $hd = $(this);
        if (!$hd.attr("id")) $hd.attr("id", "heading-" + idx++);
        if ($hd.is("h2")) {
          if (currentSection) tocHTML += "</div>";
          currentSection =
            '<div class="arabica_toc-section">' +
              '<a href="#' + $hd.attr("id") + '" class="arabica_toc-link">' +
                $hd.text() +
              "</a>";
          tocHTML += currentSection;
        } else {
          tocHTML +=
            '<a href="#' + $hd.attr("id") +
            '" class="arabica_toc-link arabica_toc-indent">' +
              $hd.text() +
            "</a>";
        }
      });
    };

    updateActiveTOC = function () {
      var currentId = "";
      var threshold = 100;
      $(
        ".arabica_article-content h2, .arabica_article-content h3, .arabica_foot-container h2, .arabica_foot-container h3"
      ).each(function () {
        var $hd = $(this);
        if ($hd.offset().top - $(window).scrollTop() <= threshold) {
          currentId = $hd.attr("id");
        }
      });
      $tocContainer.find(".arabica_toc-link").each(function () {
        var $ln = $(this);
        var tgt = $ln.attr("href").substring(1);
        $ln.toggleClass("active", tgt === currentId);
      });
    };

    processHeadings($contentContainer);
    if (currentSection) tocHTML += "</div>";
    if ($footContainer.length) {
      processHeadings($footContainer);
      if (currentSection) tocHTML += "</div>";
    }

    $tocContainer.html(tocHTML);
    $tocContainer.find(".arabica_toc-link").on("click", function (e) {
      e.preventDefault();
      var tgt = $(this).attr("href").substring(1);
      var $el = $("#" + tgt);
      if ($el.length) smoothScroll($el);
    });
    $(window).on("scroll", updateActiveTOC);
    updateActiveTOC();
  }

  // Endnote extraction & dropdowns
  var $article = $(".arabica_article-content");
  if ($article.length) {
    var ednRefs = {};
    var $ends = $article.find('p:has(a[name^="_edn"]:not([name^="_ednref"]))');

    $ends.each(function () {
      var $p = $(this);
      var name = $p.find('a[name^="_edn"]:not([name^="_ednref"])').attr("name");
      var key = name.replace("_edn", "");
      var txt = getCleanHTML($p);
      var $n = $p.next();
      while ($n.length && ["P", "UL", "OL"].indexOf($n.prop("tagName")) !== -1) {
        if ($n.is("p") && $n.find('a[name^="_edn"]:not([name^="_ednref"])').length) break;
        txt += getCleanHTML($n);
        $n = $n.next();
      }
      ednRefs[key] = txt.trim();

      var toRm = [$p];
      $n = $p.next();
      while ($n.length && ["P", "UL", "OL"].indexOf($n.prop("tagName")) !== -1) {
        if ($n.is("p") && $n.find('a[name^="_edn"]:not([name^="_ednref"])').length) break;
        toRm.push($n);
        $n = $n.next();
      }
      for (var x = 0; x < toRm.length; x++) toRm[x].remove();
    });

    $article.find('a[name^="_ednref"]').each(function () {
      var $lnk = $(this);
      var key = $lnk.attr("name").replace("_ednref", "");
      var refText = ednRefs[key] || "";
      var dir = /[\u0600-\u06FF]/.test(refText) ? "rtl" : "ltr";
      var ddId = "arabica_ref-dropdown-" + Math.random().toString(36).slice(2,9);
      var html =
        '<a class="arabica_ref-icon" data-ref-id="' + ddId + '" data-reference="' + escapeAttr(refText) + '">' +
          '<i class="fa-light fa-circle-info arabica_ref-icon-light active"></i>' +
          '<i class="fa-solid fa-circle-info arabica_ref-icon-solid inactive"></i>' +
        "</a>" +
        '<div id="' + ddId + '" class="arabica_ref-dropdown">' +
          '<div class="arabica_ref-actions">' +
            '<span class="arabica_ref-copy-icon" title="Copy"><i class="fa-regular fa-copy"></i></span>' +
            '<span class="arabica_ref-copied-text">✓ تم النسخ</span>' +
            '<span class="arabica_ref-close-icon" title="Close"><i class="fa-regular fa-circle-xmark"></i></span>' +
          "</div>" +
          '<div class="arabica_ref-text" dir="' + dir + '"><span dir="' + dir + '">' + refText + "</span></div>" +
        "</div>";
      $lnk.replaceWith(html);
    });

    // these helpers inside this block are now expressions
    resetIconStyles = function ($icon) {
      $icon.find(".arabica_ref-icon-solid").removeClass("active").addClass("inactive");
      $icon.find(".arabica_ref-icon-light").removeClass("inactive").addClass("active");
    };

    closeAllDropdowns = function () {
      $(".arabica_ref-dropdown.open").each(function () {
        var $d = $(this);
        $d.removeClass("open");
        var $pi = $d.prev();
        if ($pi.hasClass("arabica_ref-icon")) resetIconStyles($pi);
      });
    };

    positionDropdown = function ($icon, $dropdown) {
      var $parent = $icon.offsetParent();
      if (!$parent.length) return;
      $dropdown.css({ top: "", left: "" }).removeClass("arabica_ref-dropdown--above");
      var iconR = $icon[0].getBoundingClientRect();
      var parR = $parent[0].getBoundingClientRect();
      var dropR = $dropdown[0].getBoundingClientRect();
      var left = iconR.left - parR.left + iconR.width/2 - dropR.width/2;
      left = Math.max(0, Math.min(left, parR.width - dropR.width));
      $dropdown.css("left", left + "px");
      var spaceBelow = window.innerHeight - iconR.bottom;
      var spaceAbove = iconR.top;
      var top;
      if (spaceBelow < dropR.height +10 && spaceAbove >= dropR.height+10) {
        top = iconR.top - parR.top - dropR.height - 10;
        $dropdown.addClass("arabica_ref-dropdown--above");
      } else {
        top = iconR.bottom - parR.top + 10;
      }
      $dropdown.css("top", top + "px");
      var arrowLeft = iconR.left - parR.left + iconR.width/2 - left;
      $dropdown.css("--arrow-left", arrowLeft + "px");
    };

    var $refIcons = $article.find(".arabica_ref-icon");
    $refIcons.each(function () {
      var $icon = $(this);
      var ddId = $icon.data("ref-id");
      var $dd = $("#" + ddId);
      $dd.on("click", function (e) { e.stopPropagation(); });
      $icon.on("click", function (e) {
        e.stopPropagation();
        if ($dd.hasClass("open")) {
          $dd.removeClass("open");
          resetIconStyles($icon);
        } else {
          closeAllDropdowns();
          positionDropdown($icon, $dd);
          $dd.addClass("open");
          $icon.find(".arabica_ref-icon-light").removeClass("active").addClass("inactive");
          $icon.find(".arabica_ref-icon-solid").removeClass("inactive").addClass("active");
        }
      });
      $icon.on("mouseenter", function () {
        if (!$dd.hasClass("open")) {
          $icon.find(".arabica_ref-icon-light").removeClass("active").addClass("inactive");
          $icon.find(".arabica_ref-icon-solid").removeClass("inactive").addClass("active");
        }
      });
      $icon.on("mouseleave", function () {
        if (!$dd.hasClass("open")) resetIconStyles($icon);
      });
      $dd.find(".arabica_ref-close-icon").on("click", function (e) {
        e.stopPropagation();
        $dd.removeClass("open");
        resetIconStyles($icon);
      });
      $dd.find(".arabica_ref-copy-icon").on("click", function (e) {
        e.stopPropagation();
        var $txtEl = $dd.find(".arabica_ref-text");
        var htmlC = $txtEl.html().trim();
        var plainC = $txtEl.text().trim().replace(/\s+/g," ");
        var clip = new ClipboardItem({
          "text/html": new Blob([htmlC], {type:"text/html"}),
          "text/plain": new Blob([plainC], {type:"text/plain"})
        });
        navigator.clipboard.write([clip]).then(function(){
          $(this).hide();
          $dd.find(".arabica_ref-copied-text").addClass("show");
          setTimeout(function(){
            $dd.find(".arabica_ref-copy-icon").show();
            $dd.find(".arabica_ref-copied-text").removeClass("show");
          },5000);
        }.bind(this)).catch(function(err){ console.error(err); });
      });
    });

    $(document).on("click", closeAllDropdowns);
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") closeAllDropdowns();
    });
  }

  // Side content & floating button
  var $toggleBtn = $(".arabica_floating-btn");
  var $sideContent = $(".arabica_side-content");
  var $closeBtn = $(".arabica_close-button");
  var $overlay = $(".arabica_overlay");

  var openSideContent = function () {
    $sideContent.addClass("arabica_show-content");
    $overlay.addClass("arabica_show-overlay");
    $("body").addClass("no-scroll");
  };
  var closeSideContent = function () {
    $sideContent.removeClass("arabica_show-content");
    $overlay.removeClass("arabica_show-overlay");
    $("body").removeClass("no-scroll");
  };

  $toggleBtn.on("click", openSideContent);
  $closeBtn.on("click", closeSideContent);
  $overlay.on("click", closeSideContent);
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") closeSideContent();
  });
  $sideContent.on("click", "a", closeSideContent);

  // Footer toggle visibility
  var $footerWrapper = $(".arabica_footer");
  var checkToggleBtnVisibility = function () {
    if (!$footerWrapper.length) return;
    var footerTop = $footerWrapper.offset().top;
    if (footerTop < window.innerHeight) $toggleBtn.addClass("hidden");
    else $toggleBtn.removeClass("hidden");
  };
  $(window).on("scroll resize", checkToggleBtnVisibility);
  checkToggleBtnVisibility();

  // Float styling
  $('[class*="float-right-"], [class*="float-left-"]').each(function () {
    var $el = $(this);
    var match = $el.attr("class").match(/float-(right|left)-(\d+)/);
    if (match) {
      var dir = match[1], w = match[2] + "%";
      $el.css({ width: w, float: dir, marginBottom: "0" });
    }
  });

  // Sticky sidebar (IIFE is its own function scope, so declarations here are fine)
  (function () {
    var $sidebar = $(".arabica_sticky-sidebar");
    var $overlay = $(".arabica_overlay");
    var lastScrollY = $(window).scrollTop();
    var currentTranslation = 0;
    function updateSidebarPosition() {
      if (window.innerWidth <= 991) {
        $sidebar.css("position", "static");
        $overlay.css("transform", "none");
        return;
      }
      var scrollY = $(window).scrollTop();
      var viewportH = $(window).height();
      var overlayH = $overlay.outerHeight();
      var maxTrans = overlayH - viewportH;
      if (scrollY + viewportH >= $(document).height() - 1) {
        currentTranslation = maxTrans;
      } else {
        var delta = scrollY - lastScrollY;
        if (delta > 0) currentTranslation = Math.min(currentTranslation + delta, maxTrans);
        else if (delta < 0) currentTranslation = Math.max(currentTranslation + delta, 0);
      }
      $sidebar.css({ position: "sticky", top: "0px", height: "fit-content" });
      $overlay.css({ transform: "translateY(-" + currentTranslation + "px)", paddingBottom: "30px" });
      lastScrollY = scrollY;
    }
    $(window).on("scroll resize", updateSidebarPosition);
    updateSidebarPosition();
  })();
});
