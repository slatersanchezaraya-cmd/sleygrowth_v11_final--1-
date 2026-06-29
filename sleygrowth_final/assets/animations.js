/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Motor de animaciones premium
   - Contadores animados al scroll (con prefijos/sufijos: +, $, %, x, etc)
   - Texto que se rellena tipo batería (gradiente que avanza)
   - Tilt 3D en cards siguiendo el mouse
   - Reveal con blur + escala
   - Parallax sutil
   Se auto-inicializa. No requiere editar nada.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ── 1) CONTADORES ANIMADOS ──────────────────────────────
     Detecta números en clases típicas de stats y los anima de 0
     al valor real preservando prefijo (+, $) y sufijo (%, x, +, etc). */
  const COUNTER_SELECTORS = [
    ".sn", ".dnt", ".fm", ".rn", ".fsn", ".mn2",
    ".stat-num", ".wcard-num", "[data-count]"
  ].join(",");

  function parseNumber(text) {
    const t = text.trim();
    // No animar expresiones como "24/7", "3h/d", "N/A" (tienen barra)
    if (t.indexOf("/") !== -1) return null;
    // separa: prefijo no numérico | número | sufijo no numérico
    const m = t.match(/^([^\d-]*)(-?[\d.,]+)(.*)$/);
    if (!m) return null;
    const prefix = m[1] || "";
    const raw = m[2].replace(/,/g, "");
    const suffix = m[3] || "";
    const value = parseFloat(raw);
    if (isNaN(value)) return null;
    const decimals = (raw.split(".")[1] || "").length;
    return { prefix, value, suffix, decimals };
  }

  function animateCounter(el) {
    if (el._counted) return;
    const original = el.textContent;
    const parsed = parseNumber(original);
    if (!parsed) return; // no es número (ej "24/7", "DA/DR", "✓") → se deja igual
    el._counted = true;

    const { prefix, value, suffix, decimals } = parsed;
    const dur = 1500;
    const start = performance.now();

    function frame(now) {
      const t = Math.min((now - start) / dur, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const current = value * eased;
      const shown = decimals > 0
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString("en-US");
      el.textContent = prefix + shown + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = original; // asegura valor exacto final
    }
    if (prefersReduced) { el.textContent = original; return; }
    requestAnimationFrame(frame);
  }

  /* ── 2) TEXTO QUE SE RELLENA (tipo batería) ──────────────
     Aplicado a títulos con clase .fill-text o .htitle/.cta-title.
     Envuelve el texto en un span con gradiente que "carga". */
  function setupFillText(el) {
    if (el._fill) return;
    el._fill = true;
    el.classList.add("sg-fill");
  }

  /* ── 3) TILT 3D EN CARDS ──────────────────────────────────
     Inclina la card siguiendo el cursor (solo desktop con hover). */
  function setupTilt(card) {
    if (isTouch || prefersReduced) return;
    const MAX = 8; // grados
    let raf = null;

    function onMove(e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateZ(6px)`;
      });
    }
    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = "perspective(900px) rotateY(0) rotateX(0) translateZ(0)";
    }
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    card.classList.add("sg-tilt");
  }

  /* ── 4) PARALLAX SUTIL ────────────────────────────────────
     Elementos con [data-parallax] se mueven al scroll. */
  let parallaxEls = [];
  function setupParallax() {
    parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
    if (parallaxEls.length && !prefersReduced) {
      window.addEventListener("scroll", onParallaxScroll, { passive: true });
      onParallaxScroll();
    }
  }
  function onParallaxScroll() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const r = el.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
  }

  /* ── 5) REVEAL MEJORADO + disparo de contadores ──────────── */
  function setupObservers() {
    // Contadores
    const counters = document.querySelectorAll(COUNTER_SELECTORS);
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => counterObs.observe(c));

    // Fill-text (títulos) — solo en los que NO tienen spans de color propios,
    // para no pisar gradientes existentes. Los demás usan reveal por línea.
    const fillEls = document.querySelectorAll(".htitle, .cta-title, .ht, .ctt, .stitle, [data-fill]");
    const fillObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("sg-fill-go", "sg-lines-go");
          fillObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    fillEls.forEach((el) => {
      // Saltar títulos que ya tienen animación de entrada propia del hero
      // (los identificados con id h0-h3 manejados por el script inline).
      if (el.id && /^h[0-9]$/.test(el.id)) return;
      const hasColorSpan = el.querySelector(".grad, .muted, [style*='color']");
      if (hasColorSpan) {
        el.classList.add("sg-lines");
      } else {
        setupFillText(el);
      }
      fillObs.observe(el);
    });

    // Reveal genérico mejorado (añade a las clases existentes)
    const revealEls = document.querySelectorAll(
      ".rev, .rv, .rvl, .rvr, .sg-up, .pilar, .pcard, .pstep, .wcard, .feature-card, .cfg-addon"
    );
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in", "sg-in");
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => {
      if (!el.classList.contains("sg-no-anim")) {
        el.classList.add("sg-reveal");
        revObs.observe(el);
      }
    });
  }

  /* ── 6) TILT en cards seleccionadas ──────────────────────── */
  function setupCards() {
    const cards = document.querySelectorAll(
      ".pilar, .pcard, .wcard, .wcm, .cfg-price-panel, [data-tilt]"
    );
    cards.forEach(setupTilt);
  }

  /* ── 7) BARRA DE PROGRESO DE SCROLL ──────────────────────── */
  function setupScrollProgress() {
    if (document.getElementById("sg-scroll-progress")) return;
    const bar = document.createElement("div");
    bar.id = "sg-scroll-progress";
    document.body.appendChild(bar);
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    setupObservers();
    setupCards();
    setupParallax();
    setupScrollProgress();
  }
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
