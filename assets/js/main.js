/* ==========================================================================
   SAITRONICS SYSTEMS PVT LTD — Site Scripts
   Loads shared header.html / footer.html fragments, then wires up
   scroll effects, back-to-top and simple on-scroll reveals.
   Note: fetch() requires the site to be served over http(s) — run a local
   server (e.g. `npx serve` or the VS Code "Live Server" extension) rather
   than opening index.html directly via file://.
   ========================================================================== */
(function () {
  "use strict";

  function include(selector, url) {
    var el = document.querySelector(selector);
    if (!el) return Promise.resolve();
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + url);
        return res.text();
      })
      .then(function (html) {
        el.innerHTML = html;
      })
      .catch(function (err) {
        console.error(err);
        el.innerHTML = "";
      });
  }

  function markActiveNavLink() {
    var current = (location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll(".main-navbar .nav-link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      link.classList.toggle("active", href === current);
    });
  }

  function initNavbarScroll() {
    var nav = document.querySelector(".main-navbar");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function initCollapseOnLinkClick() {
    var collapseEl = document.getElementById("mainNav");
    if (!collapseEl || !window.bootstrap) return;
    collapseEl.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 992) {
          var instance = bootstrap.Collapse.getOrCreateInstance(collapseEl);
          instance.hide();
        }
      });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll("[data-aos]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("aos-in"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute("data-aos-delay");
          if (delay) entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("aos-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    var animate = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  function initLeadershipSlider() {
    var currentIndex = 0;
    var leaderCards = document.querySelectorAll(".leader-card");
    var leaderAvatars = document.querySelectorAll(".leader-avatar");
    var avatarBtns = document.querySelectorAll(".leader-avatar-btn");
    var prevBtn = document.querySelector(".leader-prev");
    var nextBtn = document.querySelector(".leader-next");

    if (!leaderCards.length) return;

    function showLeader(index) {
      leaderCards.forEach(function (card) {
        card.classList.remove("active");
      });
      leaderAvatars.forEach(function (avatar) {
        avatar.classList.remove("active");
      });
      avatarBtns.forEach(function (btn) {
        btn.classList.remove("active");
      });

      leaderCards[index].classList.add("active");
      leaderAvatars[index].classList.add("active");
      avatarBtns[index].classList.add("active");
      currentIndex = index;
    }

    function nextLeader() {
      var next = (currentIndex + 1) % leaderCards.length;
      showLeader(next);
    }

    function prevLeader() {
      var prev = (currentIndex - 1 + leaderCards.length) % leaderCards.length;
      showLeader(prev);
    }

    var autoplayDelay = 3000;
    var autoplayTimer = null;

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(nextLeader, autoplayDelay);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    function restartAutoplay() {
      startAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { prevLeader(); restartAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { nextLeader(); restartAutoplay(); });

    avatarBtns.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        showLeader(index);
        restartAutoplay();
      });
    });

    startAutoplay();
  }

  document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
      include("#header-placeholder", "header.html"),
      include("#footer-placeholder", "footer.html")
    ]).then(function () {
      markActiveNavLink();
      initNavbarScroll();
      initBackToTop();
      initFooterYear();
      initCollapseOnLinkClick();
      initReveal();
      initCounters();
      initLeadershipSlider();
    });
  });
})();
