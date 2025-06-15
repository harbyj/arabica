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

// Unified Interactive Dropdown System
(function() {
  'use strict';
  
  var $article = $(".arabica_article-content");
  if (!$article.length) return;
  
  // Common utilities
  var utils = {
    hasArabicText: function(text) {
      return /[\u0600-\u06FF]/.test(text);
    },
    
    generateId: function(prefix) {
      return prefix + "-" + Math.random().toString(36).slice(2, 9);
    },
    
    createDropdownHtml: function(id, content, direction, includeActions) {
      var actionsHtml = includeActions ? 
        '<div class="arabica_ref-actions">' +
          '<span class="arabica_ref-copy-icon" title="Copy"><i class="fa-regular fa-copy"></i></span>' +
          '<span class="arabica_ref-copied-text">✓ تم النسخ</span>' +
          '<span class="arabica_ref-close-icon" title="Close"><i class="fa-regular fa-circle-xmark"></i></span>' +
        '</div>' : '';
      
      return '<div id="' + id + '" class="arabica_ref-dropdown ' + this.getDropdownClass(includeActions) + '">' +
               actionsHtml +
               '<div class="arabica_ref-text" dir="' + direction + '">' + content + '</div>' +
             '</div>';
    },
    
    getDropdownClass: function(includeActions) {
      return includeActions ? 'arabica_ftn-dropdown' : 'arabica_bracket-dropdown arabica_link-dropdown';
    }
  };
  
  // Common dropdown management
  var dropdownManager = {
    position: function($trigger, $dropdown) {
      var $parent = $trigger.offsetParent();
      if (!$parent.length) return;
      
      $dropdown.css({ top: "", left: "" }).removeClass("arabica_ref-dropdown--above");
      
      var triggerR = $trigger[0].getBoundingClientRect();
      var parR = $parent[0].getBoundingClientRect();
      var dropR = $dropdown[0].getBoundingClientRect();
      
      // Calculate horizontal position (center dropdown on trigger)
      var left = triggerR.left - parR.left + triggerR.width/2 - dropR.width/2;
      left = Math.max(0, Math.min(left, parR.width - dropR.width));
      $dropdown.css("left", left + "px");
      
      // Calculate vertical position
      var spaceBelow = window.innerHeight - triggerR.bottom;
      var spaceAbove = triggerR.top;
      var top;
      
      if (spaceBelow < dropR.height + 10 && spaceAbove >= dropR.height + 10) {
        // Show above
        top = triggerR.top - parR.top - dropR.height - 10;
        $dropdown.addClass("arabica_ref-dropdown--above");
      } else {
        // Show below
        top = triggerR.bottom - parR.top + 10;
      }
      $dropdown.css("top", top + "px");
      
      // Position arrow
      var arrowLeft = triggerR.left - parR.left + triggerR.width/2 - left;
      $dropdown.css("--arrow-left", arrowLeft + "px");
    },
    
    setupHoverEvents: function($trigger, $dropdown, dropdownType) {
      var showTimer, hideTimer;
      
      $trigger.on("mouseenter", function(e) {
        e.stopPropagation();
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
        
        showTimer = setTimeout(function() {
          $(".arabica_ref-dropdown.open").removeClass("open");
          dropdownManager.position($trigger, $dropdown);
          $dropdown.addClass("open");
        }, 300);
        $trigger.data('showTimer', showTimer);
      });
      
      $trigger.on("mouseleave", function(e) {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        
        hideTimer = setTimeout(function() {
          if (!$dropdown.is(":hover") && !$trigger.is(":hover")) {
            $dropdown.removeClass("open");
          }
        }, 300);
        $trigger.data('hideTimer', hideTimer);
      });
      
      // Keep dropdown open when hovering over it
      $dropdown.on("mouseenter", function(e) {
        clearTimeout($trigger.data('hideTimer'));
        clearTimeout($trigger.data('showTimer'));
      });
      
      $dropdown.on("mouseleave", function(e) {
        var hideTimer = setTimeout(function() {
          if (!$dropdown.is(":hover") && !$trigger.is(":hover")) {
            $dropdown.removeClass("open");
          }
        }, 300);
        $trigger.data('hideTimer', hideTimer);
      });
      
      // Prevent dropdown clicks from bubbling
      $dropdown.on("click", function(e) { 
        e.stopPropagation(); 
      });
    },
    
    setupCopyFunctionality: function($dropdown) {
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
      
      $dropdown.find(".arabica_ref-close-icon").on("click", function (e) {
        e.stopPropagation();
        $dropdown.removeClass("open");
      });
    },
    
    createDropdown: function($trigger, content, includeActions, additionalClass) {
      var direction = utils.hasArabicText(content) ? "rtl" : "ltr";
      var ddId = utils.generateId("arabica_dropdown");
      var dropdownHtml = utils.createDropdownHtml(ddId, content, direction, includeActions);
      
      if (additionalClass) {
        dropdownHtml = dropdownHtml.replace('class="arabica_ref-dropdown', 'class="arabica_ref-dropdown ' + additionalClass);
      }
      
      $trigger.after(dropdownHtml);
      var $dropdown = $("#" + ddId);
      $trigger.data("dropdown-id", ddId);
      
      this.setupHoverEvents($trigger, $dropdown);
      
      if (includeActions) {
        this.setupCopyFunctionality($dropdown);
      }
      
      return $dropdown;
    }
  };
  
  // 1. Bracket Links Processor
  var bracketProcessor = {
    init: function() {
      var articleHtml = $article.html();
      var linkBracketRegex = /(<a[^>]*href[^>]*>.*?<\/a>)\s*\{\{(.*?)\}\}/gi;
      
      var processedHtml = articleHtml.replace(linkBracketRegex, function(match, linkHtml, bracketContent) {
        var $tempLink = $(linkHtml);
        var linkText = $tempLink.text();
        var spanId = utils.generateId("arabica_bracket-span");
        
        return '<span id="' + spanId + '" class="arabica_bracket-span" ' +
               'style="text-decoration: underline; text-decoration-color: #c93; cursor: pointer;" ' +
               'data-bracket-content="' + bracketContent.replace(/"/g, '&quot;') + '">' +
               linkText + '</span>';
      });
      
      $article.html(processedHtml);
      $article.trigger('content-modified');
      
      this.setupBracketSpans();
    },
    
    setupBracketSpans: function() {
      $article.find('.arabica_bracket-span').each(function() {
        var $span = $(this);
        var bracketContent = $span.data('bracket-content');
        
        dropdownManager.createDropdown($span, bracketContent, false, 'arabica_bracket-dropdown');
        
        // Add click handler to prevent default link behavior
        $span.on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
        });
      });
    }
  };
  
  // 2. Footnote Processor
  var footnoteProcessor = {
    init: function() {
      var ftnRefs = this.extractFootnotes();
      this.setupFootnoteLinks(ftnRefs);
    },
    
    extractFootnotes: function() {
      var ftnRefs = {};
      var $ftns = $('a[name^="_ftn"]:not([name^="_ftnref"])');
      
      $ftns.each(function () {
        var $ftnAnchor = $(this);
        var name = $ftnAnchor.attr("name");
        var key = name.replace("_ftn", "");
        var $p = $ftnAnchor.closest("p");
        
        if ($p.length) {
          var $clonedP = $p.clone();
          $clonedP.find('a[name^="_ftn"]:not([name^="_ftnref"])').remove();
          var txt = $clonedP.prop('outerHTML');
          
          var $current = $p.next();
          while ($current.length && ["P", "UL", "OL", "DIV"].indexOf($current.prop("tagName")) !== -1) {
            if ($current.find('a[name^="_ftn"]:not([name^="_ftnref"])').length) {
              break;
            }
            txt += $current.prop('outerHTML');
            $current = $current.next();
          }
          
          ftnRefs[key] = txt.trim();
        }
      });
      
      return ftnRefs;
    },
    
    setupFootnoteLinks: function(ftnRefs) {
      $article.find('a[name^="_ftnref"]').each(function () {
        var $ftnrefLink = $(this);
        var key = $ftnrefLink.attr("name").replace("_ftnref", "");
        var refText = ftnRefs[key];
        
        if (refText) {
          dropdownManager.createDropdown($ftnrefLink, refText, true, 'arabica_ftn-dropdown');
        }
      });
    }
  };
  
  // 3. Cross-page Link Processor
  var linkProcessor = {
    linkContentCache: {},
    
    init: function() {
      this.setupCrossPageLinks();
    },
    
    isValidInternalLink: function(href) {
      if (!href || 
          href.startsWith('http://') || 
          href.startsWith('https://') || 
          href.startsWith('#') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') || 
          href.startsWith('javascript:')) {
        return false;
      }
      
      var fileExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|jpg|jpeg|png|gif|mp3|mp4|avi)$/i;
      return !fileExtensions.test(href);
    },
    
    setupCrossPageLinks: function() {
      var self = this;
      
      $article.find('a[href]').each(function() {
        var $link = $(this);
        var href = $link.attr('href');
        
        if (!self.isValidInternalLink(href) || $link.data('dropdown-processed')) {
          return;
        }
        
        $link.data('dropdown-processed', true);
        self.setupLinkHover($link, href);
      });
    },
    
    setupLinkHover: function($link, href) {
      var self = this;
      var showTimer, hideTimer;
      var isContentFetched = false;
      
      $link.on("mouseenter", function(e) {
        e.stopPropagation();
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
        
        if (isContentFetched && $link.data("dropdown-id")) {
          var $dropdown = $("#" + $link.data("dropdown-id"));
          if ($dropdown.length) {
            showTimer = setTimeout(function() {
              $(".arabica_ref-dropdown.open").removeClass("open");
              dropdownManager.position($link, $dropdown);
              $dropdown.addClass("open");
            }, 300);
            return;
          }
        }
        
        if (!isContentFetched) {
          isContentFetched = true;
          self.fetchPageContent($link, href, function() {
            if ($link.is(":hover")) {
              showTimer = setTimeout(function() {
                var $dropdown = $("#" + $link.data("dropdown-id"));
                if ($dropdown.length) {
                  $(".arabica_ref-dropdown.open").removeClass("open");
                  dropdownManager.position($link, $dropdown);
                  $dropdown.addClass("open");
                }
              }, 300);
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
        }, 300);
      });
    },
    
    fetchPageContent: function($link, url, callback) {
      var self = this;
      
      if (self.linkContentCache[url]) {
        if (self.linkContentCache[url].content) {
          dropdownManager.createDropdown($link, self.linkContentCache[url].content, false, 'arabica_link-dropdown');
        }
        if (callback) callback();
        return;
      }
      
      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        timeout: 5000,
        success: function(data) {
          try {
            var content = self.extractFactsContent(data);
            if (content) {
              self.linkContentCache[url] = { content: content };
              dropdownManager.createDropdown($link, content, false, 'arabica_link-dropdown');
            } else {
              self.linkContentCache[url] = { content: null };
            }
          } catch (error) {
            console.error('Error processing page content:', error);
            self.linkContentCache[url] = { content: null };
          }
          if (callback) callback();
        },
        error: function(xhr, status, error) {
          console.error('Error fetching page:', url, error);
          self.linkContentCache[url] = { content: null };
          if (callback) callback();
        }
      });
    },
    
    extractFactsContent: function(data) {
      var $pageContent = $(data);
      var $factsSection = $pageContent.find('#Facts');
      
      if (!$factsSection.length) return null;
      
      var content = '';
      var $paragraphs = $factsSection.find('#facts-desc');
      
      if ($paragraphs.length) {
        $paragraphs.each(function() {
          var $para = $(this);
          var paraText = $para.text();
          var isArabic = utils.hasArabicText(paraText);
          
          $para.attr('dir', isArabic ? 'rtl' : 'ltr');
          $para.find('ul, ol').each(function() {
            var $list = $(this);
            var listText = $list.text();
            var listIsArabic = utils.hasArabicText(listText);
            $list.attr('dir', listIsArabic ? 'rtl' : 'ltr');
          });
          
          content += $para.prop('outerHTML');
        });
      }
      
      $factsSection.find('ul, ol').each(function() {
        var $list = $(this);
        var listText = $list.text();
        var isArabic = utils.hasArabicText(listText);
        $list.attr('dir', isArabic ? 'rtl' : 'ltr');
        content += $list.prop('outerHTML');
      });
      
      return content || null;
    }
  };
  
  // Global event handlers
  var globalEvents = {
    init: function() {
      // Close all dropdowns when clicking elsewhere
      $(document).on("click", function(e) {
        if (!$(e.target).closest(".arabica_ref-dropdown, .arabica_bracket-span, a[name^='_ftnref'], a[href]").length) {
          $(".arabica_ref-dropdown.open").removeClass("open");
        }
      });
      
      // Close on ESC key
      $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
          $(".arabica_ref-dropdown.open").removeClass("open");
        }
      });
    }
  };
  
  // 4. Endnote Processor
  var endnoteProcessor = {
    init: function() {
      var ednRefs = this.extractEndnotes();
      this.setupEndnoteLinks(ednRefs);
      this.setupEndnoteEvents();
    },
    
    extractEndnotes: function() {
      var ednRefs = {};
      var $ends = $article.find('p:has(a[name^="_edn"]:not([name^="_ednref"]))');
      
      $ends.each(function () {
        var $p = $(this);
        var name = $p.find('a[name^="_edn"]:not([name^="_ednref"])').attr("name");
        var key = name.replace("_edn", "");
        var txt = $p.prop('outerHTML');
        var $n = $p.next();
        
        while ($n.length && ["P", "UL", "OL"].indexOf($n.prop("tagName")) !== -1) {
          if ($n.is("p") && $n.find('a[name^="_edn"]:not([name^="_ednref"])').length) break;
          txt += $n.prop('outerHTML');
          $n = $n.next();
        }
        ednRefs[key] = txt.trim();

        // Remove the endnote content from the article
        var toRm = [$p];
        $n = $p.next();
        while ($n.length && ["P", "UL", "OL"].indexOf($n.prop("tagName")) !== -1) {
          if ($n.is("p") && $n.find('a[name^="_edn"]:not([name^="_ednref"])').length) break;
          toRm.push($n);
          $n = $n.next();
        }
        for (var x = 0; x < toRm.length; x++) toRm[x].remove();
      });
      
      return ednRefs;
    },
    
    setupEndnoteLinks: function(ednRefs) {
      var self = this;
      
      $article.find('a[name^="_ednref"]').each(function () {
        var $lnk = $(this);
        var key = $lnk.attr("name").replace("_ednref", "");
        var refText = ednRefs[key] || "";
        
        if (refText) {
          var dir = utils.hasArabicText(refText) ? "rtl" : "ltr";
          var ddId = utils.generateId("arabica_edn-dropdown");
          
          var html =
            '<a class="arabica_ref-icon" data-ref-id="' + ddId + '" data-reference="' + refText.replace(/"/g, '&quot;') + '">' +
              '<i class="fa-light fa-circle-info arabica_ref-icon-light active"></i>' +
              '<i class="fa-solid fa-circle-info arabica_ref-icon-solid inactive"></i>' +
            "</a>" +
            '<div id="' + ddId + '" class="arabica_ref-dropdown arabica_edn-dropdown">' +
              '<div class="arabica_ref-actions">' +
                '<span class="arabica_ref-copy-icon" title="Copy"><i class="fa-regular fa-copy"></i></span>' +
                '<span class="arabica_ref-copied-text">✓ تم النسخ</span>' +
                '<span class="arabica_ref-close-icon" title="Close"><i class="fa-regular fa-circle-xmark"></i></span>' +
              "</div>" +
              '<div class="arabica_ref-text" dir="' + dir + '"><span dir="' + dir + '">' + refText + "</span></div>" +
            "</div>";
          
          $lnk.replaceWith(html);
        }
      });
    },
    
    resetIconStyles: function($icon) {
      $icon.find(".arabica_ref-icon-solid").removeClass("active").addClass("inactive");
      $icon.find(".arabica_ref-icon-light").removeClass("inactive").addClass("active");
    },
    
    setIconActive: function($icon) {
      $icon.find(".arabica_ref-icon-light").removeClass("active").addClass("inactive");
      $icon.find(".arabica_ref-icon-solid").removeClass("inactive").addClass("active");
    },
    
    closeAllEndnoteDropdowns: function() {
      var self = this;
      $(".arabica_edn-dropdown.open").each(function () {
        var $d = $(this);
        $d.removeClass("open");
        var $icon = $d.prev(".arabica_ref-icon");
        if ($icon.length) {
          self.resetIconStyles($icon);
        }
      });
    },
    
    setupEndnoteEvents: function() {
      var self = this;
      
      $article.find(".arabica_ref-icon").each(function () {
        var $icon = $(this);
        var ddId = $icon.data("ref-id");
        var $dd = $("#" + ddId);
        
        // Prevent dropdown clicks from bubbling
        $dd.on("click", function (e) { e.stopPropagation(); });
        
        // Icon click handler
        $icon.on("click", function (e) {
          e.stopPropagation();
          if ($dd.hasClass("open")) {
            $dd.removeClass("open");
            self.resetIconStyles($icon);
          } else {
            self.closeAllEndnoteDropdowns();
            dropdownManager.position($icon, $dd);
            $dd.addClass("open");
            self.setIconActive($icon);
          }
        });
        
        // Icon hover handlers
        $icon.on("mouseenter", function () {
          if (!$dd.hasClass("open")) {
            self.setIconActive($icon);
          }
        });
        
        $icon.on("mouseleave", function () {
          if (!$dd.hasClass("open")) {
            self.resetIconStyles($icon);
          }
        });
        
        // Close button handler
        $dd.find(".arabica_ref-close-icon").on("click", function (e) {
          e.stopPropagation();
          $dd.removeClass("open");
          self.resetIconStyles($icon);
        });
        
        // Copy functionality
        dropdownManager.setupCopyFunctionality($dd);
      });
    }
  };
  
  // Enhanced global events to handle endnote dropdowns
  var globalEvents = {
    init: function() {
      var self = this;
      
      // Close all dropdowns when clicking elsewhere
      $(document).on("click", function(e) {
        if (!$(e.target).closest(".arabica_ref-dropdown, .arabica_bracket-span, a[name^='_ftnref'], a[href], .arabica_ref-icon").length) {
          $(".arabica_ref-dropdown.open").removeClass("open");
          self.resetAllEndnoteIcons();
        }
      });
      
      // Close on ESC key
      $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
          $(".arabica_ref-dropdown.open").removeClass("open");
          self.resetAllEndnoteIcons();
        }
      });
    },
    
    resetAllEndnoteIcons: function() {
      $(".arabica_ref-icon").each(function() {
        var $icon = $(this);
        var ddId = $icon.data("ref-id");
        var $dd = $("#" + ddId);
        if (!$dd.hasClass("open")) {
          endnoteProcessor.resetIconStyles($icon);
        }
      });
    }
  };

  // Initialize all processors
  bracketProcessor.init();
  footnoteProcessor.init();
  linkProcessor.init();
  endnoteProcessor.init();
  globalEvents.init();
  
})();
  
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
