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

// Convert links with following double brackets to interactive spans with dropdowns
// IMPORTANT: This script should run BEFORE the original link dropdown script
var $article = $(".arabica_article-content");
if ($article.length) {
  
  // Function to detect Arabic text
  function hasArabicText(text) {
    return /[\u0600-\u06FF]/.test(text);
  }
  
  // Function to create dropdown for bracket content
  function createBracketDropdown($span, content) {
    var ddId = "arabica_bracket-dropdown-" + Math.random().toString(36).slice(2,9);
    var direction = hasArabicText(content) ? "rtl" : "ltr";
    
    // Create dropdown element
    var dropdownHtml = 
      '<div id="' + ddId + '" class="arabica_ref-dropdown arabica_bracket-dropdown">' +
        '<div class="arabica_ref-text" dir="' + direction + '">' + content + '</div>' +
      '</div>';
    
    // Insert dropdown after the span
    $span.after(dropdownHtml);
    var $dropdown = $("#" + ddId);
    
    // Store reference to dropdown in data attribute
    $span.data("dropdown-id", ddId);
    
    // Set up hover events for the dropdown itself
    $dropdown.on("mouseenter", function (e) {
      clearTimeout($span.data('hideTimer'));
      clearTimeout($span.data('showTimer'));
    });
    
    $dropdown.on("mouseleave", function (e) {
      var hideTimer = setTimeout(function() {
        if (!$dropdown.is(":hover") && !$span.is(":hover")) {
          $dropdown.removeClass("open");
        }
      }, 200);
      $span.data('hideTimer', hideTimer);
    });
    
    // Prevent dropdown clicks from bubbling
    $dropdown.on("click", function (e) { 
      e.stopPropagation(); 
    });
  }
  
  // Function to position bracket dropdowns
  function positionBracketDropdown($span, $dropdown) {
    var $parent = $span.offsetParent();
    if (!$parent.length) return;
    
    $dropdown.css({ top: "", left: "" }).removeClass("arabica_ref-dropdown--above");
    
    var spanR = $span[0].getBoundingClientRect();
    var parR = $parent[0].getBoundingClientRect();
    var dropR = $dropdown[0].getBoundingClientRect();
    
    // Calculate horizontal position (center dropdown on span)
    var left = spanR.left - parR.left + spanR.width/2 - dropR.width/2;
    left = Math.max(0, Math.min(left, parR.width - dropR.width));
    $dropdown.css("left", left + "px");
    
    // Calculate vertical position
    var spaceBelow = window.innerHeight - spanR.bottom;
    var spaceAbove = spanR.top;
    var top;
    
    if (spaceBelow < dropR.height + 10 && spaceAbove >= dropR.height + 10) {
      // Show above
      top = spanR.top - parR.top - dropR.height - 10;
      $dropdown.addClass("arabica_ref-dropdown--above");
    } else {
      // Show below
      top = spanR.bottom - parR.top + 10;
    }
    $dropdown.css("top", top + "px");
    
    // Position arrow
    var arrowLeft = spanR.left - parR.left + spanR.width/2 - left;
    $dropdown.css("--arrow-left", arrowLeft + "px");
  }
  
  // Process the article content
  var articleHtml = $article.html();
  
  // Regular expression to find links followed by double brackets
  // This matches: <a href="...">text</a> {{content}}
  var linkBracketRegex = /(<a[^>]*href[^>]*>.*?<\/a>)\s*\{\{(.*?)\}\}/gi;
  
  var processedHtml = articleHtml.replace(linkBracketRegex, function(match, linkHtml, bracketContent) {
    // Extract the link text from the link HTML
    var $tempLink = $(linkHtml);
    var linkText = $tempLink.text();
    
    // Create a unique ID for this span
    var spanId = "arabica_bracket-span-" + Math.random().toString(36).slice(2,9);
    
    // Create the span replacement with dotted underline styling
    var spanHtml = '<span id="' + spanId + '" class="arabica_bracket-span" ' +
                   'style="text-decoration: underline;' +
                   'text-decoration-color: #c93; cursor: pointer;" ' +
                   'data-bracket-content="' + bracketContent.replace(/"/g, '&quot;') + '">' +
                   linkText + '</span>';
    
    return spanHtml;
  });
  
  // Update the article content
  $article.html(processedHtml);
  
  // Trigger a custom event to let other scripts know the content has been modified
  $article.trigger('content-modified');
  
  // Set up event handlers for the newly created spans
  $article.find('.arabica_bracket-span').each(function() {
    var $span = $(this);
    var bracketContent = $span.data('bracket-content');
    var isDropdownCreated = false;
    
    // Create dropdown content
    createBracketDropdown($span, bracketContent);
    isDropdownCreated = true;
    
    // Set up hover events
    $span.on("mouseenter", function(e) {
      e.stopPropagation();
      clearTimeout($span.data('hideTimer'));
      clearTimeout($span.data('showTimer'));
      
      if (isDropdownCreated && $span.data("dropdown-id")) {
        var $dropdown = $("#" + $span.data("dropdown-id"));
        if ($dropdown.length) {
          var showTimer = setTimeout(function() {
            $(".arabica_bracket-dropdown.open").removeClass("open");
            positionBracketDropdown($span, $dropdown);
            $dropdown.addClass("open");
          }, 200);
          $span.data('showTimer', showTimer);
        }
      }
    });
    
    $span.on("mouseleave", function(e) {
      clearTimeout($span.data('showTimer'));
      clearTimeout($span.data('hideTimer'));
      
      var hideTimer = setTimeout(function() {
        var $dropdown = $("#" + $span.data("dropdown-id"));
        if ($dropdown.length && !$dropdown.is(":hover") && !$span.is(":hover")) {
          $dropdown.removeClass("open");
        }
      }, 200);
      $span.data('hideTimer', hideTimer);
    });
    
    // Add click handler to prevent default link behavior
    $span.on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  
  // Close all bracket dropdowns when clicking elsewhere
  $(document).on("click", function(e) {
    if (!$(e.target).closest(".arabica_bracket-dropdown, .arabica_bracket-span").length) {
      $(".arabica_bracket-dropdown.open").removeClass("open");
    }
  });
  
  // Close on ESC key
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".arabica_bracket-dropdown.open").removeClass("open");
    }
  });
}

 // Footnote hover dropdowns
