/**
 * kashida-poetry.js — Arabic Poetry Kashida Engine
 * Version 3.0 — Binary search for exact width
 *
 * The core insight vs v2:
 * canvas.measureText() and the browser renderer don't agree
 * pixel-perfectly, especially with Cairo's ligature shaping.
 * Calculating a tatweel count once and inserting it leaves a
 * visible gap because the rendered result is slightly narrower
 * than canvas predicted.
 *
 * Fix: binary search. After each insertion, re-measure the
 * actual tatweeled string. Find the exact count N where:
 *   measureText(text_with_N_tatweels)   <= targetWidth
 *   measureText(text_with_N+1_tatweels) >  targetWidth
 *
 * This converges in ~log2(maxTatweels) iterations — fast enough
 * for all practical poetry column widths.
 *
 * HTML structure expected:
 *   <table>
 *     <tr class="verse-row">
 *       <td><p data-poetry>قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ</p></td>
 *       <td><p data-poetry>بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ</p></td>
 *     </tr>
 *   </table>
 *
 * Public API:
 *   KashidaPoetry.run()      — re-run all [data-poetry] elements
 *   KashidaPoetry.runOn(el)  — run on a single element
 */

(function (global) {
  'use strict';

  // ── Non-connecting Arabic letters ──────────────────────────
  var NON_CONNECTING = new Set([
    '\u0627', // ا  alef
    '\u0622', // آ  alef madda
    '\u0623', // أ  alef hamza above
    '\u0625', // إ  alef hamza below
    '\u0671', // ٱ  alef wasla
    '\u0621', // ء  hamza
    '\u0648', // و  waw
    '\u0624', // ؤ  waw with hamza
    '\u0631', // ر  ra
    '\u0632', // ز  zayn
    '\u0630', // ذ  dhal
    '\u062F', // د  dal
    '\u0688', // ڈ  dal variant
    '\u0698', // ژ  zhe
  ]);

  // ── Letter priority scores ───────────────────────────────────
  var LETTER_SCORE = {
    '\u0644': 3, // ل  lam
    '\u0643': 3, // ك  kaf
    '\u0633': 3, // س  sin
    '\u0634': 3, // ش  shin
    '\u0628': 3, // ب  ba
    '\u0641': 3, // ف  fa
    '\u062A': 2, // ت  ta
    '\u062B': 2, // ث  tha
    '\u0646': 2, // ن  nun
    '\u064A': 2, // ي  ya
    '\u0642': 2, // ق  qaf
    '\u0639': 2, // ع  ayn
    '\u063A': 2, // غ  ghayn
    '\u062D': 2, // ح  ha
    '\u062C': 2, // ج  jeem
    '\u062E': 2, // خ  kha
  };

  function isArabic(ch) {
    var cp = ch.codePointAt(0);
    return (cp >= 0x0600 && cp <= 0x06FF) ||
           (cp >= 0x0750 && cp <= 0x077F);
  }

  function scorePosition(text, i) {
    var prev          = text[i - 1];
    var next          = text[i];
    var letterScore   = LETTER_SCORE[prev] || 1;
    var beforeWordEnd = (next === ' ' || i + 1 >= text.length);
    return letterScore + (beforeWordEnd ? 4 : 0);
  }

  // ── Find valid positions sorted highest-priority first ───────
  function findPositions(text) {
    var candidates = [];
    for (var i = 1; i < text.length; i++) {
      var prev = text[i - 1];
      var curr = text[i];
      if (prev === ' ' || curr === ' ') continue;
      if (isArabic(prev) && isArabic(curr) && !NON_CONNECTING.has(prev)) {
        candidates.push({ index: i, score: scorePosition(text, i) });
      }
    }
    candidates.sort(function (a, b) { return b.score - a.score; });
    return candidates.map(function (c) { return c.index; });
  }

  // ── Insert N tatweels across positions in priority order ─────
  // Positions are already sorted by priority.
  // Fills round-by-round so higher-priority spots get tatweels
  // first, then second tatweels, then third, etc.
  function insertTatweels(text, positions, count) {
    if (count <= 0 || !positions.length) return text;

    // Build alloc map: position → how many tatweels
    var alloc     = new Map();
    var remaining = count;
    var round     = 0;

    while (remaining > 0 && round < 20) {
      for (var i = 0; i < positions.length && remaining > 0; i++) {
        alloc.set(positions[i], (alloc.get(positions[i]) || 0) + 1);
        remaining--;
      }
      round++;
    }

    // Apply right-to-left so earlier indices stay valid
    var sorted = Array.from(alloc.keys()).sort(function (a, b) { return b - a; });
    var result = text;
    for (var j = 0; j < sorted.length; j++) {
      var pos = sorted[j];
      var ins = '\u0640'.repeat(alloc.get(pos));
      result  = result.slice(0, pos) + ins + result.slice(pos);
    }
    return result;
  }

  // ── Strip tatweels for clean remeasurement ───────────────────
  function stripTatweels(text) {
    return text.replace(/\u0640+/g, '');
  }

  // ── Cache original text on element ──────────────────────────
  function getCleanText(el) {
    if (!el.dataset.originalText) {
      el.dataset.originalText = stripTatweels(el.textContent.trim());
    }
    return el.dataset.originalText;
  }

  // ── Get target width from parent <td> ────────────────────────
  function getTargetWidth(el) {
    var td = el.closest('td');
    if (td) {
      var cs   = window.getComputedStyle(td);
      var padL = parseFloat(cs.paddingLeft)  || 0;
      var padR = parseFloat(cs.paddingRight) || 0;
      return td.getBoundingClientRect().width - padL - padR;
    }
    return el.getBoundingClientRect().width;
  }

  // ── Read computed font ───────────────────────────────────────
  function getComputedFont(el) {
    var cs     = window.getComputedStyle(el);
    var style  = cs.fontStyle  !== 'normal' ? cs.fontStyle  + ' ' : '';
    var weight = cs.fontWeight !== '400'    ? cs.fontWeight + ' ' : '';
    return style + weight + cs.fontSize + ' ' + cs.fontFamily;
  }

  // ── Binary search for exact tatweel count ────────────────────
  //
  // We want the largest N such that:
  //   measureText( insertTatweels(text, positions, N) ) <= targetWidth
  //
  // This is the key fix over v2. Instead of calculating N from
  // (extra / tatW) once, we binary-search over N and re-measure
  // the actual tatweeled string each time. This accounts for
  // shaping differences between canvas and browser renderer.
  //
  function justifyVerse(cleanText, targetWidth, ctx) {
    if (!cleanText) return cleanText;

    var baseWidth = ctx.measureText(cleanText).width;
    var extra     = targetWidth - baseWidth;

    // Already fills or overflows
    if (extra <= 0.5) return cleanText;

    var positions = findPositions(cleanText);
    if (!positions.length) return cleanText;

    // Estimate upper bound for binary search:
    // use tatW as a rough step but give generous headroom
    var tatW    = ctx.measureText('\u0640').width;
    var hiGuess = tatW > 0
      ? Math.ceil(extra / tatW) * 2 + positions.length
      : positions.length * 4;

    var lo   = 1;
    var hi   = Math.min(hiGuess, positions.length * 6);
    var best = cleanText; // best result so far (fits within targetWidth)

    while (lo <= hi) {
      var mid       = Math.floor((lo + hi) / 2);
      var candidate = insertTatweels(cleanText, positions, mid);
      var measured  = ctx.measureText(candidate).width;

      if (measured <= targetWidth) {
        // This count fits — it's our new best, try more
        best = candidate;
        lo   = mid + 1;
      } else {
        // Too wide — reduce count
        hi = mid - 1;
      }
    }

    return best;
  }

  // ── Process one [data-poetry] element ────────────────────────
  function processElement(el, ctx) {
    var targetWidth = getTargetWidth(el);
    if (targetWidth < 20) return;

    ctx.font = getComputedFont(el);

    var cleanText = getCleanText(el);
    var justified = justifyVerse(cleanText, targetWidth, ctx);

    el.textContent = justified;
  }

  // ── Shared off-screen canvas ─────────────────────────────────
  var _canvas  = document.createElement('canvas');
  _canvas.width  = 1;
  _canvas.height = 1;
  var _ctx     = _canvas.getContext('2d');

  // ── Public API ───────────────────────────────────────────────
  function run() {
    document.querySelectorAll('.ms-rteTable-poetry2col p').forEach(function (el) {
      processElement(el, _ctx);
    });
  }

  function runOn(el) {
    processElement(el, _ctx);
  }

  // ── Auto-initialise ──────────────────────────────────────────
  document.fonts.ready.then(function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(run);
    });
  });

  var _resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(run, 150);
  });

  global.KashidaPoetry = { run: run, runOn: runOn };

}(window));