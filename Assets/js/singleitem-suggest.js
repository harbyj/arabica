(function ($) {

  var FORMSUBMIT_URL = "https://formsubmit.co/ajax/abioyeharbyj@gmail.com";
  var RECAPTCHA_KEY  = "6LcG97QsAAAAAGN8RKShZpevGTn1Xl5Kd1sm-IL9";

  var _sel        = null;
  var _noHide     = false;
  var _rcId       = null;
  var _rcReady    = false;
  var $tip        = null;
  var GAP         = 4;

  // ---- reCAPTCHA ----
  function loadRC() {
    if (document.getElementById("_arbRC")) return;
    window.onArbRecaptchaLoad = function () { _rcReady = true; };
    var s = document.createElement("script");
    s.id = "_arbRC";
    s.src = "https://www.google.com/recaptcha/api.js?onload=onArbRecaptchaLoad&render=explicit&hl=ar";
    s.async = s.defer = true;
    document.head.appendChild(s);
  }

  function renderRC() {
    if (_rcId !== null) { grecaptcha.reset(_rcId); return; }
    var attempt = 0;
    var t = setInterval(function () {
      if (typeof grecaptcha !== "undefined" && grecaptcha.render) {
        clearInterval(t);
        _rcId = grecaptcha.render("arbSuggestCaptchaWidget", { sitekey: RECAPTCHA_KEY, theme: "light", hl: "ar" });
      } else if (++attempt > 40) clearInterval(t);
    }, 100);
  }

  function resetRC() { if (typeof grecaptcha !== "undefined" && _rcId !== null) grecaptcha.reset(_rcId); }
  function getRC()   { return (typeof grecaptcha !== "undefined" && _rcId !== null) ? grecaptcha.getResponse(_rcId) : ""; }

  // ---- Helpers ----
  function trim(s)  { return (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function showBottom(msg, isErr) {
    var $b = $("#arbSuggestBottom");
    $b.toggleClass("is-error", !!isErr).find("#arbSuggestBottomText").text(msg || "تم الإرسال");
    $b.attr("aria-hidden", "false");
    clearTimeout(window.__arbBT);
    window.__arbBT = setTimeout(function () { $b.attr("aria-hidden", "true"); }, 3000);
  }

  function articleData() {
    var title = trim($(".arabica_article-title").first().text());
    var url   = $(".arabica_share-link").first().attr("data-share-url") || $('link[rel="canonical"]').attr("href") || location.href;
    return { title: title, url: url };
  }

  // ---- Validation ----
  function validate() {
    var ok = true;
    var name = $.trim($("#arbSuggestName").val());
    var email = $.trim($("#arbSuggestEmail").val());
    var comment = $.trim($("#arbSuggestComment").val());

    $("#arbSuggestName,#arbSuggestEmail,#arbSuggestComment").removeClass("has-error");
    $("#arbSuggestNameErr,#arbSuggestEmailErr,#arbSuggestCommentErr,#arbSuggestCaptchaErr").text("");

    if (!name)                        { $("#arbSuggestName").addClass("has-error");    $("#arbSuggestNameErr").text("الاسم مطلوب.");                          ok = false; }
    if (!email)                       { $("#arbSuggestEmail").addClass("has-error");   $("#arbSuggestEmailErr").text("البريد الإلكتروني مطلوب.");              ok = false; }
    else if (!validEmail(email))      { $("#arbSuggestEmail").addClass("has-error");   $("#arbSuggestEmailErr").text("صيغة البريد الإلكتروني غير صحيحة.");    ok = false; }
    if (!comment)                     { $("#arbSuggestComment").addClass("has-error"); $("#arbSuggestCommentErr").text("يرجى كتابة اقتراحك أو تعليقك.");      ok = false; }
    if (!getRC())                     { $("#arbSuggestCaptchaErr").text("يرجى التحقق من أنك لست روبوتاً.");                                                   ok = false; }

    return ok;
  }

  // ---- Modal ----
  function openModal(selText) {
    if (selText) { $("#arbSuggestSelectionText").text(selText); $("#arbSuggestSelectionBlock").show(); }
    else         { $("#arbSuggestSelectionText").text("");       $("#arbSuggestSelectionBlock").hide(); }

    $("#arbSuggestName,#arbSuggestEmail,#arbSuggestComment").val("").removeClass("has-error");
    $("#arbSuggestNameErr,#arbSuggestEmailErr,#arbSuggestCommentErr,#arbSuggestCaptchaErr").text("");
    $("#arbSuggestBottom").attr("aria-hidden", "true");
    $("#arbSuggestFooter").show();
    $("#arbSuggestSubmit").removeClass("is-loading").prop("disabled", false);
    $("body").addClass("no-scroll");
    $("#suggestionModal").fadeIn(200).addClass("active");
    renderRC();
  }

  function closeModal() {
    $("#suggestionModal").removeClass("active").fadeOut(200, function () {
      $("body").removeClass("no-scroll");
      $("#arbSuggestFooter").show();
      resetRC();
    });
  }

  // ---- Submit ----
  function submit() {
    if (!validate()) return;
    var d       = articleData();
    var name    = $.trim($("#arbSuggestName").val());
    var email   = $.trim($("#arbSuggestEmail").val());
    var comment = $.trim($("#arbSuggestComment").val());
    var selText = $.trim($("#arbSuggestSelectionText").text());
    var $btn    = $("#arbSuggestSubmit").addClass("is-loading").prop("disabled", true);

    var payload = {
      _subject: "اقتراح تعديل: " + (d.title || "مقالة غير معنونة"),
      _replyto: email, _template: "table",
      "الاسم": name, "البريد الإلكتروني": email,
      "المقالة": d.title || "مقالة غير معنونة", "الرابط": d.url,
      "الاقتراح": comment, "g-recaptcha-response": getRC()
    };
    if (selText) payload["النص المقترح تعديله"] = selText;

    $.ajax({
      url: FORMSUBMIT_URL, method: "POST",
      contentType: "application/json", dataType: "json",
      data: JSON.stringify(payload),
      success: function () {
        $btn.removeClass("is-loading").prop("disabled", false);
        $("#arbSuggestFooter").hide();
        $("#arbSuggestName,#arbSuggestEmail,#arbSuggestComment").val("");
        resetRC();
        showBottom("تم إرسال اقتراحك بنجاح، شكراً لك!");
        setTimeout(closeModal, 2500);
      },
      error: function () {
        $btn.removeClass("is-loading").prop("disabled", false);
        resetRC();
        showBottom("حدث خطأ أثناء الإرسال، يرجى المحاولة مجدداً.", true);
      }
    });
  }

  // ---- Tooltip ----
  function hideTip() {
    if (_noHide) return;
    if ($tip) $tip.removeClass("is-visible is-below");
    _sel = null;
  }

  function lineCenterX(rects, anchor) {
    var l = anchor.left, r = anchor.right, tol = anchor.height * 0.6;
    for (var i = 0; i < rects.length; i++) {
      if (Math.abs(rects[i].top - anchor.top) < tol) {
        l = Math.min(l, rects[i].left);
        r = Math.max(r, rects[i].right);
      }
    }
    return l + (r - l) / 2;
  }

  function showTip() {
    if (!$tip || !_sel) return;
    var sY = pageYOffset, sX = pageXOffset, vH = innerHeight, vW = innerWidth;
    $tip.removeClass("is-below").css({ top: "-9999px", left: "-9999px" }).addClass("is-visible");
    var tW = $tip.outerWidth(), tH = $tip.outerHeight();
    var rects = _sel.range.getClientRects();
    if (!rects.length) { hideTip(); return; }
    var fR = rects[0], lR = rects[rects.length - 1];
    var below = fR.top < (tH + GAP) && (vH - lR.bottom) >= (tH + GAP);
    var anchor = below ? lR : fR;
    var top = below ? (lR.bottom + sY + GAP) : (fR.top + sY - tH - GAP);
    if (below) $tip.addClass("is-below");

    var $art = $(".arabica_article-content");
    var aL = sX + 6, aR = sX + vW - 6;
    if ($art.length) { var aR2 = $art[0].getBoundingClientRect(); aL = aR2.left + sX; aR = aR2.right + sX; }

    var left = lineCenterX(rects, anchor) + sX - (tW / 2);
    left = Math.max(aL, Math.min(left, aR - tW));
    $tip.css({ top: top + "px", left: left + "px" });
  }

  function getSelHtml() {
    var s = getSelection();
    if (!s || !s.rangeCount) return "";
    var d = document.createElement("div");
    d.appendChild(s.getRangeAt(0).cloneContents());
    $(d).find(".arabica_ref-actions").remove();
    return d.innerHTML;
  }

  function onSelChange() {
    var s = getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) { hideTip(); return; }
    var text = trim(s.toString());
    if (!text) { hideTip(); return; }
    var range = s.getRangeAt(0);
    var $art  = $(".arabica_article-content");
    if (!$art.length || !$art[0].contains(range.commonAncestorContainer)) { hideTip(); return; }
    if ($(range.commonAncestorContainer).closest(".arabica_ref-dropdown").length) { hideTip(); return; }
    _sel = { text: text, html: getSelHtml(), range: range.cloneRange() };
    showTip();
  }

  function copySel(html, plain) {
    var $t = $("<div>").html(html);
    $t.find(".arabica_ref-actions").remove();
    var rH = '<div dir="rtl" style="direction:rtl;unicode-bidi:embed;text-align:right;">' + $t.html() + '</div>';
    var rP = "\u202B" + trim($t.text()) + "\u202C";
    var $b = $("<div>").css({ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none" })
                       .attr("contenteditable", "true").appendTo("body").html(rH);
    var r = document.createRange(); r.selectNodeContents($b[0]);
    var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    function onCopy(e) { try { e.preventDefault(); e.clipboardData.setData("text/html", rH); e.clipboardData.setData("text/plain", rP); } catch(x){} }
    document.addEventListener("copy", onCopy);
    document.execCommand("copy");
    document.removeEventListener("copy", onCopy);
    sel.removeAllRanges(); $b.remove();
  }

  // ---- Init ----
  $(function () {
    loadRC();

    if (!$("#arbSelectionTooltip").length) {
      $("body").append(
        '<div id="arbSelectionTooltip" class="arabica_sel-tooltip">' +
          '<button type="button" class="arabica_sel-btn" id="arbSelCopy"><i class="fa-regular fa-copy"></i><span class="arabica_sel-btn-text">نسخ</span></button>' +
          '<div class="arabica_sel-divider"></div>' +
          '<button type="button" class="arabica_sel-btn" id="arbSelSuggest"><i class="fa-regular fa-pen-to-square"></i><span class="arabica_sel-btn-text">اقتراح تعديل</span></button>' +
        '</div>'
      );
    }
    $tip = $("#arbSelectionTooltip");

    $("#ArticleSuggestion").css("cursor", "pointer").on("click", function (e) { e.preventDefault(); openModal(null); });

    $(document)
      .on("click", "[data-suggest-close='1']", closeModal)
      .on("keydown", function (e) { if (e.key === "Escape" && $("#suggestionModal").hasClass("active")) closeModal(); })
      .on("click", "#arbSuggestSubmit", submit)
      .on("input", "#arbSuggestName,#arbSuggestEmail,#arbSuggestComment", function () {
        $(this).removeClass("has-error");
        $("#arbSuggest" + this.id.replace("arbSuggest", "") + "Err").text("");
      })
      .on("mousedown touchstart", function (e) {
        if (!$tip || !$tip.hasClass("is-visible")) return;
        if ($tip.is(e.target) || $tip.has(e.target).length) return;
        var $art = $(".arabica_article-content");
        if ($art.length && $art[0].contains(e.target)) return;
        hideTip();
      })
      .on("click", "#arbSelCopy", function () {
        if (!_sel) return;
        _noHide = true;
        copySel(_sel.html, _sel.text);
        var $b = $(this), $i = $b.find("i"), $l = $b.find(".arabica_sel-btn-text");
        $b.addClass("is-copied"); $i.removeClass("fa-regular fa-copy").addClass("fa-solid fa-check"); $l.text("تم النسخ");
        clearTimeout(window.__arbCT);
        window.__arbCT = setTimeout(function () {
          _noHide = false;
          $b.removeClass("is-copied"); $i.removeClass("fa-solid fa-check").addClass("fa-regular fa-copy"); $l.text("نسخ");
          hideTip(); getSelection().removeAllRanges();
        }, 2000);
      })
      .on("click", "#arbSelSuggest", function () {
        var t = _sel ? _sel.text : "";
        hideTip(); getSelection().removeAllRanges(); openModal(t);
      });

    $("#suggestionModal").on("click", function (e) { if ($(e.target).is("#suggestionModal")) closeModal(); });

    document.addEventListener("selectionchange", function () {
      clearTimeout(window.__arbST);
      window.__arbST = setTimeout(onSelChange, 120);
    });

    $(window).on("scroll.arbSel resize.arbSel", function () {
      if (!$tip || !$tip.hasClass("is-visible") || !_sel) return;
      var rects = _sel.range.getClientRects();
      if (!rects.length) { hideTip(); return; }
      if (rects[rects.length-1].bottom < 0 || rects[0].top > innerHeight) { hideTip(); return; }
      showTip();
    });
  });

})(jQuery);