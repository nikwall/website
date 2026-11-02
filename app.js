// nikwall.de: the two story streams and the jump-link bar.
// The page works without this script: both streams show in full, "More" opens on its own (<details>),
// and the "Alongside" links jump to the linked block.
(function () {
  var story = document.querySelector(".story");
  if (story) streams(story);
  scrollspy();

  function streams(story) {
    var blocks = [].slice.call(story.querySelectorAll(".st-block[data-g]"));
    var filter = story.querySelector(".st-filter");

    // Show both streams, or one of them.
    filter.hidden = false;
    filter.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-show]");
      if (!btn) return;
      filter.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      story.setAttribute("data-show", btn.getAttribute("data-show"));
    });

    // Point at a block: the blocks it belongs with light up in both streams, and so do their years.
    function keys(el) { return el.getAttribute("data-g").split(" ").filter(Boolean); }
    function show(el) {
      var mine = keys(el);
      story.classList.add("active");
      blocks.forEach(function (b) {
        var on = b === el || keys(b).some(function (k) { return mine.indexOf(k) >= 0; });
        b.classList.toggle("hl", on);
      });
      story.querySelectorAll(".st-row").forEach(function (r) { r.classList.toggle("hl", !!r.querySelector(".st-block.hl")); });
    }
    function clear() {
      story.classList.remove("active");
      blocks.forEach(function (b) { b.classList.remove("hl"); });
      story.querySelectorAll(".st-row.hl").forEach(function (r) { r.classList.remove("hl"); });
    }
    blocks.forEach(function (b) {
      b.addEventListener("mouseenter", function () { show(b); });
      b.addEventListener("mouseleave", clear);
      b.addEventListener("focusin", function () { show(b); });
      b.addEventListener("focusout", function (e) { if (!b.contains(e.relatedTarget)) clear(); });
    });

    // "Alongside" links: in a one-stream view, switch back to both streams so the target is visible.
    story.querySelectorAll(".st-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (story.getAttribute("data-show") !== "both") filter.querySelector('[data-show="both"]').click();
      });
    });
  }

  // Underline the jump link of the section in view.
  function scrollspy() {
    var links = [].slice.call(document.querySelectorAll('.bar nav a[href^="#"]'));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = byId[en.target.id];
        if (!a) return;
        a.setAttribute("aria-current", "true");
        var nav = a.parentNode;
        if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = a.offsetLeft - nav.offsetLeft - 16;
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) obs.observe(s);
    });
  }
})();
