/* Sley Growth: movimiento del sitio. Solo corre si <html> tiene .js
   (lo pone un script inline y no lo pone si el usuario pidio menos movimiento). */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('js')) return;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ── 0. Intro de entrada (solo la home, una vez por sesion) ── */
  var seen = false; try { seen = sessionStorage.getItem('sg_intro') === '1'; } catch (e) {}
  var T = 0;
  if (document.body.hasAttribute('data-intro') && !seen) {
    T = 1900; try { sessionStorage.setItem('sg_intro', '1'); } catch (e) {}
    var iv = document.createElement('div'); iv.id = 'intro'; iv.setAttribute('aria-hidden', 'true');
    iv.innerHTML = '<div class="iw"><span>Sley</span><span>Growth</span><span>AI</span></div><div class="ib"><i></i></div><div class="it">Software y agentes de IA para tu empresa</div>';
    document.body.appendChild(iv); document.body.classList.add('intro-lock');
    setTimeout(function () { iv.classList.add('out'); document.body.classList.remove('intro-lock'); }, T - 200);
    setTimeout(function () { iv.remove(); }, T + 1100);
  }
  window.__sgDelay = T ? T - 400 : 0;

  /* ── 1. Titulos: cada palabra sube desde una mascara ───────── */
  function split(el) {
    var i = 0;
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var s = document.createElement('span'); s.textContent = t; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.classList.add('is-split');
  }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      if (e.target.classList.contains('cs-num')) count(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.hero-title,.ph-title,.sec-title,.cta-title,.legal-title,.info-title').forEach(function (t) {
    split(t);
    if (t.classList.contains('hero-title') || t.classList.contains('ph-title')) setTimeout(function () { t.classList.add('in'); }, T ? T - 300 : 30);
    else io.observe(t);
  });

  /* ── 2. Bloques: entran escalonados segun su posicion ──────── */
  var sel = '.srv-group,.wi,.case-card,.cs,.bento-card,.bc,.testi,.vid-card,.paso,.faq-item,.cta-desc,.cta-card,.stat-card,' +
            '.feat-item,.fi-row,.content-block,.compare-col,.cinfo-card,.wa-btn,.form-card,.legal-section,.sec-lead,.marquee';
  var seen = new Map();
  document.querySelectorAll(sel).forEach(function (el) {
    var p = el.parentElement, k = (seen.get(p) || 0); seen.set(p, k + 1);
    el.classList.add('fx'); el.style.setProperty('--d', Math.min(k, 6) * 90 + 'ms');
    io.observe(el);
  });

  /* ── 3. Contadores en las cifras del caso ──────────────────── */
  function count(el) {
    var m = el.textContent.trim().match(/^([^\d]*)(\d+)([^\d\/]*)$/);
    if (!m) return;
    var pre = m[1], n = +m[2], post = m[3], t0 = performance.now(), dur = 1500;
    (function step(now) {
      var p = Math.min((now - t0) / dur, 1), v = Math.round(n * (1 - Math.pow(1 - p, 4)));
      el.textContent = pre + v + post;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  document.querySelectorAll('.cs-num').forEach(function (el) { io.observe(el); });

  /* ── 4. Chat del hero: escribe, responde, escribe ──────────── */
  var chat = document.querySelector('.chat-body');
  if (chat) {
    var msgs = Array.prototype.slice.call(chat.querySelectorAll('.msg'));
    chat.style.minHeight = chat.offsetHeight + 'px';
    msgs.forEach(function (m) { m.classList.add('pend'); });
    var t = 1300;
    msgs.forEach(function (m) {
      var out = m.classList.contains('out');
      if (out) {
        t += 500;
        setTimeout(function () {
          var ty = document.createElement('div'); ty.className = 'msg out typing'; ty.innerHTML = '<i></i><i></i><i></i>';
          chat.insertBefore(ty, m); m._ty = ty;
        }, t);
        t += 1200;
      } else t += 900;
      setTimeout(function () { if (m._ty) m._ty.remove(); m.classList.remove('pend'); }, t);
    });
  }

  /* ── 5. Barra de progreso, nav que se esconde, parallax ────── */
  var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  var nav = document.getElementById('nav'), last = 0, tick = false;
  var par = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  function frame() {
    tick = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (nav) {
      var menu = document.getElementById('mob');
      nav.classList.toggle('nav-hide', y > 480 && y > last + 4 && !(menu && menu.classList.contains('open')));
      if (y < last - 4 || y < 480) nav.classList.remove('nav-hide');
    }
    /* botones flotantes (asistente y WhatsApp): se esconden al bajar y vuelven al subir */
    if (y > 140 && y > last + 4) document.body.classList.add('fab-hide');
    else if (y < last - 4 || y < 140) document.body.classList.remove('fab-hide');
    last = y;
    par.forEach(function (el) { if (y < 1100) el.style.translate = '0 ' + (-y * parseFloat(el.dataset.parallax)).toFixed(1) + 'px'; });
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* ── 5b. Luz que sigue al mouse dentro de las tarjetas ──────── */
  if (fine) {
    document.querySelectorAll('.srv-group,.bento-card,.bc,.case-card,.feat-item,.stat-card,.cinfo-card,.vid-card,.demo').forEach(function (c) {
      c.classList.add('spot');
      c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
  }

  /* ── 6. Boton principal con efecto iman ─────────────────────── */
  if (fine) {
    document.querySelectorAll('.hero-cta .btn-primary,.cta .btn-primary,.cta-sec .btn-p').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px';
      });
      b.addEventListener('mouseleave', function () { b.style.translate = ''; });
    });
  }

  /* ── 7. Videos: solo corren cuando estan a la vista ────────── */
  var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.preload = 'auto'; var pr = e.target.play(); if (pr && pr.catch) pr.catch(function () {}); } else e.target.pause(); }); }, { threshold: 0.25 });
  document.querySelectorAll('.vid-card video').forEach(function (v) { vio.observe(v); });

  /* ── 8. Transicion suave entre paginas ───────────────────── */
  addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target === '_blank' || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search) || !/\.html?$|\/$/.test(u.pathname)) return;
    e.preventDefault(); document.body.classList.add('leaving'); setTimeout(function () { location.href = a.href; }, 240);
  });

  /* ── 9. Burbuja "Ver sitio" que sigue al mouse sobre los proyectos ── */
  if (fine) {
    var cur = document.createElement('div'); cur.className = 'cur'; cur.textContent = 'Ver sitio'; document.body.appendChild(cur);
    document.querySelectorAll('.bento-card,.bc:not(.bc-placeholder)').forEach(function (c) {
      c.addEventListener('mouseenter', function () { cur.classList.add('on'); });
      c.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
      c.addEventListener('mousemove', function (e) { cur.style.transform = 'translate(' + (e.clientX + 14) + 'px,' + (e.clientY + 14) + 'px)'; });
    });
  }
})();
