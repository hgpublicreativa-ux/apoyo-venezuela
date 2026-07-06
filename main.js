(function () {
  /* AyudaVenezuela — main.js | IIFE, no ES modules */
  "use strict";

  /* ── UTILS ─────────────────────────────────────────────── */
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ── NAV ────────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (!nav) return;

    var lastY = 0;
    function onScroll() {
      var y = window.scrollY;
      if (y > 40) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ── SMOOTH SCROLL ──────────────────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 80;
      var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  /* ── REVEAL ON SCROLL ────────────────────────────────────── */
  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = parseInt(el.dataset.delay, 10) || 0;
        setTimeout(function () {
          el.classList.add("is-visible");
        }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -3% 0px" });

    els.forEach(function (el) { io.observe(el); });

    /* 6s safety — force-reveal anything still hidden in viewport */
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ── COUNT-UP ────────────────────────────────────────────── */
  function initCountUp() {
    var els = document.querySelectorAll("[data-count-to]");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.countTo, 10);
        var duration = 2000;
        var start = performance.now();
        io.unobserve(el);

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var val = Math.round(eased * target);
          el.textContent = val.toLocaleString("es");
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── DONAR FORM ──────────────────────────────────────────── */
  function initDonarForm() {
    var form = document.getElementById("donarForm");
    var btn = document.getElementById("donarBtn");
    var success = document.getElementById("formSuccess");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      btn.disabled = true;
      btn.querySelector(".btn-label").textContent = "Procesando…";

      /* Placeholder — integrate real payment gateway here */
      setTimeout(function () {
        form.style.display = "none";
        success.classList.add("is-visible");
      }, 1800);
    });
  }

  /* ── CONTACTO FORM ───────────────────────────────────────── */
  function initContactoForm() {
    var form = document.getElementById("contactoForm");
    var btn = document.getElementById("contactoBtn");
    var success = document.getElementById("contactoSuccess");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      btn.disabled = true;
      btn.textContent = "Enviando…";

      /* Placeholder — integrate real backend or Formspree here */
      setTimeout(function () {
        form.style.display = "none";
        success.classList.add("is-visible");
      }, 1400);
    });
  }

  /* ── IMAGE CREDITS ───────────────────────────────────────── */
  function initCredits() {
    var container = document.getElementById("creditsContainer");
    if (!container) return;

    fetch("assets/credits.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data) || !data.length) {
          container.textContent = "Sin créditos disponibles.";
          return;
        }
        container.innerHTML = data.map(function (c) {
          return '<span>' + c.id + ': <a href="' + (c.license_url || c.url || '#') +
            '" target="_blank" rel="noopener noreferrer">' +
            (c.title || c.id) + '</a></span>';
        }).join("");
      })
      .catch(function () {
        container.textContent = "No se pudieron cargar los créditos.";
      });
  }

  /* ── GSAP SCROLL ANIMATIONS ──────────────────────────────── */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    /* Hero img parallax */
    var heroImg = document.querySelector(".hero-img");
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    /* Section cards stagger */
    document.querySelectorAll(".cards-grid").forEach(function (grid) {
      var cards = grid.querySelectorAll(".card");
      if (!cards.length) return;
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
        },
      });
    });
  }

  /* ── BOOT ────────────────────────────────────────────────── */
  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initDonarForm, "initDonarForm");
    safe(initContactoForm, "initContactoForm");
    safe(initCredits, "initCredits");
    safe(initGSAP, "initGSAP");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
