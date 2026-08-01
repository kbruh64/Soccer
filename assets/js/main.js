/* ==========================================================================
   THE CHARTER RECORDS
   No scroll event listeners anywhere in this file. Scroll work is done by
   IntersectionObserver and by CSS scroll timelines declared in main.css.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------------
     1. IMAGE STATES. Loading skeleton, loaded, and a labelled error panel.
     ------------------------------------------------------------------------ */
  function settleImage(img) {
    var host = img.parentElement;
    if (!host) return;
    host.classList.add("is-loaded");
  }

  function failImage(img) {
    var host = img.parentElement;
    if (!host) return;
    host.classList.add("is-loaded");
    if (host.querySelector(".img-error")) return;

    var panel = document.createElement("div");
    panel.className = "img-error";
    panel.setAttribute("role", "img");
    panel.setAttribute("aria-label", img.alt || "Photograph unavailable");

    var title = document.createElement("b");
    title.textContent = "Plate unavailable";

    var body = document.createElement("span");
    body.textContent = img.alt || "This photograph could not be loaded.";

    panel.appendChild(title);
    panel.appendChild(body);
    host.appendChild(panel);
    img.style.visibility = "hidden";
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-img]"), function (img) {
    if (img.complete) {
      if (img.naturalWidth > 0) settleImage(img);
      else failImage(img);
      return;
    }
    img.addEventListener("load", function () { settleImage(img); }, { once: true });
    img.addEventListener("error", function () { failImage(img); }, { once: true });
  });

  /* ------------------------------------------------------------------------
     2. SCROLL REVEAL. Motivated: it establishes reading order chapter by
     chapter rather than dropping a whole section in at once.
     ------------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reduced.matches) {
    Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });

    Array.prototype.forEach.call(revealTargets, function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------------------
     3. COUNTERS. Motivated: the figures are the argument of those cells, so
     they resolve rather than simply appear. Runs once, off the main thread
     work of layout, using transform-free text updates.
     ------------------------------------------------------------------------ */
  var counters = document.querySelectorAll("[data-count]");

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;

    if (reduced.matches) { el.textContent = String(target); return; }

    var duration = 1100;
    var started = null;

    function frame(now) {
      if (started === null) started = now;
      var t = Math.min((now - started) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = String(target);
    }
    requestAnimationFrame(frame);
  }

  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(counters, function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  } else {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    Array.prototype.forEach.call(counters, function (el) {
      el.textContent = "0";
      countObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     4. ACTIVE SECTION IN THE NAV. Motivated: the reader should always know
     which chapter they are in.
     ------------------------------------------------------------------------ */
  var navLinks = document.querySelectorAll("[data-nav]");
  var sectionMap = {};

  Array.prototype.forEach.call(navLinks, function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) sectionMap[id] = { link: link, section: section };
  });

  function clearCurrent() {
    Array.prototype.forEach.call(navLinks, function (l) { l.removeAttribute("aria-current"); });
  }

  if ("IntersectionObserver" in window) {
    var visible = {};
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      var bestId = null;
      var bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      });

      clearCurrent();
      if (bestId && sectionMap[bestId]) {
        sectionMap[bestId].link.setAttribute("aria-current", "true");
      }
    }, { threshold: [0, 0.15, 0.4, 0.75], rootMargin: "-20% 0px -40% 0px" });

    Object.keys(sectionMap).forEach(function (id) {
      sectionObserver.observe(sectionMap[id].section);
    });
  }

  /* ------------------------------------------------------------------------
     5. MENU. Hamburger morphs to a cross, panel reveals with a stagger.
     ------------------------------------------------------------------------ */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
    } else {
      menu.classList.remove("is-open");
      menu.hidden = true;
    }
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });

    Array.prototype.forEach.call(menu.querySelectorAll("[data-menu]"), function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        burger.focus();
      }
    });

    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------------
     6. MAGNETIC CTA. Pointer driven, not scroll driven. Motivated: it gives
     the single primary action on the page a physical pull.
     ------------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll("[data-magnetic]"), function (el) {
    if (reduced.matches || !window.matchMedia("(pointer: fine)").matches) return;

    var frame = null;

    function move(e) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = null;
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        el.style.setProperty("--mx", dx.toFixed(2) + "px");
        el.style.setProperty("--my", dy.toFixed(2) + "px");
      });
    }

    function reset() {
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    }

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("blur", reset);
  });

  /* ------------------------------------------------------------------------
     7. ARCHIVE FILTER. Carries the empty state and the input validation.
     ------------------------------------------------------------------------ */
  var form = document.getElementById("filter");
  var input = document.getElementById("q");
  var index = document.getElementById("index");
  var empty = document.getElementById("empty");
  var count = document.getElementById("q-count");
  var err = document.getElementById("q-err");
  var emptyReset = document.getElementById("empty-reset");

  if (form && input && index && empty && count && err) {
    var rows = Array.prototype.slice.call(index.querySelectorAll(".index__row"));
    var total = rows.length;

    var haystacks = rows.map(function (row) {
      return (row.textContent + " " + (row.getAttribute("data-tags") || "")).toLowerCase();
    });

    function apply(raw) {
      var query = String(raw || "").trim().toLowerCase();

      var tooLong = query.length > 40;
      err.hidden = !tooLong;
      input.setAttribute("aria-invalid", tooLong ? "true" : "false");
      if (tooLong) return;

      var shown = 0;
      rows.forEach(function (row, i) {
        var hit = query === "" || haystacks[i].indexOf(query) !== -1;
        row.hidden = !hit;
        if (hit) shown++;
      });

      empty.hidden = shown !== 0;
      index.hidden = shown === 0;

      if (query === "") {
        count.textContent = total + " entries, 1886 to 2026";
      } else if (shown === 0) {
        count.textContent = "No entries match “" + query + "”";
      } else {
        count.textContent = shown + (shown === 1 ? " entry" : " entries") + " of " + total;
      }
    }

    var debounce = null;
    input.addEventListener("input", function () {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(function () { apply(input.value); }, 120);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (debounce) clearTimeout(debounce);
      apply(input.value);
    });

    form.addEventListener("reset", function () {
      setTimeout(function () { apply(""); input.focus(); }, 0);
    });

    if (emptyReset) {
      emptyReset.addEventListener("click", function () {
        input.value = "";
        apply("");
        input.focus();
      });
    }

    apply("");
  }

  /* ------------------------------------------------------------------------
     8. RAIL KEYBOARD ACCESS. The presidents rail scrolls horizontally, so it
     needs arrow keys once focused.
     ------------------------------------------------------------------------ */
  var rail = document.querySelector(".rail");
  if (rail) {
    rail.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var step = rail.clientWidth * 0.8;
      rail.scrollBy({
        left: e.key === "ArrowRight" ? step : -step,
        behavior: reduced.matches ? "auto" : "smooth"
      });
    });
  }
})();
