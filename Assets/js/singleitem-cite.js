(function ($) {
  // -------------------------
  // Helpers (ES5)
  // -------------------------
  function normalizeSpaces(s) {
    return (s || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pad2(n) {
    n = String(n);
    return n.length === 1 ? "0" + n : n;
  }

  function getAccessDMY() {
    var dt = new Date();
    return pad2(dt.getDate()) + "/" + pad2(dt.getMonth() + 1) + "/" + dt.getFullYear();
  }

  // Parse Arabic date like: "05 ديسمبر ، 2024" or "16 ديسمبر، 2025"
  function parseArabicDate(raw) {
    var s = normalizeSpaces(raw).replace(/،/g, "").replace(/,/g, "");
    var parts = s.split(" ");
    if (parts.length < 3) return null;

    var d = parseInt(parts[0], 10);
    var monthName = parts[1];
    var y = parseInt(parts[2], 10);

    var months = {
      "يناير": 1, "فبراير": 2, "مارس": 3, "أبريل": 4, "ابريل": 4,
      "مايو": 5, "يونيو": 6, "يوليو": 7, "أغسطس": 8, "اغسطس": 8,
      "سبتمبر": 9, "أكتوبر": 10, "اكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12
    };

    var m = months[monthName];
    if (!d || !y || !m) return null;
    return { y: y, m: m, d: d };
  }

  function getPubDMY(updateArabic) {
    var p = parseArabicDate(updateArabic);
    if (!p) return normalizeSpaces(updateArabic);
    return pad2(p.d) + "/" + pad2(p.m) + "/" + p.y;
  }

  function getYear(updateArabic) {
    var p = parseArabicDate(updateArabic);
    return p ? String(p.y) : String(new Date().getFullYear());
  }

  function escapeHtml(str) {
    str = String(str || "");
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function linkHtml(url) {
    var u = escapeHtml(url);
    return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + "</a>";
  }

  // -------------------------
  // Author formatting rules
  // -------------------------
  function splitArabicName(full) {
    var n = normalizeSpaces(full);
    if (!n) return null;

    if (n === "فريق التحرير") return { isEditorial: true };

    var parts = n.split(" ");
    if (parts.length === 1) return { family: parts[0], first: "", isEditorial: false };

    return {
      family: parts[parts.length - 1],
      first: parts.slice(0, -1).join(" "),
      isEditorial: false
    };
  }

  function formatFamilyFirst(full) {
    var s = splitArabicName(full);
    if (!s || s.isEditorial) return "";
    return s.first ? (s.family + "، " + s.first) : s.family;
  }

  function formatFamilyInitial(full) {
    var s = splitArabicName(full);
    if (!s || s.isEditorial) return "";
    var initial = s.first ? s.first.charAt(0) : "";
    return initial ? (s.family + "، " + initial + ".") : s.family;
  }

  function isEditorialTeam(authors) {
    var i, s;
    for (i = 0; i < (authors || []).length; i++) {
      s = splitArabicName(authors[i]);
      if (s && s.isEditorial) return true;
    }
    return false;
  }

  function joinAuthorsArabicList(items) {
    if (!items || !items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + "، و" + items[1];
    return items.slice(0, -1).join("، ") + "، و" + items[items.length - 1];
  }

  // -------------------------
  // Copy rich HTML + plain text
  // -------------------------
  function showBottom(msg) {
    $("#arbCiteBottomText").text(msg || "تم النسخ");
    $("#arbCiteBottom").attr("aria-hidden", "false");
    clearTimeout(window.__arbBottomT);
    window.__arbBottomT = setTimeout(function () {
      $("#arbCiteBottom").attr("aria-hidden", "true");
    }, 1500);
  }

  // Show copied state on button
function showCopiedState($btn) {
  var $icon = $btn.find("i");
  
  // Change to checkmark state
  $btn.addClass("is-copied");
  $icon.removeClass("fa-regular fa-copy").addClass("fa-solid fa-check");
  
  // Clear any existing timeout for this button
  var existingTimeout = $btn.data("copyTimeout");
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Revert after 1.5 seconds
  var timeout = setTimeout(function () {
    $btn.removeClass("is-copied");
    $icon.removeClass("fa-solid fa-check").addClass("fa-regular fa-copy");
  }, 1500);
  
  $btn.data("copyTimeout", timeout);
}

  function copyRich(html, plain, label, $btn) {
  // 1) Force RTL context for HTML clipboard
  var rtlHtml =
    '<div dir="rtl" style="direction:rtl;unicode-bidi:embed;text-align:right;">' +
      html +
    '</div>';

  // 2) Force RTL context for plain-text clipboard (important for WhatsApp/notes/etc)
  // RLE ... PDF makes the entire string behave RTL even in LTR environments
  // \u202B = RLE (Right-to-Left Embedding), \u202C = PDF (Pop Directional Formatting)
  var plainText = plain || normalizeSpaces($("#arbCiteCopyBuffer").text());
  var rtlPlain = "\u202B" + plainText + "\u202C";

  var $buf = $("#arbCiteCopyBuffer");
  $buf.html(rtlHtml);

  var el = $buf.get(0);
  el.setAttribute("contenteditable", "true");

  var range = document.createRange();
  range.selectNodeContents(el);

  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  function onCopy(e) {
    try {
      e.preventDefault();
      e.clipboardData.setData("text/html", rtlHtml);
      e.clipboardData.setData("text/plain", rtlPlain);
    } catch (err) {}
  }

  document.addEventListener("copy", onCopy);
  document.execCommand("copy");
  document.removeEventListener("copy", onCopy);

  sel.removeAllRanges();
  el.removeAttribute("contenteditable");
  $buf.empty();

  // Show copied state on the button
if ($btn && $btn.length) {
  showCopiedState($btn);
}

showBottom("تم نسخ تنسيق " + (label || ""));
}

  // -------------------------
  // Extract citation data
  // -------------------------
  function extractCitationData() {
    var titleAr = normalizeSpaces($(".arabica_article-title").first().text());
    var updateRaw = normalizeSpaces($(".arabica_article-info-wrapper .date-updated").first().text());

    var authors = [];
    $(".arabica_author-name").each(function () {
      var n = normalizeSpaces($(this).text());
      if (n) authors.push(n);
    });

    var shareUrl = $(".arabica_share-link").first().attr("data-share-url");
    var url = shareUrl || $('link[rel="canonical"]').attr("href") || window.location.href;

    return {
      titleAr: titleAr,
      authors: authors,
      updateRaw: updateRaw,
      pubDMY: getPubDMY(updateRaw),
      year: getYear(updateRaw),
      accessed: getAccessDMY(),
      url: url
    };
  }

  // -------------------------
  // Build citations
  // -------------------------
  function buildCitations(d) {
    var authors = d.authors || [];
    var editorial = isEditorialTeam(authors);

    var authorFFArr = [];
    var authorFIArr = [];
    var i, ff, fi;

    if (!editorial) {
      for (i = 0; i < authors.length; i++) {
        ff = formatFamilyFirst(authors[i]);
        fi = formatFamilyInitial(authors[i]);
        if (ff) authorFFArr.push(ff);
        if (fi) authorFIArr.push(fi);
      }
    }

    var authorFF = joinAuthorsArabicList(authorFFArr);
    var authorFI = joinAuthorsArabicList(authorFIArr);

    var titleQuoted = "&quot;" + d.titleAr + "&quot;";
    var titleHarvard = "’" + d.titleAr + "‘";

    var encIt = "<strong>الموسوعة العربية</strong>";
    var encPlain = "الموسوعة العربية";

    var pubDate = d.pubDMY;
    var year = d.year;
    var accessed = d.accessed;
    var url = d.url;

    // 1) الموسوعة العربية
    var arabicaHtml = editorial
      ? (titleQuoted + ". " + encIt + "، " + pubDate + ". شُوهد في " + accessed + "، في: " + linkHtml(url) + ".")
      : (escapeHtml(authorFF) + ". " + titleQuoted + ". " + encIt + "، " + pubDate + ". شُوهد في " + accessed + "، في: " + linkHtml(url) + ".");

    var arabicaPlain = editorial
      ? (titleQuoted + ". " + encPlain + "، " + pubDate + ". شُوهد في " + accessed + "، في: " + url + ".")
      : (authorFF + ". " + titleQuoted + ". " + encPlain + "، " + pubDate + ". شُوهد في " + accessed + "، في: " + url + ".");

    // 2) شيكاغو
    var chicagoHtml = editorial
      ? (titleQuoted + ". " + encIt + ". " + pubDate + ". " + linkHtml(url) + ".")
      : (escapeHtml(authorFF) + ". " + titleQuoted + ". " + encIt + ". " + pubDate + ". " + linkHtml(url) + ".");

    var chicagoPlain = editorial
      ? (titleQuoted + ". " + encPlain + ". " + pubDate + ". " + url + ".")
      : (authorFF + ". " + titleQuoted + ". " + encPlain + ". " + pubDate + ". " + url + ".");

    // 3) هارفرد
    var harvardHtml = editorial
      ? (titleHarvard + " (" + year + "). " + encIt + ". متاح على: " + linkHtml(url) + " (شُوهد: " + accessed + ").")
      : (escapeHtml(authorFI) + " (" + year + "). " + titleHarvard + " في " + encIt + ". متاح على: " + linkHtml(url) + " (شُوهد: " + accessed + ").");

    var harvardPlain = editorial
      ? (titleHarvard + " (" + year + "). " + encPlain + ". متاح على: " + url + " (شُوهد: " + accessed + ").")
      : (authorFI + " (" + year + "). " + titleHarvard + " في " + encPlain + ". متاح على: " + url + " (شُوهد: " + accessed + ").");

    // 4) APA
    var apaHtml = editorial
      ? (escapeHtml(d.titleAr) + ". (" + year + "). في " + encIt + ". شوهد في: " + linkHtml(url) + ".")
      : (escapeHtml(authorFI) + " (" + year + "). " + escapeHtml(d.titleAr) + ". في " + encIt + ". شوهد في: " + linkHtml(url) + ".");

    var apaPlain = editorial
      ? (d.titleAr + ". (" + year + "). في " + encPlain + ". شوهد في: " + url + ".")
      : (authorFI + " (" + year + "). " + d.titleAr + ". في " + encPlain + ". شوهد في: " + url + ".");

    // 5) MLA
    var mlaHtml = editorial
      ? (titleQuoted + ". " + encIt + "، " + year + "، " + linkHtml(url) + ".")
      : (escapeHtml(authorFF) + ". " + titleQuoted + ". " + encIt + "، " + year + "، " + linkHtml(url) + ".");

    var mlaPlain = editorial
      ? (titleQuoted + ". " + encPlain + "، " + year + "، " + url + ".")
      : (authorFF + ". " + titleQuoted + ". " + encPlain + "، " + year + "، " + url + ".");

    // Order: الموسوعة العربية، شيكاغو، هارفرد، APA، MLA
    return [
      { key: "arabica", label: "الموسوعة العربية", uiLabel: "الموسوعة العربية", html: arabicaHtml, plain: arabicaPlain },
      { key: "chicago", label: "شيكاغو", uiLabel: "شيكاغو", html: chicagoHtml, plain: chicagoPlain },
      { key: "harvard", label: "هارفرد", uiLabel: "هارفرد", html: harvardHtml, plain: harvardPlain },
      { key: "apa", label: "APA", uiLabel: "APA", html: apaHtml, plain: apaPlain },
      { key: "mla", label: "MLA", uiLabel: "MLA", html: mlaHtml, plain: mlaPlain }
    ];
  }

  // -------------------------
  // Render rows
  // -------------------------
  function renderRows(items) {
    var html = "";
    var i;
    for (i = 0; i < items.length; i++) {
      html += ''
        + '<div class="arabica_cite-row" data-cite-row="' + items[i].key + '">'
        + '  <div class="arabica_cite-label">' + escapeHtml(items[i].uiLabel) + '</div>'
        + '  <div class="arabica_cite-content">'
        + '    <span class="arabica_cite-text" data-cite-html="' + items[i].key + '"></span>'
        + '    <button type="button" class="arabica_cite-copybtn" aria-label="نسخ" data-copy="' + items[i].key + '" title="نسخ">'
        + '      <i class="fa-regular fa-copy"></i>'
        + '    </button>'
        + '  </div>'
        + '</div>';
    }
    $("#arbCiteRows").html(html);

    for (i = 0; i < items.length; i++) {
      var $node = $('[data-cite-html="' + items[i].key + '"]');
      $node.html(items[i].html);
      $node.data("plain", items[i].plain);
      $node.data("label", items[i].uiLabel);
    }
  }

  function openModal() {
  
  $('body').addClass('no-scroll');

  var d = extractCitationData();
  var items = buildCitations(d);
  renderRows(items);

  $("#citationModal")
    .fadeIn(200)
    .addClass("active");
}

function closeModal() {
  $("#citationModal")
    .removeClass("active")
    .fadeOut(200, function() {
      $("body").removeClass('no-scroll');
    });
}

  // -------------------------
// Bind events
// -------------------------
$(function () {
  $("#ArticleCitation").css("cursor", "pointer").on("click", function (e) {
    e.preventDefault();
    openModal();
  });

  // Close on X button and backdrop
  $(document).on("click", "[data-cite-close='1']", function () {
    closeModal();
  });

  // Close when clicking outside the panel (on the modal itself)
  $("#citationModal").on("click", function (e) {
    if ($(e.target).is("#citationModal")) {
      closeModal();
    }
  });

  $(document).on("click", ".arabica_cite-row", function (e) {
    if ($(e.target).closest(".arabica_cite-copybtn").length) return;
    $(".arabica_cite-row").removeClass("is-active");
    $(this).addClass("is-active");
  });

  $(document).on("click", ".arabica_cite-copybtn", function () {
    var key = $(this).attr("data-copy");
    var $node = $('[data-cite-html="' + key + '"]');
    if (!$node.length) return;

    $(".arabica_cite-row").removeClass("is-active");
    $('[data-cite-row="' + key + '"]').addClass("is-active");

    var html = $node.html();
    var plain = $node.data("plain") || normalizeSpaces($node.text());
    var label = $node.data("label") || "";
    copyRich(html, plain, label, $(this));
  });

  // Close on ESC - check for .active class
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && $("#citationModal").hasClass("active")) {
      closeModal();
    }
  });
});
})(jQuery);