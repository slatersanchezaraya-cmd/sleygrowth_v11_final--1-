/* Asistente de Sley Growth AI: responde con la informacion del sitio y arma la consulta completa
   para enviarla por el sitio o por WhatsApp. Funciona sin servidor: usa assets/kb.js. */
(function () {
  var KB = window.SG_KB; if (!KB) return;
  var inSrv = location.pathname.indexOf('/servicios/') > -1;
  var WA = KB.company.whatsapp;
  var PRESU = ['Menos de $800', '$800 – $1,500', '$1,500 – $3,000', 'Más de $3,000', 'Necesito orientación'];
  var STOP = 'de la el los las un una unos unas y o a en por para con que es son mi mis tu tus su sus al del lo se me te como cual quiero quieres necesito puedo pueden hacen hace tienen tiene hay sobre este esta eso esas'.split(' ');

  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$\/ ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function words(t) { return norm(t).split(' ').filter(function (w) { return w.length > 3 && STOP.indexOf(w) < 0; }); }
  function has(t, a) { return (' ' + t + ' ').indexOf(' ' + a + ' ') > -1; }
  function url(s) { return (inSrv ? '' : 'servicios/') + s.slug + '.html'; }
  function find(slug) { return KB.services.filter(function (s) { return s.slug === slug; })[0]; }
  var here = inSrv ? find(location.pathname.split('/').pop().replace('.html', '')) : null;

  /* ── estado ── */
  var S = { log: [], flow: null, topics: [], sent: 0 };
  try { var raw = sessionStorage.getItem('sg_chat'); if (raw) S = JSON.parse(raw); } catch (e) {}
  function save() { try { sessionStorage.setItem('sg_chat', JSON.stringify(S)); } catch (e) {} }

  /* ── interfaz ── */
  var root = document.createElement('div'); root.className = 'cb-root';
  root.innerHTML = '<button class="cb-launch" type="button" aria-label="Abrir el asistente"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/></svg><span>Preguntale al asistente</span></button>' +
    '<div class="cb-tip" hidden></div>' +
    '<section class="cb" role="dialog" aria-label="Asistente de Sley Growth AI" hidden>' +
    '<header class="cb-h"><div class="cb-av">S</div><div class="cb-t"><b>Asistente de Sley Growth</b><small><i></i>Responde al instante</small></div><button class="cb-x" type="button" aria-label="Cerrar">&times;</button></header>' +
    '<div class="cb-b" aria-live="polite"></div><div class="cb-c"></div>' +
    '<form class="cb-f" autocomplete="off"><input type="text" placeholder="Escribí tu pregunta" aria-label="Tu mensaje" maxlength="400"><button type="submit">Enviar</button></form>' +
    '<div class="cb-n">Asistente automático. Tus datos solo se usan para responderte (<a href="' + (inSrv ? '../' : '') + 'privacidad.html">privacidad</a>).</div></section>';
  document.body.appendChild(root);
  var launch = root.querySelector('.cb-launch'), tip = root.querySelector('.cb-tip'), box = root.querySelector('.cb'), body = root.querySelector('.cb-b'), chips = root.querySelector('.cb-c'), form = root.querySelector('.cb-f'), input = form.querySelector('input');

  function scroll() { body.scrollTop = body.scrollHeight; }
  function add(role, html, noSave) { var m = document.createElement('div'); m.className = 'cb-m ' + role; m.innerHTML = html; body.appendChild(m); scroll(); if (!noSave) { S.log.push({ r: role, h: html }); save(); } return m; }
  function setChips(list) {
    chips.innerHTML = ''; (list || []).forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.textContent = c.l; b.className = c.cls || ''; b.onclick = function () { if (c.href) { window.open(c.href, '_blank', 'noopener'); return; } chips.innerHTML = ''; c.a(); }; chips.appendChild(b); });
    S.chips = (list || []).filter(function (c) { return !c.href && c.k; }).map(function (c) { return c.k; }); scroll();
  }
  function typing(cb, ms) { var t = add('b typing', '<i></i><i></i><i></i>', true); chips.innerHTML = ''; setTimeout(function () { t.remove(); cb(); }, ms || 650); }
  function say(html, list, ms) { typing(function () { add('b', html); setChips(list); }, ms); }

  function open() { box.hidden = false; launch.classList.add('gone'); tip.hidden = true; root.classList.add('open'); try { sessionStorage.setItem('sg_open', '1'); } catch (e) {} if (!S.log.length) greet(); else if (!body.children.length) restore(); setTimeout(function () { input.focus(); }, 50); scroll(); }
  function close() { box.hidden = true; launch.classList.remove('gone'); root.classList.remove('open'); try { sessionStorage.removeItem('sg_open'); } catch (e) {} }
  launch.onclick = open; root.querySelector('.cb-x').onclick = close;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
  function restore() { body.innerHTML = ''; S.log.forEach(function (m) { add(m.r, m.h, true); }); setChips(S.flow ? (S.flow.step === 'resumen' ? summaryChips() : [{ l: 'Cancelar', a: cancel }]) : homeChips()); }

  /* ── respuestas ── */
  var svcChips = function () { return KB.services.map(function (s) { return { l: s.name, a: function () { ask(s.name); }, k: 's:' + s.slug }; }); };
  function homeChips() {
    var c = [{ l: 'Ver servicios', a: function () { ask('¿Qué servicios ofrecen?'); } }, { l: 'Precios', a: function () { ask('¿Cuánto cuesta?'); } }, { l: 'Plazos', a: function () { ask('¿Cuánto tarda un proyecto?'); } }, { l: 'Quiero cotizar', a: quote, cls: 'pri' }];
    return c;
  }
  function greet() {
    if (here) { say('Hola, soy el asistente de Sley Growth AI. Veo que estás mirando <b>' + esc(here.short) + '</b>. Te puedo contar qué incluye, cuánto cuesta y cuánto tarda, o armar tu consulta para el equipo.', [{ l: 'Qué incluye', a: function () { ask('¿Qué incluye ' + here.name + '?'); } }, { l: 'Cuánto cuesta', a: function () { ask('¿Cuánto cuesta ' + here.name + '?'); } }, { l: 'Cuánto tarda', a: function () { ask('¿Cuánto tarda ' + here.name + '?'); } }, { l: 'Quiero cotizar', a: quote, cls: 'pri' }], 500); topic(here); }
    else say('Hola, soy el asistente de Sley Growth AI. Sé todo sobre nuestros servicios: desarrollo web, SEO, automatización de WhatsApp, CRM y más. ¿Qué querés saber?', homeChips(), 500);
  }
  function topic(s) { if (s && S.topics.indexOf(s.name) < 0) { S.topics.push(s.name); save(); } }
  function link(s, extra) { return '<a class="cb-a" href="' + url(s) + (extra || '') + '">Ver ' + esc(s.short) + '</a>'; }
  function list(items, n) { return '<ul>' + items.slice(0, n || 3).map(function (i) { return '<li><b>' + esc(i.t) + '.</b> ' + esc(i.d) + '</li>'; }).join('') + '</ul>'; }
  function follow(s) {
    return [{ l: 'Cuánto cuesta', a: function () { ask('¿Cuánto cuesta ' + s.name + '?'); } }, { l: 'Cuánto tarda', a: function () { ask('¿Cuánto tarda ' + s.name + '?'); } }, { l: 'Cómo trabajan', a: function () { ask('¿Cómo es el proceso de ' + s.name + '?'); } }, { l: 'Cotizar esto', a: function () { startLead(s.name); }, cls: 'pri' }];
  }
  var TIME = 'Una <b>landing page</b> suele tomar 1 a 2 semanas, un <b>sitio web completo</b> de 4 a 6 semanas, y un <b>e-commerce</b> o un sistema con automatizaciones de 6 a 10 semanas. El cronograma exacto queda fijo en la propuesta, antes de empezar.';
  var PRICE = 'Como referencia: <b>landing pages desde $450</b>, <b>sitios corporativos desde $900</b> y <b>agentes de IA o automatizaciones desde $950</b>. Cada proyecto se cotiza por alcance y queda fijo en la propuesta, sin costos ocultos.';

  function bestService(t) {
    var best = null, sc = 0;
    KB.services.forEach(function (s) {
      var v = 0; s.aliases.concat([norm(s.name), norm(s.short)]).forEach(function (a) { a = norm(a); if (has(t, a)) v += a.split(' ').length * 2 + 1; });
      if (v > sc) { sc = v; best = s; }
    });
    return sc > 0 ? best : null;
  }
  function bestFaq(t) {
    var w = words(t); if (/(panama|mexico|colombia|guatemala|nicaragua|honduras|salvador|usa|estados unidos|espana|chile|argentina|peru|ecuador|extranjero|otro pais|internacional|afuera|fuera)/.test(t)) w = w.concat(['empresas', 'fuera', 'costa', 'rica', 'trabajan']);
    if (!w.length) return null; var best = null, sc = 0;
    var pool = KB.faq.map(function (f) { return { f: f, s: null }; });
    KB.services.forEach(function (s) { s.faq.forEach(function (f) { pool.push({ f: f, s: s }); }); });
    pool.forEach(function (p) { var q = words(p.f.q), a = words(p.f.a), v = 0; w.forEach(function (x) { if (q.indexOf(x) > -1) v += 3; else if (a.indexOf(x) > -1) v += 1; }); if (v > sc) { sc = v; best = p; } });
    return sc >= 4 ? best : null;
  }

  function answer(raw) {
    var t = norm(raw), s = bestService(t);
    if (/^(hola|buenas|buenos dias|buen dia|buenas tardes|buenas noches|hey|saludos|que tal)\b/.test(t) && t.split(' ').length < 5) return say('Hola, ¿en qué te puedo ayudar? Podés preguntarme por cualquier servicio, precios, plazos o dejar tu consulta.', homeChips());
    if (/\b(gracias|muchas gracias|genial|perfecto|excelente|listo)\b/.test(t) && t.split(' ').length < 5) return say('Con gusto. Si querés, armo tu consulta para que el equipo te contacte.', [{ l: 'Quiero cotizar', a: quote, cls: 'pri' }, { l: 'Otra pregunta', a: function () { say('Dale, preguntame lo que quieras.', homeChips(), 400); } }]);
    if (/\b(cotizar|cotizacion|contratar|agendar|auditoria gratis|reunion|llamada|contactenme|contactarme|me contacten|dejar mis datos|dejar mi consulta|enviar consulta|presupuesto personalizado|hablar con (alguien|un asesor|una persona|ustedes))\b/.test(t) && !/cuanto/.test(t)) return startLead(s ? s.name : null);
    if (/\b(whatsapp|wasap|guasap)\b/.test(t) && !s && /\b(escribir|escribirles|escribirme|hablar|contacto|contactar|mandar|enviar|humano|persona|asesor)\b/.test(t)) return handoff();
    if (/\b(humano|persona real|asesor|alguien del equipo)\b/.test(t)) return handoff();
    if (/\b(que servicios|servicios|que ofrecen|que hacen|en que me pueden ayudar|que venden)\b/.test(t) && !s) return say('Trabajamos en tres áreas:<ul><li><b>Desarrollo:</b> sitios web, rediseño, landing pages, tiendas online y apps de escritorio.</li><li><b>SEO:</b> auditoría, SEO local y SEO técnico.</li><li><b>IA y automatización:</b> WhatsApp con IA, CRM, integraciones, sistemas de trabajo automáticos y edición de contenido.</li></ul>¿Cuál te interesa?', svcChips().slice(0, 13), 700);
    if (/\bseo\b/.test(t) && !s) return say('Tenemos tres servicios de SEO: la <b>auditoría</b> (diagnóstico y plan), el <b>SEO local</b> (Google Maps y búsquedas cercanas) y el <b>SEO técnico</b> (velocidad e indexación). ¿Cuál se parece más a lo que necesitás?', [{ l: 'Auditoría SEO', a: function () { ask('Auditoría SEO'); } }, { l: 'SEO local', a: function () { ask('SEO local'); } }, { l: 'SEO técnico', a: function () { ask('SEO técnico'); } }]);
    if (/\b(ia|inteligencia artificial|automatizar|automatizacion)\b/.test(t) && !s) return say('En IA y automatización tenemos: <b>WhatsApp con IA</b> (atiende, vende y agenda), <b>CRM para pymes</b>, <b>integraciones</b> entre tus apps y <b>sistemas de trabajo automáticos</b>. ¿Cuál querés ver?', [{ l: 'WhatsApp con IA', a: function () { ask('Automatización de WhatsApp'); } }, { l: 'CRM', a: function () { ask('CRM para pymes'); } }, { l: 'Integraciones', a: function () { ask('Integraciones'); } }, { l: 'Sistemas automáticos', a: function () { ask('Sistemas de trabajo automáticos'); } }]);
    var price = /\b(precio|precios|cuanto cuesta|cuanto vale|cuanto sale|costo|costos|tarifa|cobran|inversion|cuanto cobran)\b/.test(t), time = /\b(cuanto tarda|cuanto demora|plazo|plazos|tiempo|cuando estaria|semanas|duracion|tardan|demoran)\b/.test(t), steps = /\b(proceso|pasos|como trabajan|metodologia|etapas|como es el proceso)\b/.test(t), inc = /\b(incluye|incluyen|que es|en que consiste|como funciona|de que trata|que hacen|que ofrece)\b/.test(t);
    if (s) {
      topic(s);
      if (price) return say(s.price ? '<b>' + esc(s.name) + ':</b> ' + esc(s.price.replace(/\s*\+ mantenimiento mensual/, '')) + ', más un mantenimiento mensual opcional. El alcance exacto se fija en la propuesta, sin costos ocultos.' : '<b>' + esc(s.name) + '</b> se cotiza según el alcance de tu proceso. En la auditoría gratis de 45 minutos te damos el número.', follow(s).concat([]), 700);
      if (time) return say('<b>' + esc(s.name) + ':</b> ' + TIME, follow(s));
      if (steps && s.steps.length) return say('Así trabajamos <b>' + esc(s.short) + '</b>:<ul>' + s.steps.map(function (p, i) { return '<li><b>' + (i + 1) + '. ' + esc(p.t) + '.</b> ' + esc(p.d) + '</li>'; }).join('') + '</ul>', follow(s), 800);
      var f = bestFaq(t); if (f && f.s === s && !inc && /\?|^(que|como|cual|cuanto|cuando|donde|quien|puedo|pueden|se puede|hacen|tienen|es posible|funciona)/.test(raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim())) return say(esc(f.f.a), follow(s));
      var det = s.details.length ? s.details[0] : null;
      return say('<b>' + esc(s.short) + '.</b> ' + esc(s.desc) + (s.includes.length ? list(s.includes, 3) : (det ? '<ul><li><b>' + esc(det.t) + '.</b> ' + esc(det.d) + '</li></ul>' : '')) + (s.price ? 'Desde <b>' + esc(s.price.replace(/Desde\s*/, '').replace(/\s*\+ mantenimiento mensual/, '')) + '</b>. ' : '') + link(s) + (find(s.slug) ? ' <a class="cb-a" href="' + url(s) + '#demo">Probar la demo</a>' : ''), follow(s), 800);
    }
    if (price) return say(PRICE + ' Decime qué servicio te interesa y te doy el detalle.', svcChips().slice(0, 6).concat([{ l: 'Quiero cotizar', a: quote, cls: 'pri' }]), 700);
    if (time) return say(TIME, [{ l: 'Quiero cotizar', a: quote, cls: 'pri' }, { l: 'Ver servicios', a: function () { ask('¿Qué servicios ofrecen?'); } }]);
    if (/\b(donde estan|ubicacion|direccion|donde queda|donde trabajan|pais|costa rica)\b/.test(t)) return say('Estamos en <b>' + esc(KB.company.place) + '</b> y atendemos a ' + esc(KB.company.zones) + '.', homeChips());
    if (/\b(telefono|numero|llamar|celular|correo|email|contacto)\b/.test(t)) return say('Nos podés escribir por WhatsApp al <b>' + esc(KB.company.phone) + '</b> o dejar tu consulta aquí mismo y te respondemos en menos de 2 horas hábiles.', [{ l: 'Abrir WhatsApp', a: handoff }, { l: 'Dejar mi consulta', a: quote, cls: 'pri' }]);
    var fq = bestFaq(t); if (fq) { if (fq.s) topic(fq.s); return say(esc(fq.f.a), [{ l: 'Quiero cotizar', a: quote, cls: 'pri' }, { l: 'Otra pregunta', a: function () { say('Dale, preguntame.', homeChips(), 300); } }], 800); }
    S.miss = (S.miss || 0) + 1; save();
    return say('No tengo ese dato exacto a mano, y prefiero no inventarlo. Puedo pasarle tu pregunta al equipo con tus datos, o te muestro lo que sí sé.', [{ l: 'Dejar mi consulta', a: quote, cls: 'pri' }, { l: 'Escribir por WhatsApp', a: handoff }, { l: 'Ver servicios', a: function () { ask('¿Qué servicios ofrecen?'); } }], 700);
  }
  function ask(text) { add('u', esc(text)); chips.innerHTML = ''; if (S.flow) { return flowIn(text); } answer(text); }

  /* ── WhatsApp ── */
  function waText(d) {
    var topics = S.topics.length ? S.topics.join(', ') : 'información general';
    if (!d) return 'Hola, vengo del sitio de Sley Growth AI y quiero consultar sobre: ' + topics + '.';
    return 'Hola, vengo del sitio de Sley Growth AI. Dejo mi consulta completa:\n\nNombre: ' + d.nombre + '\nEmpresa: ' + d.empresa + '\nCorreo: ' + d.email + '\nTeléfono: ' + d.telefono + '\nServicio de interés: ' + d.servicio + '\nPresupuesto: ' + d.presupuesto + '\n¿Qué quiero resolver?: ' + d.mensaje;
  }
  function waUrl(d) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText(d)); }
  function handoff() {
    say('Te paso a WhatsApp con tu consulta ya escrita' + (S.topics.length ? ' (<b>' + esc(S.topics.join(', ')) + '</b>)' : '') + ', así quien te atienda sabe de qué se trata. Si preferís, antes dejá todos tus datos y llega completa.', [{ l: 'Abrir WhatsApp', href: waUrl(), cls: 'wa' }, { l: 'Dejar mis datos primero', a: quote, cls: 'pri' }], 600);
  }

  /* ── captura de datos ── */
  var STEPS = ['nombre', 'empresa', 'email', 'telefono', 'servicio', 'presupuesto', 'mensaje'];
  function quote() { add('u', 'Quiero cotizar'); startLead(); }
  function startLead(pre) {
    S.flow = { step: 'nombre', d: {} }; if (typeof pre === 'string' && pre) S.flow.d.servicio = pre; else if (S.topics.length === 1) S.flow.pre = S.topics[0]; save();
    say('Perfecto, armo tu consulta completa y se la entrego al equipo. Son 7 preguntas cortas, y podés escribir <b>volver</b> para corregir. ¿Cómo te llamás?', [{ l: 'Cancelar', a: cancel }], 600);
  }
  function cancel() { S.flow = null; save(); say('Listo, cancelado. Seguimos con tus preguntas.', homeChips(), 400); }
  function prompt(step, msg) {
    var d = S.flow.d;
    if (step === 'nombre') return say(msg || '¿Cómo te llamás?', [{ l: 'Cancelar', a: cancel }], 400);
    if (step === 'empresa') return say(msg || ('Mucho gusto, ' + esc(d.nombre.split(' ')[0]) + '. ¿Cómo se llama tu empresa o negocio?'), [{ l: 'Soy independiente', a: function () { ask('Independiente'); } }, { l: 'Cancelar', a: cancel }], 500);
    if (step === 'email') return say(msg || '¿Cuál es tu correo electrónico?', [{ l: 'Cancelar', a: cancel }], 450);
    if (step === 'telefono') return say(msg || '¿Y tu teléfono o WhatsApp? (con código si es de otro país)', [{ l: 'Cancelar', a: cancel }], 450);
    if (step === 'servicio') {
      var c = [];
      if (S.flow.pre && !d.servicio) c.push({ l: 'Sí, ' + S.flow.pre, a: function () { ask(S.flow.pre); }, cls: 'pri' });
      KB.services.forEach(function (s) { c.push({ l: s.name, a: function () { ask(s.name); } }); }); c.push({ l: 'No sé, necesito asesoría', a: function () { ask('No sé, necesito asesoría'); } });
      return say(msg || (S.flow.pre && !d.servicio ? '¿Tu consulta es sobre <b>' + esc(S.flow.pre) + '</b> o sobre otro servicio?' : '¿Qué servicio te interesa?'), c, 500);
    }
    if (step === 'presupuesto') return say(msg || '¿Qué presupuesto aproximado tenés en mente?', PRESU.map(function (p) { return { l: p, a: function () { ask(p); } }; }), 450);
    if (step === 'mensaje') return say(msg || 'Por último, contame en una frase qué querés resolver.', [{ l: 'Prefiero que me llamen para explicarlo', a: function () { ask('Prefiero que me llamen para explicarlo'); } }], 450);
  }
  function validate(step, v) {
    if (step === 'nombre') return v.length >= 2 && v.length <= 80 && /[a-zA-ZÁÉÍÓÚáéíóúñÑ]/.test(v) ? '' : 'Escribí tu nombre, por favor.';
    if (step === 'empresa') return v.length >= 2 ? '' : 'Escribí el nombre de tu empresa o "Independiente".';
    if (step === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Ese correo no parece válido. Revisalo y escribilo de nuevo.';
    if (step === 'telefono') return v.replace(/\D/g, '').length >= 8 ? '' : 'El teléfono debe tener al menos 8 números.';
    if (step === 'servicio') return v.length >= 2 ? '' : 'Elegí un servicio.';
    if (step === 'presupuesto') return v.length >= 2 ? '' : 'Elegí un rango.';
    if (step === 'mensaje') return v.length >= 8 ? '' : 'Contame un poco más (al menos una frase corta).';
    return '';
  }
  function flowIn(text) {
    var f = S.flow, v = text.trim(), t = norm(v);
    if (t === 'cancelar') return cancel();
    if (t === 'volver' || t === 'atras') { var i = STEPS.indexOf(f.step); if (f.step === 'resumen') i = STEPS.length; if (i > 0) { f.step = STEPS[i - 1]; if (f.step === 'servicio' && S.flow.d.servicio && !S.flow.pre) { delete f.d.servicio; } save(); return prompt(f.step); } return prompt('nombre'); }
    if (f.step === 'resumen') { return say('Usá los botones para enviar tu consulta, o escribí <b>volver</b> para corregir.', summaryChips()); }
    var step = f.step, err = validate(step, v);
    if (step === 'servicio') { var m = KB.services.filter(function (s) { return norm(s.name) === t || norm(s.short) === t; })[0] || bestService(t); if (m) v = m.name; else if (/(no se|asesoria|no estoy seguro)/.test(t)) v = 'No sé, necesito asesoría'; else err = 'Elegí un servicio de la lista o escribí su nombre.'; }
    if (step === 'presupuesto') { var pm = PRESU.filter(function (x) { return norm(x) === t; })[0]; if (pm) v = pm; else if (!/\d/.test(v) && !/orientacion/.test(t)) err = 'Elegí un rango de la lista o escribí una cifra aproximada.'; }
    if (err) return prompt(step, err);
    f.d[step] = v;
    var next = STEPS[STEPS.indexOf(step) + 1];
    if (step === 'nombre' && f.d.servicio) { /* servicio ya traido del contexto */ }
    if (next === 'servicio' && f.d.servicio) next = 'presupuesto';
    if (!next) return summary();
    f.step = next; save(); prompt(next);
  }
  function summaryChips() { return [{ l: 'Enviar y abrir WhatsApp', a: function () { send(true); }, cls: 'pri' }, { l: 'Solo enviar por el sitio', a: function () { send(false); } }, { l: 'Corregir', a: function () { S.flow.step = 'nombre'; S.flow.d = {}; save(); say('Empecemos de nuevo. ¿Cómo te llamás?', []); } }]; }
  function summary() {
    var d = S.flow.d; S.flow.step = 'resumen'; save();
    say('Revisá que esté todo bien:<div class="cb-sum"><div><span>Nombre</span>' + esc(d.nombre) + '</div><div><span>Empresa</span>' + esc(d.empresa) + '</div><div><span>Correo</span>' + esc(d.email) + '</div><div><span>Teléfono</span>' + esc(d.telefono) + '</div><div><span>Servicio</span>' + esc(d.servicio) + '</div><div><span>Presupuesto</span>' + esc(d.presupuesto) + '</div><div><span>Quiero resolver</span>' + esc(d.mensaje) + '</div></div>Al enviar aceptás que usemos estos datos solo para contactarte.', summaryChips(), 700);
  }
  function send(withWa) {
    var d = S.flow.d; chips.innerHTML = '';
    if (Date.now() - (S.sent || 0) < 30000) return say('Tu consulta ya se envió hace un momento. Si querés agregar algo, escribinos por WhatsApp.', [{ l: 'Abrir WhatsApp', href: waUrl(d), cls: 'wa' }]);
    var wa = withWa ? window.open('', '_blank') : null; /* se abre en el clic para evitar bloqueo de ventanas */
    add('b typing', '<i></i><i></i><i></i>', true);
    var tp = body.lastChild;
    (window.SGLead ? window.SGLead.send(d) : Promise.resolve({ ok: false })).then(function (r) {
      tp.remove();
      if (r.ok) { S.sent = Date.now(); S.flow = null; save(); if (wa) wa.location.href = waUrl(d); add('b', '<b>Listo, ' + esc(d.nombre.split(' ')[0]) + '.</b> Tu consulta llegó completa al equipo y te respondemos en menos de 2 horas hábiles.' + (withWa ? ' Se abrió WhatsApp con el mismo resumen, solo falta que lo envíes.' : '')); setChips([{ l: 'Abrir WhatsApp', href: waUrl(d), cls: 'wa' }, { l: 'Otra pregunta', a: function () { say('Dale, preguntame.', homeChips(), 300); } }]); }
      else { if (wa) wa.close(); S.flow.step = 'resumen'; save(); add('b', 'No pudimos enviar tu consulta por el sitio. Podés mandarla por WhatsApp con todo el resumen ya escrito.'); setChips([{ l: 'Abrir WhatsApp', href: waUrl(d), cls: 'wa' }, { l: 'Reintentar', a: function () { send(false); } }]); }
    });
  }

  form.onsubmit = function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; ask(v); };

  /* ── apertura ── */
  window.SGChat = { open: open, ask: function (t) { open(); setTimeout(function () { ask(t); }, 300); } };
  var wasOpen = false; try { wasOpen = sessionStorage.getItem('sg_open') === '1'; } catch (e) {}
  if (wasOpen) open();
  else {
    var shown = false; try { shown = sessionStorage.getItem('sg_tip') === '1'; } catch (e) {}
    if (!shown) setTimeout(function () {
      if (!box.hidden) return; tip.innerHTML = '<b>' + (here ? '¿Dudas sobre ' + esc(here.short) + '?' : '¿Tenés alguna pregunta?') + '</b><span>Te respondo al instante.</span>'; tip.hidden = false; try { sessionStorage.setItem('sg_tip', '1'); } catch (e) {}
      tip.onclick = open; setTimeout(function () { tip.hidden = true; }, 9000);
    }, 8000);
  }
})();
