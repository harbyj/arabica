
// mathjax-arabica.js — full corrected script
!(function () {
    var e = window.location.search.toLowerCase(),
        t = window.location.hash.toLowerCase();
    if (
        !(
            e.indexOf("mode=edit") > -1 ||
            t.indexOf("mode=edit") > -1 ||
            document.querySelector(".sp-pageLayout-editMode") ||
            document.querySelector('#spPageCanvasContent [contenteditable="true"]')
        )
    ) {
        var n = document.querySelector("#MSOLayout_InDesignMode");
        if (!((n && "1" === n.value) || (window._spPageContextInfo && window._spPageContextInfo.isEditMode))) {
            var o = document.getElementById("MSOSPWebPartManager_DisplayModeName");
            if (!o || "Design" !== o.value) {
                var r = /[\u2060-\u2064\u200B-\u200F\u061C\u202A-\u202C\u2066-\u2069\uFEFF]/g;
                document.addEventListener("copy", function (e) {
                    var t = window.getSelection();
                    if (t && t.rangeCount && t.toString()) {
                        for (
                            var n = t.getRangeAt(0),
                                o = document.querySelectorAll("mjx-container, math"),
                                a = !1,
                                i = 0;
                            i < o.length;
                            i++
                        )
                            if (n.intersectsNode(o[i])) {
                                a = !0;
                                break;
                            }
                        if (a) {
                            var c = t.toString().replace(r, "");
                            e.clipboardData.setData("text/plain", c);
                            var s = document.createElement("div");
                            s.appendChild(n.cloneContents());
                            var u = s.innerHTML.replace(r, "");
                            e.clipboardData.setData("text/html", u), e.preventDefault();
                        }
                    }
                }),
                "loading" === document.readyState
                    ? document.addEventListener("DOMContentLoaded", a)
                    : a();
            }
        }
    }

   function a() {
    var e = document.getElementById("mathjax-content"),
        t = e ? "#mathjax-content" : null;

    if (!t) {
        var n = document.body ? document.body.innerHTML : "";
        if (n.indexOf("\\(") === -1 && n.indexOf("\\[") === -1) return;
    }

    if (e) {
        for (var o = e.parentElement; o; ) {
            if (o.getAttribute && o.getAttribute("contenteditable") === "true") return;
            o = o.parentElement;
        }
    }

    var r = document.createElement("style");
    r.textContent = `
        mjx-container[display="block"] {
            display: block;
            text-align: center;
            margin: 1em 0;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 768px) {
            .inline-math {
                display: inline-flex;
                max-width: 100%;
                overflow-x: auto;
                overflow-y: hidden;
                vertical-align: middle;
                -webkit-overflow-scrolling: touch;
            }
        }
    `;
    document.head.appendChild(r);

    window.MathJax = {
        tex: {
            inlineMath: [["\\(", "\\)"]],
            displayMath: [["\\[", "\\]"]]
        },
        chtml: {
            linebreaks: {
                automatic: true,
                width: "container"
            }
        },
        options: {
            ignoreHtmlClass: "sp-.*|od-.*|canvasTextArea",
            processHtmlClass: "mathjax-content"
        },
        startup: {
            elements: t ? [t] : null,
            pageReady: function () {
                return MathJax.startup.defaultPageReady();
            }
        }
    };

    var a = document.createElement("script");
    // ✅ No /es5/ — MathJax 4 removed that directory
    a.src = "https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js";
    a.async = true;
    document.head.appendChild(a);
}
})(),
    (function () {
        "use strict";
        var e = null,
            t = null,
            n = 0,
            o = 1e3,
            r = 1e3,
            a = 3e3,
            i = null;
        function c() {
            clearTimeout(i),
                (i = setTimeout(function () {
                    x(), v();
                }, a));
        }
        function s() {
            clearTimeout(i), (i = null);
        }
        function u(e) {
            for (
                var t = (function () {
                        try {
                            var e = MathJax.startup.document.math;
                            if ("function" == typeof e.toArray) return e.toArray();
                            if ("undefined" != typeof Symbol && e[Symbol.iterator]) return Array.from(e);
                            if (e._list) return e._list;
                        } catch (e) {}
                        return [];
                    })(),
                    n = 0;
                n < t.length;
                n++
            )
                if (t[n].typesetRoot === e) return t[n];
            return null;
        }
        function l() {
            (window.location.search || "").toLowerCase().indexOf("mode=edit") > -1 ||
                document.querySelector(".sp-pageLayout-editMode") ||
                document.querySelector('#spPageCanvasContent [contenteditable="true"]') ||
                (n++,
                window.MathJax && MathJax.startup && MathJax.startup.promise
                    ? MathJax.startup.promise.then(m).catch(m)
                    : n < 60 && setTimeout(l, 500));
        }
        function m() {
            for (var e = document.querySelectorAll("mjx-container"), t = 0; t < e.length; t++)
                e[t].classList.add("math-copy-target"),
                    e[t].addEventListener("click", d),
                    e[t].addEventListener("mouseenter", s),
                    e[t].addEventListener("mouseleave", c);
            document.addEventListener("click", p, !0),
                document.addEventListener("keydown", function (e) {
                    "Escape" === e.key && v();
                }),
                console.log("[MathCopy] click-to-open ready (" + e.length + ")");
        }
        function d(n) {
            n.stopPropagation();
            var o = this;
            if (
                (function (e, t) {
                    var n = document.elementFromPoint(e.clientX, e.clientY);
                    return !!n && !!t.contains(n) && n !== t;
                })(n, o)
            )
                if ((s(), e && t === o)) f(e, n.clientX, n.clientY);
                else {
                    v();
                    var r = document.createElement("div");
                    (r.className = "math-copy-btns"),
                        (r._target = o),
                        r.appendChild(
                            h("نسخ LaTeX", "math-copy-latex", function () {
                                y(o, "latex", this);
                            })
                        ),
                        r.appendChild(
                            h("نسخ MathML", "math-copy-mathml", function () {
                                y(o, "mathml", this);
                            })
                        ),
                        r.addEventListener("click", function (e) {
                            e.stopPropagation();
                        }),
                        r.addEventListener("mouseenter", s),
                        r.addEventListener("mouseleave", c),
                        document.body.appendChild(r),
                        (e = r),
                        (t = o),
                        f(r, n.clientX, n.clientY);
                }
        }
        function p(t) {
            e && (e.contains(t.target) || (t.target && t.target.closest && t.target.closest("math")) || v());
        }
        function f(e, t, n) {
            var o = t + window.scrollX,
                r = n + window.scrollY,
                a = e.querySelector(".math-copy-mathml");
            if (!a) return (e.style.left = o + 6 + "px"), void (e.style.top = r + 6 + "px");
            var i = a.getBoundingClientRect(),
                c = e.getBoundingClientRect(),
                s = o - (i.left - c.left + i.width / 2),
                u = r - (i.top - c.top + i.height / 2),
                l = e.offsetWidth,
                m = e.offsetHeight,
                d = window.scrollX + 4,
                p = window.scrollX + window.innerWidth - l - 4,
                f = window.scrollY + 4,
                h = window.scrollY + window.innerHeight - m - 4;
            (s = Math.max(d, Math.min(s, p))),
                (u = Math.max(f, Math.min(u, h))),
                (e.style.left = s + "px"),
                (e.style.top = u + "px");
        }
        function h(e, t, n) {
            var o = document.createElement("button");
            return (
                (o.type = "button"),
                (o.className = t),
                (o.textContent = e),
                o.addEventListener("click", function (e) {
                    e.stopPropagation(), n.call(this);
                }),
                o
            );
        }
        function v() {
            clearTimeout(i), (i = null), e && e.remove(), (e = null), (t = null);
        }
        function y(e, t, n) {
            var o = u(e),
                r = "";
            if ("latex" === t) {
                var a = o ? o.math : "";
                if (!a) return M(n, "فارغ!", "math-copy-error", n._restoreLabel || "نسخ LaTeX"), void g();
                r = o.display ? "\\[" + a + "\\]" : "\\(" + a + "\\)";
            } else if (
                ((r = (function (e) {
                    if (!e) return "";
                    if (e.typesetRoot) {
                        var t = e.typesetRoot.querySelector("math");
                        if (t) return w(t.outerHTML);
                    }
                    try {
                        var n = MathJax.startup.toMML(e.root);
                        if (n) return w(n);
                    } catch (e) {}
                    return "";
                })(o)),
                !r)
            )
                return M(n, "خطأ!", "math-copy-error", n._restoreLabel || "نسخ MathML"), void g();
            var i =
                navigator.clipboard && navigator.clipboard.writeText
                    ? navigator.clipboard.writeText(r)
                    : (function (e) {
                          return new Promise(function (t) {
                              var n = document.createElement("textarea");
                              (n.value = e),
                                  (n.style.cssText = "position:fixed;left:-9999px;opacity:0"),
                                  document.body.appendChild(n),
                                  n.select();
                              try {
                                  document.execCommand("copy");
                              } catch (e) {}
                              document.body.removeChild(n), t();
                          });
                      })(r);
            i.then(function () {
                M(n, "تم النسخ!", "math-copy-success", "latex" === t ? "نسخ LaTeX" : "نسخ MathML"), g();
            });
        }
        function g() {
            setTimeout(function () {
                x(), v();
            }, r);
        }
        function x() {
            try {
                var e = window.getSelection && window.getSelection();
                e && e.removeAllRanges && e.removeAllRanges();
            } catch (e) {}
        }
        function w(e) {
            return (e = (e = (e = (e = (e = (e = (e = (e = e.replace(
                /[\u2060-\u2064\u200B-\u200F\u061C\u202A-\u202C\u2066-\u2069\uFEFF]/g,
                ""
            )).replace(/&#x(206[0-9a-f]|200[b-f]|061c|202[a-c]|feff);/gi, "")).replace(
                /<mo[^>]*>\s*<\/mo>/g,
                ""
            )).replace(/ data-[a-z-]+="[^"]*"/g, "")).replace(
                /<msup>\s*<mi\s*\/?\s*>\s*(<\/mi>)?\s*(<mo[^>]*>[^<]*<\/mo>)\s*<\/msup>/g,
                "$2"
            )).replace(/<mo([^>]*)>([⏟⏞])<\/mo>/g, function (e, t, n) {
                return (
                    "<mo" +
                    (t = t.replace(/\s*stretchy="[^"]*"/, "")) +
                    ' stretchy="true" style="math-depth:0;">' +
                    n +
                    "</mo>"
                );
            })).replace(
                /<munder([^>]*)>\s*<mrow>\s*(<munder[\s\S]*?<\/munder>)\s*<\/mrow>\s*<mrow>\s*(<mtext>[\s\S]*?<\/mtext>)\s*<\/mrow>\s*<\/munder>/g,
                "<munder$1>$2$3</munder>"
            )).replace(
                /<mover([^>]*)>\s*<mrow>\s*(<mover[\s\S]*?<\/mover>)\s*<\/mrow>\s*<mrow>\s*(<mtext>[\s\S]*?<\/mtext>)\s*<\/mrow>\s*<\/mover>/g,
                "<mover$1>$2$3</mover>"
            ));
        }
        function M(e, t, n, r) {
            e._restoreLabel || (e._restoreLabel = r),
                (e.textContent = t),
                e.classList.remove("math-copy-success", "math-copy-error"),
                e.classList.add(n),
                setTimeout(function () {
                    (e.textContent = e._restoreLabel), e.classList.remove("math-copy-success", "math-copy-error");
                }, o);
        }
        var L = /[\u2060-\u2064\u200B-\u200F\u061C\u202A-\u202C\u2066-\u2069\uFEFF]/g;
        document.addEventListener("copy", function (e) {
            var t = window.getSelection();
            if (t && t.rangeCount && t.toString()) {
                for (
                    var n = t.getRangeAt(0), o = document.querySelectorAll("mjx-container, math"), r = !1, a = 0;
                    a < o.length;
                    a++
                )
                    if (n.intersectsNode(o[a])) {
                        r = !0;
                        break;
                    }
                if (r) {
                    var i = t.toString().replace(L, "");
                    e.clipboardData.setData("text/plain", i);
                    var c = document.createElement("div");
                    c.appendChild(n.cloneContents());
                    var s = c.innerHTML.replace(L, "");
                    e.clipboardData.setData("text/html", s), e.preventDefault();
                }
            }
        }),
            "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", l) : l();
    })();
