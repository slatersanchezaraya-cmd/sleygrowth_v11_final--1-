/* Escenario del hero: tres demos que se turnan (web, SEO, IA) */
(function () {
  var st = document.getElementById('stage'); if (!st) return;
  var tabs = [].slice.call(st.querySelectorAll('.st-tabs button')), scs = [].slice.call(st.querySelectorAll('.st-sc')), foot = st.querySelector('.st-foot');
  var DUR = 9500, caps = ['Un sitio rápido, a medida, que se ve bien en cualquier pantalla.', 'Subí en Google cuando tus clientes te buscan cerca.', 'Un asistente que contesta, vende y agenda mientras vos descansás.'];
  var timers = [], cur = -1, elapsed = 0, paused = false, loop;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function count(el) { var to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, t0 = performance.now(); (function s(n) { var p = Math.min((n - t0) / 1200, 1); el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec); if (p < 1) requestAnimationFrame(s); })(t0); }
  function steps(sc) { var ss = sc.querySelectorAll('.step'); ss.forEach(function (s) { s.classList.remove('in'); }); return ss; }

  var scene = [
    function () { var sc = scs[0]; steps(sc).forEach(function (s) { at(+s.dataset.t || 0, function () { s.classList.add('in'); var c = s.querySelector('[data-count]'); if (c) count(c); s.querySelectorAll('[data-count]').forEach(count); }); }); },
    function () {
      var sc = scs[1], q = sc.querySelector('.sr-q'), rs = [].slice.call(sc.querySelectorAll('.sr-r')), me = sc.querySelector('.me'), txt = 'veterinaria cerca de mí';
      q.textContent = ''; rs.forEach(function (r, i) { r.classList.remove('top'); r.style.top = i * 66 + 'px'; r.style.opacity = 0; });
      for (var i = 0; i < txt.length; i++) (function (k) { at(300 + k * 55, function () { q.textContent = txt.slice(0, k + 1); }); })(i);
      rs.forEach(function (r, i) { at(1700 + i * 160, function () { r.style.opacity = 1; }); });
      at(3600, function () { rs.forEach(function (r) { var k = rs.indexOf(r); r.style.top = (r === me ? 0 : (k < rs.indexOf(me) ? (k + 1) * 66 : k * 66)) + 'px'; }); me.classList.add('top'); });
    },
    function () {
      var sc = scs[2], body = sc.querySelector('.st-chat'), ms = [].slice.call(body.querySelectorAll('.msg')), t = 500;
      body.querySelectorAll('.typing').forEach(function (x) { x.remove(); }); ms.forEach(function (m) { m.classList.remove('show'); });
      ms.forEach(function (m) {
        var out = m.classList.contains('out'), tag = m.classList.contains('tagmsg');
        if (out) { t += 400; (function (mm, tt) { at(tt, function () { var ty = document.createElement('div'); ty.className = 'msg out typing'; ty.innerHTML = '<i></i><i></i><i></i>'; body.insertBefore(ty, mm); mm._ty = ty; }); })(m, t); t += 1100; } else t += tag ? 500 : 800;
        (function (mm, tt) { at(tt, function () { if (mm._ty) mm._ty.remove(); mm.classList.add('show'); }); })(m, t);
      });
    }
  ];

  function play(i) {
    timers.forEach(clearTimeout); timers = []; cur = i; elapsed = 0;
    tabs.forEach(function (t, k) { t.style.setProperty('--dur', DUR + 'ms'); t.classList.remove('on'); if (k === i) { void t.offsetWidth; t.classList.add('on'); } });
    scs.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    foot.textContent = caps[i]; scene[i]();
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { play(i); }); });
  st.addEventListener('mouseenter', function () { paused = true; st.classList.add('paused'); });
  st.addEventListener('mouseleave', function () { paused = false; st.classList.remove('paused'); });
  function start() { play(0); loop = setInterval(function () { if (paused || document.hidden) return; elapsed += 100; if (elapsed >= DUR) play((cur + 1) % 3); }, 100); }
  setTimeout(start, (window.__sgDelay || 0) + 250);
})();