var $article = $(".arabica_article-content");
if ($article.length) {
  var ftnRefs = {};
  var $ftns = $('a[name^="_ftn"]:not([name^="_ftnref"])');

  // Extract footnote content
  $ftns.each(function () {
    var $ftnAnchor = $(this);
    var name = $ftnAnchor.attr("name");
    var key = name.replace("_ftn", "");
    var $p = $ftnAnchor.closest("p");
    
    if ($p.length) {
      // Get content excluding the anchor text
      var $clonedP = $p.clone();
      $clonedP.find('a[name^="_ftn"]:not([name^="_ftnref"])').remove();
      var txt = $clonedP.prop('outerHTML');
      
      // Get subsequent elements until next footnote or end of container
      var $current = $p.next();
      while ($current.length && ["P", "UL", "OL", "DIV"].indexOf($current.prop("tagName")) !== -1) {
        // Check if this element contains the next footnote
        if ($current.find('a[name^="_ftn"]:not([name^="_ftnref"])').length) {
          break;
        }
        txt += $current.prop('outerHTML');
        $current = $current.next();
      }
      
      ftnRefs[key] = txt.trim();
    }
  });

  // Add hover functionality to footnote reference links
  $article.find('a[name^="_ftnref"]').each(function () {
    var $ftnrefLink = $(this);
    var key = $ftnrefLink.attr("name").replace("_ftnref", "");
    var refText = ftnRefs[key] || "";
    
    if (refText) {
      var dir = /[\u0600-\u06FF]/.test(refText) ? "rtl" : "ltr";
      var ddId = "arabica_ftn-dropdown-" + Math.random().toString(36).slice(2,9);
      
      // Create dropdown element
      var dropdownHtml = 
        '<div id="' + ddId + '" class="arabica_ref-dropdown arabica_ftn-dropdown">' +
          '<div class="arabica_ref-actions">' +
            '<span class="arabica_ref-copy-icon" title="Copy"><i class="fa-regular fa-copy"></i></span>' +
            '<span class="arabica_ref-copied-text">✓ تم النسخ</span>' +
            '<span class="arabica_ref-close-icon" title="Close"><i class="fa-regular fa-circle-xmark"></i></span>' +
          '</div>' +
          '<div class="arabica_ref-text" dir="' + dir + '">' + refText + '</div>' +
        '</div>';
      
      // Insert dropdown after the link
      $ftnrefLink.after(dropdownHtml);
      var $dropdown = $("#" + ddId);
      
      // Store reference to dropdown in data attribute
      $ftnrefLink.data("dropdown-id", ddId);
      
      // Hover event handlers with 200ms delays
      var showTimer, hideTimer;
      
      $ftnrefLink.on("mouseenter", function (e) {
        e.stopPropagation();
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
        
        showTimer = setTimeout(function() {
          // Close other footnote dropdowns
          $(".arabica_ftn-dropdown.open").removeClass("open");
          
          // Position and show dropdown
          positionFootnoteDropdown($ftnrefLink, $dropdown);
          $dropdown.addClass("open");
        }, 200);
      });
      
      $ftnrefLink.on("mouseleave", function (e) {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        
        hideTimer = setTimeout(function() {
          if (!$dropdown.is(":hover") && !$ftnrefLink.is(":hover")) {
            $dropdown.removeClass("open");
          }
        }, 200);
      });
      
      // Keep dropdown open when hovering over it
      $dropdown.on("mouseenter", function (e) {
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
      });
      
      $dropdown.on("mouseleave", function (e) {
        clearTimeout(hideTimer);
        
        hideTimer = setTimeout(function() {
          if (!$dropdown.is(":hover") && !$ftnrefLink.is(":hover")) {
            $dropdown.removeClass("open");
          }
        }, 200);
      });
      
      // Copy functionality
      $dropdown.find(".arabica_ref-copy-icon").on("click", function (e) {
        e.stopPropagation();
        var $txtEl = $dropdown.find(".arabica_ref-text");
        var htmlC = $txtEl.html().trim();
        var plainC = $txtEl.text().trim().replace(/\s+/g," ");
        var clip = new ClipboardItem({
          "text/html": new Blob([htmlC], {type:"text/html"}),
          "text/plain": new Blob([plainC], {type:"text/plain"})
        });
        navigator.clipboard.write([clip]).then(function(){
          $(this).hide();
          $dropdown.find(".arabica_ref-copied-text").addClass("show");
          setTimeout(function(){
            $dropdown.find(".arabica_ref-copy-icon").show();
            $dropdown.find(".arabica_ref-copied-text").removeClass("show");
          }, 5000);
        }.bind(this)).catch(function(err){ console.error(err); });
      });
      
      // Close button functionality
      $dropdown.find(".arabica_ref-close-icon").on("click", function (e) {
        e.stopPropagation();
        $dropdown.removeClass("open");
      });
      
      // Prevent dropdown clicks from bubbling
      $dropdown.on("click", function (e) { 
        e.stopPropagation(); 
      });
    }
  });

  // Positioning function for footnote dropdowns
  function positionFootnoteDropdown($link, $dropdown) {
    var $parent = $link.offsetParent();
    if (!$parent.length) return;
    
    $dropdown.css({ top: "", left: "" }).removeClass("arabica_ref-dropdown--above");
    
    var linkR = $link[0].getBoundingClientRect();
    var parR = $parent[0].getBoundingClientRect();
    var dropR = $dropdown[0].getBoundingClientRect();
    
    // Calculate horizontal position (center dropdown on link)
    var left = linkR.left - parR.left + linkR.width/2 - dropR.width/2;
    left = Math.max(0, Math.min(left, parR.width - dropR.width));
    $dropdown.css("left", left + "px");
    
    // Calculate vertical position
    var spaceBelow = window.innerHeight - linkR.bottom;
    var spaceAbove = linkR.top;
    var top;
    
    if (spaceBelow < dropR.height + 10 && spaceAbove >= dropR.height + 10) {
      // Show above
      top = linkR.top - parR.top - dropR.height - 10;
      $dropdown.addClass("arabica_ref-dropdown--above");
    } else {
      // Show below
      top = linkR.bottom - parR.top + 10;
    }
    $dropdown.css("top", top + "px");
    
    // Position arrow
    var arrowLeft = linkR.left - parR.left + linkR.width/2 - left;
    $dropdown.css("--arrow-left", arrowLeft + "px");
  }

  // Close all footnote dropdowns when clicking elsewhere
  $(document).on("click", function(e) {
    if (!$(e.target).closest(".arabica_ftn-dropdown, a[name^='_ftnref']").length) {
      $(".arabica_ftn-dropdown.open").removeClass("open");
    }
  });
  
  // Close on ESC key
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".arabica_ftn-dropdown.open").removeClass("open");
    }
  });
}

