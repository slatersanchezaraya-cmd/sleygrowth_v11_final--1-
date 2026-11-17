/* Demos interactivas (1/2): desarrollo, rediseno, landing, tienda, escritorio, auditoria, seo local */
(function () {
  var D = window.SGD = window.SGD || {};
  var fmt = function (n) { return '₡' + Math.round(n).toLocaleString('es-CR').replace(/,/g, ' '); };
  D.fmt = fmt;
  D.tween = function (el, to, o) {
    o = o || {}; var from = o.from != null ? o.from : (parseFloat(el.dataset.v) || 0), t0 = performance.now(), dur = o.dur || 800, dec = o.dec || 0, f = o.f || function (v) { return v.toFixed(dec); };
    el.dataset.v = to;
    (function s(now) { var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = f(from + (to - from) * e); if (p < 1) requestAnimationFrame(s); })(t0);
  };
  function seg(items, on) { return '<div class="seg">' + items.map(function (i, k) { return '<button data-v="' + i[0] + '" class="' + (k === on ? 'on' : '') + '">' + i[1] + '</button>'; }).join('') + '</div>'; }
  function sw(id, label, on) { return '<div class="sw ' + (on ? 'on' : '') + '" data-sw="' + id + '"><span>' + label + '</span><i></i></div>'; }
  function pick(root, sel, cb) { root.querySelectorAll(sel + ' button').forEach(function (b) { b.addEventListener('click', function () { root.querySelectorAll(sel + ' button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); cb(b.dataset.v); }); }); }

  /* ── Desarrollo web: arma tu sitio ───────────────────────────── */
  D.web = function (el) {
    var T = { clinica: ['Clínica Sonrisa', 'Tu salud, sin esperas', 'Agendar cita'], tienda: ['Casa Verde', 'Lo que buscás, a un clic', 'Ver catálogo'], resto: ['Sabor Tico', 'Cocina de casa, hoy', 'Reservar mesa'] };
    var st = { t: 'clinica', d: 'bw', f: { res: true, shop: false, chat: true, blog: false } };
    el.innerHTML = '<div class="dm"><div class="dm-ctl">' +
      '<div><div class="dm-label">Tipo de negocio</div>' + seg([['clinica', 'Clínica'], ['tienda', 'Tienda'], ['resto', 'Restaurante']], 0) + '</div>' +
      '<div><div class="dm-label">Qué incluye</div>' + sw('res', 'Reservas en línea', 1) + sw('shop', 'Tienda con pagos', 0) + sw('chat', 'Chat de WhatsApp', 1) + sw('blog', 'Blog para Google', 0) + '</div>' +
      '<div><div class="dm-label">Verlo en</div><div class="seg" id="dv"><button data-v="bw" class="on">Computadora</button><button data-v="tablet">Tablet</button><button data-v="phone">Celular</button></div></div>' +
      '</div><div class="dm-view"><div class="bw" id="bw"><div class="bw-bar"><i></i><i></i><i></i><span class="bw-url" id="url"></span></div><div class="bw-page" id="pg"></div></div>' +
      '<div class="dm-metrics" style="margin-top:16px"><div class="dm-m"><b id="m1">0</b><small>Rendimiento (Lighthouse)</small></div><div class="dm-m"><b id="m2">0</b><small>Semanas estimadas</small></div><div class="dm-m hi"><b id="m3">0</b><small>Secciones activas</small></div></div></div></div>' +
      '<div class="dm-cap">Simulación para que veas cómo se arma tu sitio. El plazo exacto queda fijo en tu propuesta.</div>';
    var pg = el.querySelector('#pg'), bw = el.querySelector('#bw');
    function render() {
      var t = T[st.t], f = st.f, n = 2;
      var html = '<div class="bw-nav reveal-in"><b></b><u></u><u></u><u></u><em></em></div>' +
        '<div class="bw-hero reveal-in"><div><div class="l1"></div><div class="l2"></div><div class="p"></div><div class="p" style="width:55%"></div><div class="bt"></div><div style="font-size:11px;font-weight:700;margin-top:8px">' + t[0] + ' · ' + t[1] + '</div></div><div class="im"></div></div>';
      if (f.res) { html += '<div class="bw-blk reveal-in">' + t[2] + ' en línea, sin llamadas</div>'; n++; }
      if (f.shop) { html += '<div class="bw-blk reveal-in">Carrito con SINPE Móvil y tarjeta</div>'; n++; }
      html += '<div class="bw-cards reveal-in"><span></span><span></span><span></span></div>';
      if (f.blog) { html += '<div class="bw-blk reveal-in">Blog con artículos que posicionan en Google</div>'; n++; }
      if (f.chat) { html += '<div class="bw-blk reveal-in" style="border-color:#1FA855;color:#0E7A57;background:#E3F3EC">Botón de WhatsApp siempre visible</div>'; n++; }
      pg.innerHTML = html;
      el.querySelector('#url').textContent = ({ clinica: 'clinicasonrisa.cr', tienda: 'casaverde.cr', resto: 'sabortico.cr' })[st.t];
      var w = f.shop ? [6, 10] : [4, 6];
      D.tween(el.querySelector('#m1'), f.shop ? 94 : 98, { dur: 900 });
      el.querySelector('#m2').textContent = w[0] + ' a ' + w[1];
      D.tween(el.querySelector('#m3'), n, { dur: 600 });
    }
    pick(el, '.dm-ctl > div:first-child', function (v) { st.t = v; render(); });
    el.querySelectorAll('[data-sw]').forEach(function (s) { s.addEventListener('click', function () { s.classList.toggle('on'); st.f[s.dataset.sw] = s.classList.contains('on'); render(); }); });
    pick(el, '#dv', function (v) { bw.className = 'bw' + (v === 'bw' ? '' : ' ' + v); });
    render();
  };

  /* ── Rediseño: slider antes / después ────────────────────────── */
  D.rediseno = function (el) {
    el.innerHTML = '<div class="dm" style="grid-template-columns:1fr"><div class="dm-view" style="min-height:0"><div class="ba" id="ba" style="--p:50%">' +
      '<div class="ba-layer ba-old"><div class="old-site"><div class="mq">*** BIENVENIDOS A NUESTRA PAGINA WEB *** LLAME YA 2222-0000 *** OFERTAS ***</div><h4>Clinica Sonrisa - Odontologia General</h4><div class="row"><span>Inicio</span><span>Quienes somos</span><span>Servicios</span><span>Fotos</span><span>Links</span><span>Contacto</span></div><table class="ot"><tr><td>Foto1</td><td><p>Somos una clinica con mas de 15 años de experiencia en el mercado, ofrecemos los mejores precios y la mejor atencion para nuestros pacientes en todo el pais.</p><p><b>Servicios:</b> limpieza, extracciones, ortodoncia, blanqueamiento, endodoncia, protesis...</p></td></tr></table><p class="ol">Para citas llame al 2222-0000 de lunes a viernes de 8 a 5. No se aceptan citas por internet.</p><div class="row"><span>Foto2</span><span>Foto3</span><span>Foto4</span></div><p class="oc">Visitas: 004521 &nbsp; | &nbsp; Mejor vista en Internet Explorer 800x600 &nbsp; | &nbsp; Ultima actualizacion: 2009</p></div></div><div class="ba-layer ba-new"><div class="ns"><div class="ns-nav"><b>Clínica Sonrisa</b><span>Servicios</span><span>Equipo</span><span>Testimonios</span><span>Contacto</span><em>Agendar cita</em></div><div class="ns-hero"><div class="ns-copy"><small>Odontología en Heredia</small><h4>Tu sonrisa, en las mejores manos</h4><p>Agendá en línea en 30 segundos. Sin llamadas y sin esperas.</p><div class="ns-btns"><u>Agendar cita</u><i>Ver servicios</i></div></div><div class="ns-art"><i class="a"></i><i class="b"></i><div class="ns-card"><b>4.9</b><span>Valoración de nuestros pacientes</span></div><div class="ns-pill">Cita confirmada</div></div></div><div class="ns-cards"><div><s></s><b>Limpieza dental</b><span>Desde 30 minutos</span></div><div><s></s><b>Ortodoncia</b><span>Valoración gratis</span></div><div><s></s><b>Blanqueamiento</b><span>Resultado en 1 visita</span></div></div></div></div>' +
      '<span class="ba-lbl l">Antes</span><span class="ba-lbl r">Después</span><div class="ba-h" id="bh"></div></div>' +
      '<div class="chk" style="margin-top:16px" id="rk"></div></div></div><div class="dm-cap">Arrastrá la línea azul. Al rediseñar conservamos lo que ya ganaste en Google.</div>';
    var ba = el.querySelector('#ba'), drag = false;
    function mv(x) { var r = ba.getBoundingClientRect(); ba.style.setProperty('--p', Math.max(2, Math.min(98, (x - r.left) / r.width * 100)) + '%'); }
    ba.addEventListener('pointerdown', function (e) { drag = true; ba.setPointerCapture(e.pointerId); mv(e.clientX); });
    ba.addEventListener('pointermove', function (e) { if (drag) mv(e.clientX); });
    ba.addEventListener('pointerup', function () { drag = false; });
    var items = ['Redirecciones 301 de cada página', 'Mismas URLs importantes', 'Títulos y descripciones al día', 'Versión móvil primero', 'Velocidad medida antes y después', 'Datos estructurados nuevos'];
    var rk = el.querySelector('#rk'); items.forEach(function (t, i) { var b = document.createElement('button'); b.textContent = t; rk.appendChild(b); setTimeout(function () { b.classList.add('on'); }, 600 + i * 350); b.addEventListener('click', function () { b.classList.toggle('on'); }); });
    var a = 50, dir = -1, auto = setInterval(function () { if (drag) return; a += dir * .6; if (a < 22 || a > 78) dir *= -1; ba.style.setProperty('--p', a + '%'); }, 30);
    ba.addEventListener('pointerdown', function () { clearInterval(auto); }, { once: true });
  };

  /* ── Landing: calculadora de conversión ──────────────────────── */
  D.landing = function (el) {
    el.innerHTML = '<div class="dm"><div class="dm-ctl">' +
      '<div><div class="dm-label">Visitas al mes <b id="a1"></b></div><input class="rg" id="r1" type="range" min="200" max="20000" step="100" value="3000"></div>' +
      '<div><div class="dm-label">Conversión actual <b id="a2"></b></div><input class="rg" id="r2" type="range" min="2" max="60" step="1" value="10"></div>' +
      '<div><div class="dm-label">Conversión meta <b id="a3"></b></div><input class="rg" id="r3" type="range" min="5" max="150" step="1" value="30"></div>' +
      '<div><div class="dm-label">Valor de cada cliente <b id="a4"></b></div><input class="rg" id="r4" type="range" min="5000" max="300000" step="5000" value="40000"></div>' +
      '</div><div class="dm-view"><div class="bars"><div><b id="b1">0</b><div class="bar" id="h1"></div></div><div><b id="b2">0</b><div class="bar acc" id="h2"></div></div></div>' +
      '<div style="display:flex;gap:26px;padding:0 10px"><small style="flex:1;text-align:center;color:var(--ink3);font-size:13px">Clientes por mes hoy</small><small style="flex:1;text-align:center;color:var(--ink3);font-size:13px">Con tu meta</small></div>' +
      '<div class="dm-metrics" style="margin-top:18px"><div class="dm-m"><b id="o1">0</b><small>Clientes extra por mes</small></div><div class="dm-m hi"><b id="o2">0</b><small>Ingreso extra por mes</small></div></div></div></div>' +
      '<div class="dm-cap">Tú decides la meta. No prometemos un porcentaje: la landing se diseña para llegar a ella y se mide.</div>';
    var $ = function (s) { return el.querySelector(s); };
    function up() {
      var v = +$('#r1').value, c1 = $('#r2').value / 10, c2 = $('#r3').value / 10, val = +$('#r4').value;
      $('#a1').textContent = v.toLocaleString('es-CR'); $('#a2').textContent = c1.toFixed(1) + '%'; $('#a3').textContent = c2.toFixed(1) + '%'; $('#a4').textContent = fmt(val);
      var n1 = v * c1 / 100, n2 = v * c2 / 100, mx = Math.max(n1, n2, 1);
      $('#h1').style.height = (n1 / mx * 150) + 'px'; $('#h2').style.height = (n2 / mx * 150) + 'px';
      D.tween($('#b1'), n1, { dur: 500 }); D.tween($('#b2'), n2, { dur: 500 });
      D.tween($('#o1'), Math.max(0, n2 - n1), { dur: 500 }); D.tween($('#o2'), Math.max(0, n2 - n1) * val, { dur: 600, f: fmt });
    }
    el.querySelectorAll('input').forEach(function (i) { i.addEventListener('input', up); }); up();
  };

  /* ── Tienda: carrito y pago ──────────────────────────────────── */
  D.tienda = function (el) {
    var P = [['Camiseta de lino', 18500], ['Gorra de algodón', 9900], ['Bolso de mano', 24000]], cart = {}, pay = 'sinpe';
    el.innerHTML = '<div class="dm" style="grid-template-columns:1fr"><div class="dm-view" style="min-height:0"><div class="shop"><div id="pl"></div><div class="cart" id="ct"></div></div></div></div><div class="dm-cap">Catálogo, carrito y pagos como compran los ticos. Ejemplo ilustrativo con precios de muestra.</div>';
    var pl = el.querySelector('#pl'), ct = el.querySelector('#ct');
    pl.innerHTML = P.map(function (p, i) { return '<div class="prod"><div class="ph"></div><div class="n">' + p[0] + '<small>' + fmt(p[1]) + '</small></div><button class="dm-btn ghost" data-i="' + i + '" style="padding:8px 14px">Agregar</button></div>'; }).join('');
    function draw(done) {
      var ids = Object.keys(cart), sub = 0;
      if (done) { ct.innerHTML = '<div class="ok-card"><div class="ck"></div><b style="font-size:18px">Pedido #1042 recibido</b><p style="color:var(--ink3);font-size:14px;margin-top:6px">Pago por ' + ({ sinpe: 'SINPE Móvil', card: 'tarjeta', dep: 'depósito', cod: 'contra entrega' })[pay] + '. Se notificó al equipo por WhatsApp.</p><button class="dm-btn ghost" style="margin-top:14px" id="again">Hacer otro pedido</button></div>'; ct.querySelector('#again').onclick = function () { cart = {}; draw(); }; return; }
      if (!ids.length) { ct.innerHTML = '<div class="empty">Tu carrito está vacío.<br>Agregá un producto.</div>'; return; }
      var rows = ids.map(function (i) { var l = P[i][1] * cart[i]; sub += l; return '<div class="ln"><span>' + P[i][0] + '</span><span class="q"><button data-m="' + i + '">−</button>' + cart[i] + '<button data-p="' + i + '">+</button></span><span>' + fmt(l) + '</span></div>'; }).join('');
      var env = 2500;
      ct.innerHTML = '<b>Tu pedido</b>' + rows + '<div class="ln" style="color:var(--ink3)"><span>Envío por Correos de CR</span><span>' + fmt(env) + '</span></div>' +
        '<div class="seg" id="py" style="margin-top:6px">' + [['sinpe', 'SINPE Móvil'], ['card', 'Tarjeta'], ['dep', 'Depósito'], ['cod', 'Contra entrega']].map(function (x) { return '<button data-v="' + x[0] + '" class="' + (pay === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<div class="tot"><span>Total</span><span>' + fmt(sub + env) + '</span></div><button class="dm-btn" id="go">Pagar</button>';
      ct.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { cart[b.dataset.p]++; draw(); }; });
      ct.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { if (--cart[b.dataset.m] <= 0) delete cart[b.dataset.m]; draw(); }; });
      ct.querySelectorAll('#py button').forEach(function (b) { b.onclick = function () { pay = b.dataset.v; draw(); }; });
      ct.querySelector('#go').onclick = function () { draw(true); };
    }
    pl.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { cart[b.dataset.i] = (cart[b.dataset.i] || 0) + 1; draw(); }; });
    draw();
  };

  /* ── App de escritorio ───────────────────────────────────────── */
  D.escritorio = function (el) {
    var stock = [['Café molido 1 kg', 24], ['Azúcar 2 kg', 40], ['Leche 1 L', 18], ['Arroz 5 kg', 12]], sales = [['10:42', 'Café molido 1 kg', 4800], ['11:05', 'Leche 1 L', 1150]], tab = 'inv', off = false;
    el.innerHTML = '<div class="dm" style="grid-template-columns:1fr"><div class="dm-view" style="min-height:0"><div class="win"><div class="win-side"><b>Mi Negocio</b><button data-t="inv" class="on">Inventario</button><button data-t="ven">Ventas</button><button data-t="rep">Reportes</button><button id="off" style="margin-top:auto;color:var(--accent)">Probar sin internet</button></div><div class="win-main"><div class="win-st" id="st">Conectado</div><div id="vw"></div></div></div></div></div><div class="dm-cap">Un programa instalado en tu computadora. Funciona aunque se caiga el internet.</div>';
    var vw = el.querySelector('#vw'), st = el.querySelector('#st');
    function draw(flash) {
      if (tab === 'inv') { vw.innerHTML = '<b style="font-size:18px">Inventario</b><table class="tbl"><tr><th>Producto</th><th>Existencias</th><th></th></tr>' + stock.map(function (s, i) { return '<tr class="' + (flash === i ? 'flash' : '') + '"><td>' + s[0] + '</td><td>' + s[1] + (s[1] < 15 ? ' <span class="tag warn">Bajo</span>' : '') + '</td><td><button data-m="' + i + '">−</button> <button data-p="' + i + '">+</button></td></tr>'; }).join('') + '</table>'; vw.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { stock[b.dataset.p][1]++; draw(+b.dataset.p); }; }); vw.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { stock[b.dataset.m][1] = Math.max(0, stock[b.dataset.m][1] - 1); draw(+b.dataset.m); }; }); }
      else if (tab === 'ven') { vw.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">Ventas de hoy</b><button class="dm-btn" id="nv" style="padding:8px 14px">Nueva venta</button></div><table class="tbl"><tr><th>Hora</th><th>Detalle</th><th>Monto</th></tr>' + sales.map(function (s, i) { return '<tr class="' + (i === sales.length - 1 && flash ? 'flash' : '') + '"><td>' + s[0] + '</td><td>' + s[1] + '</td><td>' + fmt(s[2]) + '</td></tr>'; }).join('') + '</table><div style="text-align:right;font-weight:700;margin-top:10px">Total: ' + fmt(sales.reduce(function (a, s) { return a + s[2]; }, 0)) + '</div>'; vw.querySelector('#nv').onclick = function () { var p = stock[Math.floor(Math.random() * 4)]; var now = new Date(); sales.push([('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2), p[0], [4800, 1900, 1150, 3900][Math.floor(Math.random() * 4)]]); draw(true); }; }
      else { var v = [30, 52, 41, 70, 64, 88, 76]; vw.innerHTML = '<b style="font-size:18px">Ventas de la semana</b><div class="bars" style="height:200px;margin-top:14px;gap:12px">' + ['L', 'K', 'M', 'J', 'V', 'S', 'D'].map(function (d, i) { return '<div><div class="bar ' + (i === 5 ? 'acc' : '') + '" style="height:0" data-h="' + v[i] + '"></div><small>' + d + '</small></div>'; }).join('') + '</div>'; setTimeout(function () { vw.querySelectorAll('.bar').forEach(function (b) { b.style.height = b.dataset.h * 1.9 + 'px'; }); }, 30); }
    }
    el.querySelectorAll('.win-side [data-t]').forEach(function (b) { b.onclick = function () { el.querySelectorAll('.win-side [data-t]').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); tab = b.dataset.t; draw(); }; });
    el.querySelector('#off').onclick = function () { off = !off; st.textContent = off ? 'Sin internet · todo sigue funcionando' : 'Conectado'; st.classList.toggle('off', off); this.textContent = off ? 'Volver a conectar' : 'Probar sin internet'; };
    draw();
  };

  /* ── Auditoría SEO (simulación) ──────────────────────────────── */
  D.auditoria = function (el) {
    var steps = ['Rastreando páginas', 'Midiendo velocidad', 'Revisando títulos y descripciones', 'Probando en celular', 'Buscando enlaces rotos', 'Validando datos estructurados'];
    var F = [['bad', 'Imágenes sin comprimir', 'Pesan 4 veces más de lo necesario.'], ['warn', 'Faltan descripciones', 'Varias páginas no tienen meta descripción.'], ['bad', 'Sin datos estructurados', 'Google no sabe tu horario ni tu ubicación.'], ['warn', 'Títulos duplicados', 'Dos páginas compiten por la misma búsqueda.'], ['ok', 'Certificado HTTPS', 'Tu sitio es seguro.'], ['ok', 'Versión móvil', 'Se adapta bien a pantallas pequeñas.']];
    el.innerHTML = '<div class="dm"><div class="dm-ctl"><div><div class="dm-label">Tu sitio</div><div class="au-in"><input id="u" value="tunegocio.cr" aria-label="Dirección de tu sitio"><button class="dm-btn" id="go">Analizar</button></div></div><div class="au-steps" id="as">' + steps.map(function (s) { return '<div class="au-st"><i></i>' + s + '</div>'; }).join('') + '</div></div>' +
      '<div class="dm-view"><div class="gauge"><svg viewBox="0 0 170 170" width="170" height="170"><circle class="bg" cx="85" cy="85" r="74"/><circle class="fg" id="fg" cx="85" cy="85" r="74" stroke-dasharray="465" stroke-dashoffset="465"/></svg><b id="sc">–</b></div><div style="text-align:center;margin:8px 0 14px;font-size:14px;color:var(--ink3)" id="sl">Escribí tu dirección y tocá Analizar</div><div style="display:flex;flex-direction:column;gap:8px" id="fd"></div></div></div><div class="dm-cap">Simulación de ejemplo. La auditoría real revisa tu sitio completo y te entrega un plan priorizado.</div>';
    var run = false, $ = function (s) { return el.querySelector(s); };
    $('#go').onclick = function () {
      if (run) return; run = true; $('#fd').innerHTML = ''; $('#sc').textContent = '–'; $('#fg').style.strokeDashoffset = 465; $('#sl').textContent = 'Analizando…';
      var rows = el.querySelectorAll('.au-st'); rows.forEach(function (r) { r.className = 'au-st'; });
      var u = $('#u').value || 'x', h = 0; for (var i = 0; i < u.length; i++) h = (h * 31 + u.charCodeAt(i)) % 23;
      var score = 48 + h; var i = 0;
      (function nx() { if (i > 0) rows[i - 1].className = 'au-st done'; if (i < rows.length) { rows[i].className = 'au-st run'; i++; setTimeout(nx, 650); } else { $('#fg').style.strokeDashoffset = 465 * (1 - score / 100); D.tween($('#sc'), score, { dur: 1400 }); $('#sl').textContent = 'Puntaje SEO de ' + u; F.forEach(function (f, k) { setTimeout(function () { var d = document.createElement('div'); d.className = 'find reveal-in'; d.innerHTML = '<span class="tag ' + f[0] + '">' + ({ bad: 'Urgente', warn: 'Mejorar', ok: 'Bien' })[f[0]] + '</span><span><b>' + f[1] + '.</b> ' + f[2] + '</span>'; $('#fd').appendChild(d); }, 300 + k * 260); }); run = false; } })();
    };
  };

  /* ── SEO local: mapa y perfil ────────────────────────────────── */
  D.seolocal = function (el) {
    var on = { fotos: 0, horario: 0, cat: 0, resenas: 0 };
    el.innerHTML = '<div class="dm"><div class="dm-ctl"><div><div class="dm-label">Tu perfil de Google <b id="pc">20%</b></div><div class="chk" id="ck"><button data-k="fotos">Fotos reales</button><button data-k="horario">Horario al día</button><button data-k="cat">Categorías correctas</button><button data-k="resenas">Reseñas respondidas</button></div></div><div class="dm-metrics" style="grid-template-columns:1fr 1fr"><div class="dm-m"><b id="rt">3.8</b><small>Calificación</small></div><div class="dm-m"><b id="rv">12</b><small>Reseñas</small></div></div><button class="dm-btn" id="all">Optimizar todo</button></div>' +
      '<div class="dm-view"><div class="mp"><div class="map"><svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice"><path d="M0 90 H400 M0 230 H400 M110 0 V320 M290 0 V320" stroke="#fff" stroke-width="14" fill="none"/><path d="M0 160 L400 120" stroke="#fff" stroke-width="8" fill="none"/><rect x="130" y="100" width="70" height="40" fill="#D4E5D2"/><rect x="310" y="240" width="70" height="60" fill="#D4E5D2"/></svg><div class="pin" style="left:30%;top:36%"></div><div class="pin" style="left:72%;top:30%"></div><div class="pin me" id="pm" style="left:52%;top:72%"></div></div>' +
      '<div class="lst" id="ls"></div></div></div></div><div class="dm-cap">Así se mueve tu negocio en Google Maps cuando el perfil está completo. Datos de ejemplo.</div>';
    var $ = function (s) { return el.querySelector(s); }, names = ['Veterinaria Central', 'PetCare Express', 'Tu negocio'];
    function stars(r) { var n = Math.round(r); return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
    function draw() {
      var k = Object.keys(on).filter(function (x) { return on[x]; }).length, pct = 20 + k * 20, rating = 3.8 + k * .25, rev = 12 + k * 19;
      $('#pc').textContent = pct + '%'; D.tween($('#rt'), rating, { dec: 1, dur: 700 }); D.tween($('#rv'), rev, { dur: 700 });
      var rank = k >= 3 ? 0 : (k >= 1 ? 1 : 2), items = [['Veterinaria Central', 4.4, 86], ['PetCare Express', 4.1, 40]]; items.splice(rank, 0, ['Tu negocio', rating, rev]);
      $('#ls').innerHTML = items.map(function (x) { return '<div class="li ' + (x[0] === 'Tu negocio' ? 'me' : '') + '"><b>' + (items.indexOf(x) + 1) + '. ' + x[0] + '</b><span class="stars">' + stars(x[1]) + '</span> ' + x[1].toFixed(1) + ' (' + x[2] + ')</div>'; }).join('');
      $('#pm').classList.toggle('hot', rank === 0); $('#pm').style.left = rank === 0 ? '48%' : '52%'; $('#pm').style.top = rank === 0 ? '55%' : '72%';
      el.querySelectorAll('#ck button').forEach(function (b) { b.classList.toggle('on', !!on[b.dataset.k]); });
    }
    el.querySelectorAll('#ck button').forEach(function (b) { b.onclick = function () { on[b.dataset.k] = on[b.dataset.k] ? 0 : 1; draw(); }; });
    $('#all').onclick = function () { var keys = Object.keys(on), i = 0; (function n() { if (i < keys.length) { on[keys[i++]] = 1; draw(); setTimeout(n, 450); } })(); };
    draw();
  };
})();
