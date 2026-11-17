/* Demos interactivas (2/2): SEO tecnico, WhatsApp, CRM, integraciones, flujos, contenido */
(function () {
  var D = window.SGD = window.SGD || {};
  var fmt = D.fmt;
  function seg(items, on) { return '<div class="seg">' + items.map(function (i, k) { return '<button data-v="' + i[0] + '" class="' + (k === on ? 'on' : '') + '">' + i[1] + '</button>'; }).join('') + '</div>'; }
  function sw(id, label, on) { return '<div class="sw ' + (on ? 'on' : '') + '" data-sw="' + id + '"><span>' + label + '</span><i></i></div>'; }
  function pick(root, sel, cb) { root.querySelectorAll(sel + ' button').forEach(function (b) { b.addEventListener('click', function () { root.querySelectorAll(sel + ' button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); cb(b.dataset.v); }); }); }

  /* ── SEO técnico: antes y después ────────────────────────────── */
  D.seotecnico = function (el) {
    var M = { before: { lcp: 4.8, inp: 420, cls: .27, w: [95, 80, 70, 60, 45], g: 0 }, after: { lcp: 1.2, inp: 90, cls: .02, w: [30, 22, 16, 12, 9], g: 1 } };
    el.innerHTML = '<div class="dm"><div class="dm-ctl"><div><div class="dm-label">Estado del sitio</div>' + seg([['before', 'Antes'], ['after', 'Después']], 0) + '</div><div><div class="dm-label">Revisión técnica</div>' + sw('s1', 'Sitemap enviado a Google', 0) + sw('s2', 'robots.txt correcto', 0) + sw('s3', 'Datos estructurados', 0) + sw('s4', 'Imágenes en WebP', 0) + sw('s5', 'Caché y compresión', 0) + '</div></div>' +
      '<div class="dm-view"><div class="vt"><div class="vt-c" id="c1"><small>Carga principal (LCP)</small><b id="v1">0</b><div class="vt-bar"><i id="p1"></i></div></div><div class="vt-c" id="c2"><small>Respuesta al toque (INP)</small><b id="v2">0</b><div class="vt-bar"><i id="p2"></i></div></div><div class="vt-c" id="c3"><small>Estabilidad (CLS)</small><b id="v3">0</b><div class="vt-bar"><i id="p3"></i></div></div></div>' +
      '<div class="wf" id="wf"></div></div></div><div class="dm-cap">Valores de ejemplo basados en los umbrales de Google (bueno: LCP bajo 2,5 s, INP bajo 200 ms, CLS bajo 0,1).</div>';
    var $ = function (s) { return el.querySelector(s); }, names = ['HTML', 'Estilos', 'Scripts', 'Imágenes', 'Fuentes'];
    $('#wf').innerHTML = names.map(function (n, i) { return '<div><span>' + n + '</span><i id="w' + i + '" style="width:0"></i></div>'; }).join('');
    function set(k) {
      var m = M[k], sc = el.querySelectorAll('.sw.on').length;
      D.tween($('#v1'), m.lcp, { dec: 1, dur: 1000, f: function (v) { return v.toFixed(1) + ' s'; } });
      D.tween($('#v2'), m.inp, { dur: 1000, f: function (v) { return Math.round(v) + ' ms'; } });
      D.tween($('#v3'), m.cls, { dec: 2, dur: 1000 });
      $('#p1').style.width = (m.g ? 92 : 22) + '%'; $('#p2').style.width = (m.g ? 90 : 26) + '%'; $('#p3').style.width = (m.g ? 96 : 20) + '%';
      ['c1', 'c2', 'c3'].forEach(function (c) { $('#' + c).classList.toggle('good', !!m.g); });
      m.w.forEach(function (w, i) { var e = $('#w' + i); e.style.width = w + '%'; e.className = (!m.g && i > 1) ? 'heavy' : ''; });
    }
    pick(el, '.dm-ctl > div:first-child', set);
    el.querySelectorAll('[data-sw]').forEach(function (s) { s.onclick = function () { s.classList.toggle('on'); if (el.querySelectorAll('.sw.on').length === 5) { el.querySelectorAll('.seg button')[1].click(); } }; });
    setTimeout(function () { set('before'); }, 100);
  };

  /* ── WhatsApp con IA: conversación + lo que ve el equipo ─────── */
  D.chatbots = function (el) {
    var B = {
      clinica: { n: 'Clínica dental', q: [['¿Tienen espacio para una limpieza?', 'Claro. Tengo el jueves a las 9:00 a. m. o el viernes a las 2:30 p. m. ¿Cuál te sirve?', 'Cita: limpieza'], ['¿Cuánto cuesta una consulta?', 'La valoración inicial cuesta ₡15 000 y se descuenta si empezás el tratamiento. ¿Querés agendarla?', 'Consulta de precio'], ['¿Atienden por la tarde?', 'Sí, de lunes a viernes hasta las 6:00 p. m. y los sábados hasta la 1:00 p. m.', 'Consulta de horario']] },
      vet: { n: 'Veterinaria', q: [['Mi perro no quiere comer', 'Lamento eso. ¿Desde cuándo? Si lleva más de 24 horas, te recomiendo traerlo hoy. Tengo espacio a las 4:00 p. m.', 'Urgencia: mascota'], ['¿Tienen vacunas para gatos?', 'Sí, aplicamos el esquema completo. ¿Cuántos meses tiene tu gato?', 'Vacunación'], ['¿Hacen domicilio?', 'Hacemos entrega de alimento y medicinas en Heredia y alrededores. ¿Qué necesitás?', 'Consulta de domicilio']] },
      tienda: { n: 'Tienda de ropa', q: [['¿Tienen la camisa de lino en talla M?', 'Sí, quedan 3 en talla M a ₡18 500. ¿Te la aparto 24 horas?', 'Reserva de producto'], ['¿Hacen envíos?', 'Enviamos a todo el país por Correos de Costa Rica. En el GAM llega en 2 días hábiles.', 'Consulta de envío'], ['¿Se puede pagar por SINPE?', 'Claro. Te paso el número y, apenas llegue el comprobante, preparo tu pedido.', 'Pago SINPE']] },
      resto: { n: 'Restaurante', q: [['¿Hay mesa para 4 esta noche?', 'Tengo a las 7:00 p. m. o a las 8:30 p. m. ¿A nombre de quién la dejo?', 'Reserva de mesa'], ['¿Tienen opciones vegetarianas?', 'Sí, tenemos 6 platos vegetarianos y el casado es adaptable. ¿Te comparto el menú?', 'Consulta de menú'], ['¿Reciben pedidos para llevar?', 'Sí. Escribime lo que querés y en 20 minutos está listo.', 'Pedido para llevar']] }
    };
    var cur = 'clinica', n = 0;
    el.innerHTML = '<div class="dm" style="grid-template-columns:1fr"><div class="dm-view" style="min-height:0"><div style="margin-bottom:14px">' + seg([['clinica', 'Clínica dental'], ['vet', 'Veterinaria'], ['tienda', 'Tienda'], ['resto', 'Restaurante']], 0) + '</div>' +
      '<div class="cx"><div class="cx-phone"><div class="cx-top"><div class="chat-av">A</div><div><div id="bn">Clínica dental</div><div class="chat-sub" style="font-weight:400">Asistente en línea</div></div></div><div class="cx-body" id="cb"></div><div class="cx-chips" id="cc"></div><form class="cx-in" id="cf"><input id="ci" placeholder="Escribí tu mensaje" aria-label="Mensaje"><button type="submit">Enviar</button></form></div>' +
      '<div class="crm-l" id="cl"><h5>Lo que ve tu equipo</h5><span style="font-size:13.5px;color:var(--ink3)">Cada conversación se convierte en un contacto con su interés y estado.</span></div></div></div></div>' +
      '<div class="dm-cap">Probá preguntarle algo. Respuestas de ejemplo: el asistente real se entrena con la información de tu negocio.</div>';
    var $ = function (s) { return el.querySelector(s); };
    function bub(t, out) { var m = document.createElement('div'); m.className = 'msg ' + (out ? 'out' : 'in'); m.innerHTML = t; $('#cb').appendChild(m); $('#cb').scrollTop = 1e5; return m; }
    function reply(q, a, tag) {
      bub(q, false); var ty = document.createElement('div'); ty.className = 'msg out typing'; ty.innerHTML = '<i></i><i></i><i></i>'; $('#cb').appendChild(ty); $('#cb').scrollTop = 1e5;
      setTimeout(function () {
        ty.remove(); bub(a, true); n++;
        var l = document.createElement('div'); l.className = 'lead'; l.innerHTML = '<b>Contacto #' + (100 + n) + '</b>Interés: ' + tag + ' <span class="tag ok" style="margin-left:4px">Nuevo</span>'; $('#cl').appendChild(l);
      }, 1100);
    }
    function load() {
      var b = B[cur]; $('#bn').textContent = b.n; $('#cb').innerHTML = ''; $('#cl').querySelectorAll('.lead').forEach(function (x) { x.remove(); });
      bub('Hola, soy el asistente de ' + b.n.toLowerCase() + '. ¿En qué te puedo ayudar?', true);
      $('#cc').innerHTML = ''; b.q.forEach(function (q) { var x = document.createElement('button'); x.textContent = q[0]; x.onclick = function () { reply(q[0], q[1], q[2]); }; $('#cc').appendChild(x); });
    }
    pick(el, '.dm-view > div:first-child', function (v) { cur = v; load(); });
    $('#cf').onsubmit = function (e) {
      e.preventDefault(); var v = $('#ci').value.trim(); if (!v) return; $('#ci').value = '';
      var hit = B[cur].q.filter(function (q) { return q[0].toLowerCase().split(/\W+/).some(function (w) { return w.length > 4 && v.toLowerCase().indexOf(w) > -1; }); })[0];
      reply(v, hit ? hit[1] : 'Buena pregunta. Te paso con una persona del equipo para darte el detalle exacto. ¿Me dejás tu nombre?', hit ? hit[2] : 'Consulta general');
    };
    load();
  };

  /* ── CRM: kanban arrastrable ─────────────────────────────────── */
  D.crm = function (el) {
    var cols = ['Primer contacto', 'Cotización', 'Negociación', 'Cerrado'], data = [[['Panadería Luna', 180000], ['Ferretería Sur', 450000]], [['Clínica Vida', 920000]], [['Hotel Mirador', 1500000]], [['Café del Barrio', 320000]]], nid = 0, drag = null;
    el.innerHTML = '<div class="dm" style="grid-template-columns:1fr"><div class="dm-view" style="min-height:0"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap"><div class="dm-m" style="padding:10px 16px"><small>Total en el embudo</small><b id="tt" style="font-size:22px">0</b></div><button class="dm-btn" id="add">Nuevo contacto</button></div><div class="kb" id="kb"></div></div></div><div class="dm-cap">Arrastrá las tarjetas entre columnas (o usá el botón Avanzar). Los totales se recalculan solos.</div>';
    var kb = el.querySelector('#kb'), names = ['Taller Mora', 'Spa Aurora', 'Librería Central', 'Gimnasio Fuerza'];
    function draw() {
      kb.innerHTML = cols.map(function (c, ci) { var tot = data[ci].reduce(function (a, x) { return a + x[1]; }, 0); return '<div class="kb-c" data-c="' + ci + '"><div class="kb-h"><span>' + c + '</span><small>' + fmt(tot) + '</small></div>' + data[ci].map(function (x, i) { return '<div class="kb-card" draggable="true" data-c="' + ci + '" data-i="' + i + '"><b>' + x[0] + '</b><small><span>' + fmt(x[1]) + '</span>' + (ci < 3 ? '<button data-a="1">Avanzar</button>' : '<span class="tag ok">Ganado</span>') + '</small></div>'; }).join('') + '</div>'; }).join('');
      var all = data.reduce(function (a, c, i) { return a + (i < 3 ? c.reduce(function (s, x) { return s + x[1]; }, 0) : 0); }, 0); D.tween(el.querySelector('#tt'), all, { dur: 500, f: fmt });
      kb.querySelectorAll('.kb-card').forEach(function (c) {
        c.ondragstart = function (e) { drag = [+c.dataset.c, +c.dataset.i]; c.classList.add('drag'); e.dataTransfer.setData('text', 'x'); };
        c.ondragend = function () { c.classList.remove('drag'); };
        var b = c.querySelector('[data-a]'); if (b) b.onclick = function () { move(+c.dataset.c, +c.dataset.i, +c.dataset.c + 1); };
      });
      kb.querySelectorAll('.kb-c').forEach(function (c) { c.ondragover = function (e) { e.preventDefault(); c.classList.add('over'); }; c.ondragleave = function () { c.classList.remove('over'); }; c.ondrop = function (e) { e.preventDefault(); if (drag) move(drag[0], drag[1], +c.dataset.c); drag = null; }; });
    }
    function move(f, i, t) { if (f === t) { draw(); return; } var x = data[f].splice(i, 1)[0]; data[t].push(x); draw(); }
    el.querySelector('#add').onclick = function () { data[0].push([names[nid++ % 4], [90000, 240000, 380000, 600000][Math.floor(Math.random() * 4)]]); draw(); };
    draw();
  };

  /* ── Integraciones: conecta tus apps ─────────────────────────── */
  D.integraciones = function (el) {
    var A = [['WhatsApp', 12, 22], ['Hoja de cálculo', 88, 22], ['CRM', 8, 78], ['Pagos SINPE', 90, 76], ['Correo', 30, 94], ['Calendario', 70, 94]];
    var EV = { 'WhatsApp': 'Mensaje nuevo de <b>Marcela</b> recibido', 'Hoja de cálculo': 'Fila agregada en <b>Ventas 2026</b>', 'CRM': 'Contacto <b>Marcela R.</b> creado', 'Pagos SINPE': 'Comprobante de <b>₡18 500</b> confirmado', 'Correo': 'Cotización enviada a <b>marcela@correo.cr</b>', 'Calendario': 'Cita agendada para el <b>jueves 9:00 a. m.</b>' };
    el.innerHTML = '<div class="dm"><div class="dm-ctl"><div><div class="dm-label">Conectá tus herramientas</div><span style="font-size:14px;color:var(--ink3)">Tocá cada una y mirá cómo se conecta al centro.</span></div><button class="dm-btn ghost" id="all">Conectar todas</button><div class="logf" id="lg"><b>Actividad</b></div></div><div class="dm-view"><div class="ig" id="ig"><svg id="sv"></svg><div class="ig-hub">Tu sistema</div></div></div></div><div class="dm-cap">Cada conexión usa la API oficial de la herramienta. Ejemplo ilustrativo.</div>';
    var ig = el.querySelector('#ig'), sv = el.querySelector('#sv'), lg = el.querySelector('#lg'), nodes = [];
    A.forEach(function (a, i) { var b = document.createElement('button'); b.className = 'ig-n'; b.textContent = a[0]; b.style.left = a[1] + '%'; b.style.top = a[2] + '%'; b.onclick = function () { tg(i); }; ig.appendChild(b); nodes.push(b); });
    function lines() { var w = ig.clientWidth, h = ig.clientHeight; sv.setAttribute('viewBox', '0 0 ' + w + ' ' + h); sv.innerHTML = A.map(function (a, i) { return '<line data-i="' + i + '" x1="' + w / 2 + '" y1="' + h / 2 + '" x2="' + w * a[1] / 100 + '" y2="' + h * a[2] / 100 + '" class="' + (nodes[i].classList.contains('on') ? 'on' : '') + '"/>'; }).join(''); }
    function tg(i) { var on = nodes[i].classList.toggle('on'); lines(); if (on) { var d = document.createElement('div'); d.innerHTML = EV[A[i][0]]; lg.appendChild(d); while (lg.children.length > 6) lg.removeChild(lg.children[1]); } }
    el.querySelector('#all').onclick = function () { nodes.forEach(function (n, i) { if (!n.classList.contains('on')) setTimeout(function () { tg(i); }, i * 280); }); };
    window.addEventListener('resize', lines); setTimeout(lines, 60);
  };

  /* ── Flujos de trabajo: arma una automatización ──────────────── */
  D.flujos = function (el) {
    var S = [['Responder por WhatsApp al instante', 2], ['Crear el contacto en el CRM', 4], ['Avisar al equipo', 1], ['Agendar el seguimiento', 3], ['Enviar la cotización por correo', 6]], on = [1, 1, 0, 0, 0];
    el.innerHTML = '<div class="dm"><div class="dm-ctl"><div><div class="dm-label">Acciones automáticas</div>' + S.map(function (s, i) { return sw('s' + i, s[0], on[i]); }).join('') + '</div><div><div class="dm-label">Formularios al día <b id="rv"></b></div><input class="rg" id="rr" type="range" min="2" max="60" value="12"></div></div>' +
      '<div class="dm-view"><div class="fl" id="fl"></div><div class="dm-metrics" style="margin-top:16px"><div class="dm-m"><b id="m1">0</b><small>Minutos ahorrados por solicitud</small></div><div class="dm-m hi"><b id="m2">0</b><small>Horas ahorradas al mes</small></div><button class="dm-btn" id="run">Ejecutar flujo</button></div></div></div><div class="dm-cap">Tiempos de ejemplo por tarea manual. En tu proceso real los medimos contigo.</div>';
    var $ = function (s) { return el.querySelector(s); }, busy = false;
    function draw() {
      var act = S.filter(function (s, i) { return on[i]; }), mins = act.reduce(function (a, s) { return a + s[1]; }, 0), d = +$('#rr').value;
      $('#rv').textContent = d; D.tween($('#m1'), mins, { dur: 500 }); D.tween($('#m2'), mins * d * 22 / 60, { dur: 600, dec: 0 });
      var h = '<div class="fl-n"><span class="nm">1</span>Llega una solicitud por el formulario<small>Disparador</small></div>';
      if (!act.length) h += '<div class="fl-l"></div><div class="fl-empty">Activá una acción para armar el flujo</div>';
      act.forEach(function (s, i) { h += '<div class="fl-l"></div><div class="fl-n reveal-in"><span class="nm">' + (i + 2) + '</span>' + s[0] + '<small>' + s[1] + ' min</small></div>'; });
      $('#fl').innerHTML = h;
    }
    el.querySelectorAll('[data-sw]').forEach(function (s, i) { s.onclick = function () { s.classList.toggle('on'); on[i] = s.classList.contains('on') ? 1 : 0; draw(); }; });
    $('#rr').oninput = draw;
    $('#run').onclick = function () {
      if (busy) return; busy = true; var ns = el.querySelectorAll('.fl-n'), ls = el.querySelectorAll('.fl-l'); ns.forEach(function (n) { n.classList.remove('done', 'run'); }); ls.forEach(function (l) { l.classList.remove('go'); });
      var i = 0; (function nx() { if (i > 0) { ns[i - 1].classList.remove('run'); ns[i - 1].classList.add('done'); } if (i < ns.length) { ns[i].classList.add('run'); if (ls[i]) ls[i].classList.add('go'); i++; setTimeout(nx, 650); } else busy = false; })();
    };
    draw();
  };

  /* ── Edición de contenido: formato y capas ───────────────────── */
  D.contenido = function (el) {
    var f = 'h', o = { sub: 1, mus: 1, logo: 0, cut: 0 };
    el.innerHTML = '<div class="dm"><div class="dm-ctl"><div><div class="dm-label">Formato</div>' + seg([['h', 'Horizontal 16:9'], ['v', 'Vertical 9:16'], ['sq', 'Cuadrado 1:1']], 0) + '</div><div><div class="dm-label">Capas</div>' + sw('sub', 'Subtítulos', 1) + sw('mus', 'Música de fondo', 1) + sw('logo', 'Tu logo', 0) + sw('cut', 'Cortes dinámicos', 0) + '</div><div class="dm-metrics" style="grid-template-columns:1fr 1fr"><div class="dm-m"><b id="dur">3:20</b><small>Duración final</small></div><div class="dm-m hi"><b id="fm">YouTube</b><small>Ideal para</small></div></div></div>' +
      '<div class="dm-view"><div class="ct-stage"><div class="ct-fr" id="fr"><div class="pl"></div><div class="ct-music" id="mu"><i></i><i></i><i></i><i></i></div><div class="ct-logo" id="lo">TU LOGO</div><div class="ct-sub" id="su">Así quedó tu video, listo para publicar</div></div></div><div style="font-size:13px;color:var(--ink3);margin-top:6px">Línea de tiempo</div><div class="tl" id="tl"><i style="flex:5"></i><i class="gap" style="flex:2"></i><i style="flex:4"></i><i class="gap" style="flex:3"></i><i style="flex:6"></i><i class="gap" style="flex:2"></i><i style="flex:3"></i></div></div></div><div class="dm-cap">Un mismo grabado, listo para cada red. Ejemplo ilustrativo.</div>';
    var $ = function (s) { return el.querySelector(s); }, FM = { h: 'YouTube', v: 'TikTok y Reels', sq: 'Feed de Instagram' };
    function draw() {
      $('#fr').className = 'ct-fr' + (f === 'v' ? ' v' : f === 'sq' ? ' sq' : ''); $('#fm').textContent = FM[f];
      $('#su').style.opacity = o.sub ? 1 : 0; $('#mu').style.opacity = o.mus ? 1 : 0; $('#lo').style.opacity = o.logo ? 1 : 0;
      $('#tl').className = 'tl' + (o.cut ? ' cut' : ''); $('#dur').textContent = o.cut ? '1:05' : '3:20';
    }
    pick(el, '.dm-ctl > div:first-child', function (v) { f = v; draw(); });
    el.querySelectorAll('[data-sw]').forEach(function (s) { s.onclick = function () { s.classList.toggle('on'); o[s.dataset.sw] = s.classList.contains('on') ? 1 : 0; draw(); }; });
    draw();
  };

  document.querySelectorAll('[data-demo]').forEach(function (el) { var f = D[el.dataset.demo]; if (f) f(el); });
})();
