/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Backend formulario de contacto
   Envía a Supabase (tabla contactos) y Google Sheets (Apps Script)
   ═══════════════════════════════════════════════════════════════ */

/* ── Cookie consent banner ── */
(function () {
  const KEY = 'sg_cookie_consent';
  if (localStorage.getItem(KEY)) return;

  const css = `
#sg-cookie-overlay{position:fixed;inset:0;z-index:99999;background:rgba(5,8,22,.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .45s ease}
#sg-cookie-overlay.sg-visible{opacity:1;pointer-events:all}
#sg-cookie{background:rgba(11,14,34,.99);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:40px 36px;max-width:460px;width:100%;box-shadow:0 40px 100px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.07);position:relative;transform:translateY(28px) scale(.96);transition:transform .45s cubic-bezier(.22,1,.36,1);font-family:'Inter',sans-serif}
#sg-cookie-overlay.sg-visible #sg-cookie{transform:translateY(0) scale(1)}
#sg-cookie::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#00D4FF,#8B5CF6);border-radius:20px 20px 0 0}
#sg-cookie-logo{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;letter-spacing:-0.04em;color:#fff;margin-bottom:20px}
#sg-cookie-logo em{background:linear-gradient(135deg,#00D4FF,#8B5CF6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:normal}
#sg-cookie h3{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.03em;margin-bottom:10px}
#sg-cookie p{font-size:13px;color:rgba(255,255,255,.6);line-height:1.7;margin:0 0 28px}
#sg-cookie p a{color:#00D4FF;text-decoration:none}
#sg-cookie p a:hover{text-decoration:underline}
#sg-cookie-btns{display:flex;flex-direction:column;gap:10px}
.sg-ck-accept{padding:14px;background:linear-gradient(135deg,#00D4FF,#8B5CF6);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.05em;text-transform:uppercase;transition:opacity .2s,transform .2s;box-shadow:0 8px 30px rgba(0,212,255,.25)}
.sg-ck-accept:hover{opacity:.88;transform:translateY(-1px)}
.sg-ck-reject{padding:12px;background:transparent;color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;transition:color .2s,border-color .2s;text-align:center}
.sg-ck-reject:hover{color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.25)}
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const privacyPath = (function () {
    const depth = location.pathname.split('/').filter(Boolean).length;
    return depth >= 2 ? '../privacidad.html' : 'privacidad.html';
  })();

  const overlay = document.createElement('div');
  overlay.id = 'sg-cookie-overlay';
  overlay.innerHTML = `
    <div id="sg-cookie">
      <div id="sg-cookie-logo">SLEY<em>GROWTH.</em></div>
      <h3>Usamos cookies</h3>
      <p>Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el uso del sitio y personalizar contenido. Al continuar navegando aceptás su uso. <a href="${privacyPath}">Política de privacidad</a>.</p>
      <div id="sg-cookie-btns">
        <button class="sg-ck-accept" id="sg-ck-accept">Aceptar cookies</button>
        <button class="sg-ck-reject" id="sg-ck-reject">Rechazar</button>
      </div>
    </div>`;

  function dismiss(val) {
    localStorage.setItem(KEY, val);
    overlay.classList.remove('sg-visible');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 460);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(overlay);
    // Block scroll while banner is up
    document.body.style.overflow = 'hidden';
    // Show after hero animations finish (~1.8s)
    setTimeout(() => overlay.classList.add('sg-visible'), 1800);
    document.getElementById('sg-ck-accept').addEventListener('click', () => dismiss('accepted'));
    document.getElementById('sg-ck-reject').addEventListener('click', () => dismiss('rejected'));
  });
})();

const SUPABASE_URL      = 'https://pemyfgptwyiabdksveuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbXlmZ3B0d3lpYWJka3N2ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTY5MjAsImV4cCI6MjA5NzE5MjkyMH0.nIVOT8LKcvJVRZ2rke8NXqnWuV7hHMuW8U3S_eFYzWo';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyg2NzszXg6lrFHA6EF9v0bqdgPZ5sj3_HvhCpjO-euQhYmyjtQ-hsQWjpS4nePIzLS/exec';
const WHATSAPP_NUMBER = '50660336062';

async function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');

  const nombre      = document.getElementById('nombre').value.trim();
  const empresa     = document.getElementById('empresa').value.trim();
  const email       = document.getElementById('email').value.trim();
  const tel         = document.getElementById('tel').value.trim();
  const servicio    = document.getElementById('servicio').value;
  const presupuesto = document.getElementById('presupuesto').value;
  const mensaje     = document.getElementById('mensaje').value.trim();

  if (!nombre || !empresa || !email || !tel || !servicio || !presupuesto || !mensaje) {
    alert('Por favor completá todos los campos obligatorios (*).');
    return;
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) { alert('Correo electrónico inválido.'); return; }

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  const payload = {
    nombre, empresa, email, telefono: tel, servicio, presupuesto, mensaje,
    origen: 'contacto',
    url_origen: location.href,
    user_agent: navigator.userAgent
  };

  let supabaseOk = false;
  let gasOk = false;

  // ── Supabase ──
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contactos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const detalle = await res.text();
      console.error('Supabase 400 detalle:', detalle);   // 👈 te dice qué columna falla
    }
    supabaseOk = res.ok;
  } catch (err) {
    console.error('Supabase error:', err);
  }

  // ── Google Sheets via Apps Script ──
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });
    gasOk = true;
  } catch (err) {
    console.error('Google Sheets error:', err);
  }

  if (supabaseOk || gasOk) {
    const waMsg = encodeURIComponent(`Hola, me llamo ${nombre}${empresa ? ' de ' + empresa : ''}. Quiero consultar sobre: ${servicio}. Presupuesto: ${presupuesto || 'No especificado'}. ${mensaje} Mi email: ${email}${tel ? ' Tel: ' + tel : ''}`);
    document.getElementById('formContent').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
    document.getElementById('formSuccess').querySelector('a').href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waMsg;
  } else {
    alert('Ocurrió un error al enviar. Por favor intentá de nuevo o contáctanos por WhatsApp.');
    btn.textContent = 'Enviar mensaje ↗';
    btn.disabled = false;
  }
}