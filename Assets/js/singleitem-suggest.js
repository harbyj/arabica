(function ($) {

  var FORMSUBMIT_URL  = "https://formsubmit.co/ajax/abioyeharbyj@gmail.com";
  var RECAPTCHA_KEY   = "6LcG97QsAAAAAGN8RKShZpevGTn1Xl5Kd1sm-IL9";  // ← replace with your site key

  var _capturedSelection  = null;
  var _suppressHide       = false;
  var _recaptchaWidgetId  = null;
  var _recaptchaReady     = false;

  // -------------------------
  // reCAPTCHA loader
  // -------------------------
  function loadRecaptcha() {
    if (document.getElementById("arbRecaptchaScript")) return;
    window.onArbRecaptchaLoad = function () {
      _recaptchaReady = true;
    };
    var s = document.createElement("script");
    s.id  = "arbRecaptchaScript";
    s.src = "https://www.google.com/recaptcha/api.js?onload=onArbRecaptchaLoad&render=explicit&hl=ar";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  function renderRecaptcha(callback) {
    // Already rendered
    if (_recaptchaWidgetId !== null) {
      grecaptcha.reset(_recaptchaWidgetId);
      if (callback) callback();
      return;
    }

    // grecaptcha ready — render now
    if (_recaptchaReady && typeof grecaptcha !== "undefined") {
      _recaptchaWidgetId = grecaptcha.render("arbSuggestCaptchaWidget", {
        sitekey: RECAPTCHA_KEY,
        theme:   "light",
        hl:      "ar"
      });
      if (callback) callback();
      return;
    }

    // Not ready yet — poll
    var attempts = 0;
    var poll = setInterval(function () {
      attempts++;
      if (typeof grecaptcha !== "undefined" && typeof grecaptcha.render === "function") {
        clearInterval(poll);
        _recaptchaWidgetId = grecaptcha.render("arbSuggestCaptchaWidget", {
          sitekey: RECAPTCHA_KEY,
          theme:   "light",
          hl:      "ar"
        });
        if (callback) callback();
      } else if (attempts > 40) {
        clearInterval(poll); // give up after 4s
      }
    }, 100);
  }

  function resetRecaptcha() {
    if (typeof grecaptcha !== "undefined" && _recaptchaWidgetId !== null) {
      grecaptcha.reset(_recaptchaWidgetId);
    }
  }

  function getRecaptchaResponse() {
    if (typeof grecaptcha !== "undefined" && _recaptchaWidgetId !== null) {
      return grecaptcha.getResponse(_recaptchaWidgetId);
    }
    return "";
  }

  // -------------------------
  // Helpers
  // -------------------------
  function normalizeSpaces(s) {
    return (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function showSuggestBottom(msg, isError) {
    var $bottom = $("#arbSuggestBottom");
    $bottom
      .toggleClass("is-error", !!isError)
      .find("#arbSuggestBottomText").text(msg || "تم الإرسال");
    $bottom.attr("aria-hidden", "false");
    clearTimeout(window.__arbSuggestBottomT);
    window.__arbSuggestBottomT = setTimeout(function () {
      $bottom.attr("aria-hidden", "true");
    }, 3000);
  }

  // -------------------------
  // Extract article data
  // -------------------------
  function extractArticleData() {
    var title = normalizeSpaces($(".arabica_article-title").first().text());
    var shareUrl = $(".arabica_share-link").first().attr("data-share-url");
    var url = shareUrl || $('link[rel="canonical"]').attr("href") || window.location.href;
    return { title: title, url: url };
  }

  // -------------------------
  // Validation
  // -------------------------
  function validateFields() {
    var valid = true;

    var name    = $.trim($("#arbSuggestName").val());
    var email   = $.trim($("#arbSuggestEmail").val());
    var comment = $.trim($("#arbSuggestComment").val());

    $("#arbSuggestName, #arbSuggestEmail, #arbSuggestComment").removeClass("has-error");
    $("#arbSuggestNameErr, #arbSuggestEmailErr, #arbSuggestCommentErr, #arbSuggestCaptchaErr").text("");

    if (!name) {
      $("#arbSuggestName").addClass("has-error");
      $("#arbSuggestNameErr").text("الاسم مطلوب.");
      valid = false;
    }

    if (!email) {
      $("#arbSuggestEmail").addClass("has-error");
      $("#arbSuggestEmailErr").text("البريد الإلكتروني مطلوب.");
      valid = false;
    } else if (!isValidEmail(email)) {
      $("#arbSuggestEmail").addClass("has-error");
      $("#arbSuggestEmailErr").text("صيغة البريد الإلكتروني غير صحيحة.");
      valid = false;
    }

    if (!comment) {
      $("#arbSuggestComment").addClass("has-error");
      $("#arbSuggestCommentErr").text("يرجى كتابة اقتراحك أو تعليقك.");
      valid = false;
    }

    // ---- reCAPTCHA check ----
    if (!getRecaptchaResponse()) {
      $("#arbSuggestCaptchaErr").text("يرجى التحقق من أنك لست روبوتاً.");
      valid = false;
    }

    return valid;
  }

  // -------------------------
  // Open / Close modal
  // -------------------------
  function openSuggestModal(selectedText) {
    var art = extractArticleData();

    if (selectedText && selectedText.length) {
      $("#arbSuggestSelectionText").text(selectedText);
      $("#arbSuggestSelectionBlock").show();
    } else {
      $("#arbSuggestSelectionText").text("");
      $("#arbSuggestSelectionBlock").hide();
    }

    $("#arbSuggestName, #arbSuggestEmail, #arbSuggestComment").val("").removeClass("has-error");
    $("#arbSuggestNameErr, #arbSuggestEmailErr, #arbSuggestCommentErr, #arbSuggestCaptchaErr").text("");
    $("#arbSuggestBottom").attr("aria-hidden", "true");
    $("#arbSuggestFooter").show();
    $("#arbSuggestSubmit").removeClass("is-loading").prop("disabled", false);

    $("body").addClass("no-scroll");
    $("#suggestionModal").fadeIn(200).addClass("active");

    // Render captcha after modal is visible
    renderRecaptcha();
  }

  function closeSuggestModal() {
    $("#suggestionModal").removeClass("active").fadeOut(200, function () {
      $("body").removeClass("no-scroll");
      $("#arbSuggestFooter").show();
      resetRecaptcha();
    });
  }

  // -------------------------
  // Submit via FormSubmit.co
  // -------------------------
  function submitSuggestion() {
    if (!validateFields()) return;

    var art     = extractArticleData();
    var name    = $.trim($("#arbSuggestName").val());
    var email   = $.trim($("#arbSuggestEmail").val());
    var comment = $.trim($("#arbSuggestComment").val());
    var selText = $.trim($("#arbSuggestSelectionText").text());

    var $btn = $("#arbSuggestSubmit");
    $btn.addClass("is-loading").prop("disabled", true);

    var payload = {
      _subject:               "اقتراح تعديل: " + (art.title || "مقالة غير معنونة"),
      _replyto:               email,
      _template:              "table",
      "الاسم":                name,
      "البريد الإلكتروني":    email,
      "المقالة":              art.title || "مقالة غير معنونة",
      "الرابط":               art.url,
      "الاقتراح":             comment,
      "g-recaptcha-response": getRecaptchaResponse()
    };

    if (selText) {
      payload["النص المقترح تعديله"] = selText;
    }

    $.ajax({
      url: FORMSUBMIT_URL,
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(payload),
      success: function () {
        $btn.removeClass("is-loading").prop("disabled", false);
        $("#arbSuggestFooter").hide();
        showSuggestBottom("تم إرسال اقتراحك بنجاح، شكراً لك!");
        $("#arbSuggestName, #arbSuggestEmail, #arbSuggestComment").val("");
        resetRecaptcha();
        setTimeout(function () { closeSuggestModal(); }, 2500);
      },
      error: function () {
        $btn.removeClass("is-loading").prop("disabled", false);
        resetRecaptcha();
        showSuggestBottom("حدث خطأ أثناء الإرسال، يرجى المحاولة مجدداً.", true);
      }
    });
  }

  // -------------------------
  // Selection Tooltip
  // -------------------------
  var $tooltip = null;
  var GAP = 4;

  function hideTooltip() {
    if (_suppressHide) return;
    if ($tooltip) {
      $tooltip.removeClass("is-visible is-below");
    }
    _capturedSelection = null;
  }

  function getLineCenterX(rects, anchorRect) {
    var minLeft   = anchorRect.left;
    var maxRight  = anchorRect.right;
    var tolerance = anchorRect.height * 0.6;
    for (var i = 0; i < rects.length; i++) {
      if (Math.abs(rects[i].top - anchorRect.top) < tolerance) {
        minLeft  = Math.min(minLeft,  rects[i].left);
        maxRight = Math.max(maxRight, rects[i].right);
      }
    }
    return minLeft + (maxRight - minLeft) / 2;
  }

  function showTooltip() {
    if (!$tooltip || !_capturedSelection) return;

    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    var vHeight = window.innerHeight;
    var vWidth  = window.innerWidth;

    $tooltip
      .removeClass("is-below")
      .css({ top: "-9999px", left: "-9999px" })
      .addClass("is-visible");

    var tW = $tooltip.outerWidth();
    var tH = $tooltip.outerHeight();

    var rects = _capturedSelection.range.getClientRects();
    if (!rects.length) { hideTooltip(); return; }

    var firstRect = rects[0];
    var lastRect  = rects[rects.length - 1];

    var spaceAbove = firstRect.top;
    var spaceBelow = vHeight - lastRect.bottom;
    var placeBelow = spaceAbove < (tH + GAP) && spaceBelow >= (tH + GAP);

    var topAbs;
    var anchorRect;

    if (placeBelow) {
      $tooltip.addClass("is-below");
      topAbs     = lastRect.bottom + scrollY + GAP;
      anchorRect = lastRect;
    } else {
      topAbs     = firstRect.top + scrollY - tH - GAP;
      anchorRect = firstRect;
    }

    var $article = $(".arabica_article-content");
    var artLeft  = scrollX + 6;
    var artRight = scrollX + vWidth - 6;

    if ($article.length) {
      var artRect = $article.get(0).getBoundingClientRect();
      artLeft  = artRect.left  + scrollX;
      artRight = artRect.right + scrollX;
    }

    var lineCenterX = getLineCenterX(rects, anchorRect);
    var leftAbs     = lineCenterX + scrollX - (tW / 2);

    if (leftAbs + tW > artRight) leftAbs = artRight - tW;
    if (leftAbs < artLeft)       leftAbs = artLeft;

    $tooltip.css({
      top:  topAbs  + "px",
      left: leftAbs + "px"
    });
  }

  function getSelectionHtml() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return "";
    var range = sel.getRangeAt(0);
    var div = document.createElement("div");
    div.appendChild(range.cloneContents());
    $(div).find(".arabica_ref-actions").remove();
    return div.innerHTML;
  }

  function onSelectionChange() {
    var sel = window.getSelection();

    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      hideTooltip();
      return;
    }

    var text = normalizeSpaces(sel.toString());
    if (!text) {
      hideTooltip();
      return;
    }

    var range    = sel.getRangeAt(0);
    var $article = $(".arabica_article-content");
    if (!$article.length) { hideTooltip(); return; }

    if (!$article.get(0).contains(range.commonAncestorContainer)) {
      hideTooltip();
      return;
    }

    if ($(range.commonAncestorContainer).closest(".arabica_ref-dropdown").length) {
      hideTooltip();
      return;
    }

    _capturedSelection = {
      text:  text,
      html:  getSelectionHtml(),
      range: range.cloneRange()
    };

    showTooltip();
  }

  // -------------------------
  // Copy with rich format
  // -------------------------
  function copySelection(html, plain) {
    var $tmp = $("<div>").html(html);
    $tmp.find(".arabica_ref-actions").remove();
    var cleanHtml  = $tmp.html();
    var cleanPlain = normalizeSpaces($tmp.text());

    var rtlHtml  = '<div dir="rtl" style="direction:rtl;unicode-bidi:embed;text-align:right;">' + cleanHtml + '</div>';
    var rtlPlain = "\u202B" + cleanPlain + "\u202C";

    var $buf = $("<div>").css({
      position: "absolute", left: "-9999px", top: "-9999px",
      opacity: 0, pointerEvents: "none"
    }).attr("contenteditable", "true").appendTo("body");

    $buf.html(rtlHtml);

    var el    = $buf.get(0);
    var range = document.createRange();
    range.selectNodeContents(el);

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    function onCopy(e) {
      try {
        e.preventDefault();
        e.clipboardData.setData("text/html",  rtlHtml);
        e.clipboardData.setData("text/plain", rtlPlain);
      } catch (err) {}
    }

    document.addEventListener("copy", onCopy);
    document.execCommand("copy");
    document.removeEventListener("copy", onCopy);

    sel.removeAllRanges();
    $buf.remove();
  }

  // -------------------------
  // Bind events
  // -------------------------
  $(function () {

    // ---- Load reCAPTCHA script lazily ----
    loadRecaptcha();

    // ---- Inject tooltip into DOM ----
    if (!$("#arbSelectionTooltip").length) {
      $("body").append(
        '<div id="arbSelectionTooltip" class="arabica_sel-tooltip" aria-hidden="true">' +
          '<button type="button" class="arabica_sel-btn" id="arbSelCopy">' +
            '<i class="fa-regular fa-copy"></i>' +
            '<span class="arabica_sel-btn-text">نسخ</span>' +
          '</button>' +
          '<div class="arabica_sel-divider"></div>' +
          '<button type="button" class="arabica_sel-btn" id="arbSelSuggest">' +
            '<i class="fa-regular fa-pen-to-square"></i>' +
            '<span class="arabica_sel-btn-text">اقتراح تعديل</span>' +
          '</button>' +
        '</div>'
      );
    }

    $tooltip = $("#arbSelectionTooltip");

    // ---- Modal trigger (article-level button) ----
    $("#ArticleSuggestion").css("cursor", "pointer").on("click", function (e) {
      e.preventDefault();
      openSuggestModal(null);
    });

    // ---- Modal close ----
    $(document).on("click", "[data-suggest-close='1']", function () {
      closeSuggestModal();
    });

    $("#suggestionModal").on("click", function (e) {
      if ($(e.target).is("#suggestionModal")) { closeSuggestModal(); }
    });

    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $("#suggestionModal").hasClass("active")) { closeSuggestModal(); }
    });

    $(document).on("click", "#arbSuggestSubmit", function () {
      submitSuggestion();
    });

    $(document).on("input", "#arbSuggestName, #arbSuggestEmail, #arbSuggestComment", function () {
      $(this).removeClass("has-error");
      var errId = "#arbSuggest" + this.id.replace("arbSuggest", "") + "Err";
      $(errId).text("");
    });

    // ---- Selection tooltip: selectionchange ----
    document.addEventListener("selectionchange", function () {
      clearTimeout(window.__arbSelT);
      window.__arbSelT = setTimeout(onSelectionChange, 120);
    });

    // ---- Reposition on scroll/resize ----
    $(window).on("scroll.arbSel resize.arbSel", function () {
      if (!$tooltip || !$tooltip.hasClass("is-visible") || !_capturedSelection) return;
      var rects = _capturedSelection.range.getClientRects();
      if (!rects.length) { hideTooltip(); return; }
      var firstRect = rects[0];
      var lastRect  = rects[rects.length - 1];
      if (lastRect.bottom < 0 || firstRect.top > window.innerHeight) {
        hideTooltip();
        return;
      }
      showTooltip();
    });

    // ---- Hide on outside click ----
    $(document).on("mousedown touchstart", function (e) {
      if (!$tooltip || !$tooltip.hasClass("is-visible")) return;
      if ($tooltip.is(e.target) || $tooltip.has(e.target).length) return;
      var $article = $(".arabica_article-content");
      if ($article.length && $article.get(0).contains(e.target)) return;
      hideTooltip();
    });

    // ---- Tooltip: Copy button ----
    $(document).on("click", "#arbSelCopy", function () {
      if (!_capturedSelection) return;

      _suppressHide = true;
      copySelection(_capturedSelection.html, _capturedSelection.text);

      var $btn   = $(this);
      var $icon  = $btn.find("i");
      var $label = $btn.find(".arabica_sel-btn-text");

      $btn.addClass("is-copied");
      $icon.removeClass("fa-regular fa-copy").addClass("fa-solid fa-check");
      $label.text("تم النسخ");

      clearTimeout(window.__arbSelCopyT);
      window.__arbSelCopyT = setTimeout(function () {
        _suppressHide = false;
        $btn.removeClass("is-copied");
        $icon.removeClass("fa-solid fa-check").addClass("fa-regular fa-copy");
        $label.text("نسخ");
        hideTooltip();
        window.getSelection().removeAllRanges();
      }, 2000);
    });

    // ---- Tooltip: Suggest button ----
    $(document).on("click", "#arbSelSuggest", function () {
      var text = _capturedSelection ? _capturedSelection.text : "";
      hideTooltip();
      window.getSelection().removeAllRanges();
      openSuggestModal(text);
    });

  });

})(jQuery);