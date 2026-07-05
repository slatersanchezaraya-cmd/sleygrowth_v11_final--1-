/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Backend formulario de contacto
   Envía a Supabase (tabla contactos) y Google Sheets (Apps Script)
   El aviso de cookies vive en cookies.js (se carga en todas las páginas)
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://pemyfgptwyiabdksveuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbXlmZ3B0d3lpYWJka3N2ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTY5MjAsImV4cCI6MjA5NzE5MjkyMH0.nIVOT8LKcvJVRZ2rke8NXqnWuV7hHMuW8U3S_eFYzWo';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyg2NzszXg6lrFHA6EF9v0bqdgPZ5sj3_HvhCpjO-euQhYmyjtQ-hsQWjpS4nePIzLS/exec';
const WHATSAPP_NUMBER = '50660336062';

// ── Dashboard interno de Sley Growth (dashboard-dley.vercel.app) ──
// Crea el prospecto automaticamente en la pestana Prospectos.
// La anon key es publica por diseno; el dashboard valida por RPC.
const DASHBOARD_SUPABASE_URL = 'https://clwxxvjchrjjxudtdnei.supabase.co';
const DASHBOARD_ANON_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd3h4dmpjaHJqanh1ZHRkbmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzM0NDEsImV4cCI6MjA5ODc0OTQ0MX0.fae9cQ3VnhcRirWI1kVNududv-wVrPnVO3FTi2d9Gmc';

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

  // ── Dashboard: crea el prospecto en la pestana Prospectos ──
  let dashOk = false;
  try {
    const res = await fetch(`${DASHBOARD_SUPABASE_URL}/rest/v1/rpc/prospect_intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': DASHBOARD_ANON_KEY,
        'Authorization': `Bearer ${DASHBOARD_ANON_KEY}`
      },
      body: JSON.stringify({
        p_name: nombre,
        p_company: empresa,
        p_email: email,
        p_phone: tel,
        p_service: servicio,
        p_message: mensaje,
        p_budget: presupuesto,
        p_origin: 'formulario web (' + location.href + ')'
      })
    });
    dashOk = res.ok;
    if (!res.ok) console.error('Dashboard detalle:', await res.text());
  } catch (err) {
    console.error('Dashboard error:', err);
  }

  if (supabaseOk || gasOk || dashOk) {
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