// Cross-page link hover dropdowns
var $article = $(".arabica_article-content");
if ($article.length) {
  var linkContentCache = {}; // Cache to avoid repeated fetches
  
  // Find all anchor links pointing to other pages in the same domain
  $article.find('a[href]').each(function() {
    var $link = $(this);
    var href = $link.attr('href');
    
    // Skip if it's an external link, anchor link, or already processed
    if (!href || 
        href.startsWith('http://') || 
        href.startsWith('https://') || 
        href.startsWith('#') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        href.startsWith('javascript:') ||
        $link.data('dropdown-processed')) {
      return;
    }
    
    // Skip if it's a file download (common file extensions)
    var fileExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|jpg|jpeg|png|gif|mp3|mp4|avi)$/i;
    if (fileExtensions.test(href)) {
      return;
    }
    
    // Mark as processed to avoid duplicate processing
    $link.data('dropdown-processed', true);
    
    // Function to fetch and process the linked page
    function fetchAndProcessPage($targetLink, url, callback) {
      // Check cache first
      if (linkContentCache[url]) {
        if (linkContentCache[url].content) {
          createLinkDropdown($targetLink, linkContentCache[url].content, linkContentCache[url].direction);
        }
        if (callback) callback();
        return;
      }
      
      // Fetch the page
      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        timeout: 5000,
        success: function(data) {
          try {
            var $pageContent = $(data);
            var $factsSection = $pageContent.find('#Facts');
            
            if ($factsSection.length) {
              // Find all paragraphs within the #Facts section
              var $paragraphs = $factsSection.find('p');
              
              if ($paragraphs.length) {
                var content = '';
                var hasArabic = false;
                
                $paragraphs.each(function() {
                  var $para = $(this);
                  var paraText = $para.text();
                  var isArabic = /[\u0600-\u06FF]/.test(paraText);
                  
                  if (isArabic) {
                    hasArabic = true;
                    $para.attr('dir', 'rtl');
                  } else {
                    $para.attr('dir', 'ltr');
                  }
                  
                  // Also handle lists within paragraphs
                  $para.find('ul, ol').each(function() {
                    var $list = $(this);
                    var listText = $list.text();
                    var listIsArabic = /[\u0600-\u06FF]/.test(listText);
                    $list.attr('dir', listIsArabic ? 'rtl' : 'ltr');
                  });
                  
                  content += $para.prop('outerHTML');
                });
                
                // Also check for any direct ul/ol elements in the Facts section
                $factsSection.find('ul, ol').each(function() {
                  var $list = $(this);
                  var listText = $list.text();
                  var isArabic = /[\u0600-\u06FF]/.test(listText);
                  
                  if (isArabic) {
                    hasArabic = true;
                    $list.attr('dir', 'rtl');
                  } else {
                    $list.attr('dir', 'ltr');
                  }
                  
                  content += $list.prop('outerHTML');
                });
                
                // Overall container direction based on predominant content
                var direction = hasArabic ? "rtl" : "ltr";
                
                // Cache the result
                linkContentCache[url] = {
                  content: content,
                  direction: direction
                };
                
                // Create the dropdown
                createLinkDropdown($targetLink, content, direction);
                if (callback) callback();
              } else {
                // Cache empty result to avoid repeated attempts
                linkContentCache[url] = { content: null };
                if (callback) callback();
              }
            } else {
              // Cache empty result to avoid repeated attempts
              linkContentCache[url] = { content: null };
              if (callback) callback();
            }
          } catch (error) {
            console.error('Error processing page content:', error);
            linkContentCache[url] = { content: null };
            if (callback) callback();
          }
        },
        error: function(xhr, status, error) {
          console.error('Error fetching page:', url, error);
          // Cache the failure to avoid repeated attempts
          linkContentCache[url] = { content: null };
          if (callback) callback();
        }
      });
    }
    
    // Function to create the dropdown for a link
    function createLinkDropdown($targetLink, content, direction) {
      var ddId = "arabica_link-dropdown-" + Math.random().toString(36).slice(2,9);
      
      // Create dropdown element
      var dropdownHtml = 
        '<div id="' + ddId + '" class="arabica_ref-dropdown arabica_link-dropdown">' +
          '<div class="arabica_ref-text" dir="' + direction + '">' + content + '</div>' +
        '</div>';
      
      // Insert dropdown after the link
      $targetLink.after(dropdownHtml);
      var $dropdown = $("#" + ddId);
      
      // Store reference to dropdown in data attribute
      $targetLink.data("dropdown-id", ddId);
      
      // Set up hover events for the dropdown itself
      $dropdown.on("mouseenter", function (e) {
        var $link = $targetLink;
        clearTimeout($link.data('hideTimer'));
        clearTimeout($link.data('showTimer'));
      });
      
      $dropdown.on("mouseleave", function (e) {
        var $link = $targetLink;
        var hideTimer = setTimeout(function() {
          if (!$dropdown.is(":hover") && !$link.is(":hover")) {
            $dropdown.removeClass("open");
          }
        }, 200);
        $link.data('hideTimer', hideTimer);
      });
      
      // Prevent dropdown clicks from bubbling
      $dropdown.on("click", function (e) { 
        e.stopPropagation(); 
      });
    }
    
    // Set up hover events immediately, fetch content on demand
    var showTimer, hideTimer;
    var isContentFetched = false;
    
    $link.on("mouseenter", function(e) {
      e.stopPropagation();
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      
      // If content already fetched and dropdown exists, show it
      if (isContentFetched && $link.data("dropdown-id")) {
        var $dropdown = $("#" + $link.data("dropdown-id"));
        if ($dropdown.length) {
          showTimer = setTimeout(function() {
            $(".arabica_link-dropdown.open").removeClass("open");
            positionLinkDropdown($link, $dropdown);
            $dropdown.addClass("open");
          }, 200);
          return;
        }
      }
      
      // If content not fetched yet, fetch it
      if (!isContentFetched) {
        isContentFetched = true;
        fetchAndProcessPage($link, href, function() {
          // After content is fetched and dropdown created, show it if still hovering
          if ($link.is(":hover")) {
            showTimer = setTimeout(function() {
              var $dropdown = $("#" + $link.data("dropdown-id"));
              if ($dropdown.length) {
                $(".arabica_link-dropdown.open").removeClass("open");
                positionLinkDropdown($link, $dropdown);
                $dropdown.addClass("open");
              }
            }, 200);
          }
        });
      }
    });
    
    $link.on("mouseleave", function(e) {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      
      hideTimer = setTimeout(function() {
        var $dropdown = $("#" + $link.data("dropdown-id"));
        if ($dropdown.length && !$dropdown.is(":hover") && !$link.is(":hover")) {
          $dropdown.removeClass("open");
        }
      }, 200);
    });
  });

  // Positioning function for link dropdowns
  function positionLinkDropdown($link, $dropdown) {
    var $parent = $link.offsetParent();
    if (!$parent.length) return;
    
    $dropdown.css({ top: "", left: "" }).removeClass("arabica_ref-dropdown--above");
    
    var linkR = $link[0].getBoundingClientRect();
    var parR = $parent[0].getBoundingClientRect();
    var dropR = $dropdown[0].getBoundingClientRect();
    
    // Calculate horizontal position (center dropdown on link)
    var left = linkR.left - parR.left + linkR.width/2 - dropR.width/2;
    left = Math.max(0, Math.min(left, parR.width - dropR.width));
    $dropdown.css("left", left + "px");
    
    // Calculate vertical position
    var spaceBelow = window.innerHeight - linkR.bottom;
    var spaceAbove = linkR.top;
    var top;
    
    if (spaceBelow < dropR.height + 10 && spaceAbove >= dropR.height + 10) {
      // Show above
      top = linkR.top - parR.top - dropR.height - 10;
      $dropdown.addClass("arabica_ref-dropdown--above");
    } else {
      // Show below
      top = linkR.bottom - parR.top + 10;
    }
    $dropdown.css("top", top + "px");
    
    // Position arrow
    var arrowLeft = linkR.left - parR.left + linkR.width/2 - left;
    $dropdown.css("--arrow-left", arrowLeft + "px");
  }

  // Close all link dropdowns when clicking elsewhere
  $(document).on("click", function(e) {
    if (!$(e.target).closest(".arabica_link-dropdown, a[href]:not([href^='http']):not([href^='#']):not([href^='mailto']):not([href^='tel'])").length) {
      $(".arabica_link-dropdown.open").removeClass("open");
    }
  });
  
  // Close on ESC key
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".arabica_link-dropdown.open").removeClass("open");
    }
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
