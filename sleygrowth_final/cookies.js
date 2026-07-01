/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Aviso de cookies (barra inferior)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const KEY = 'sg_cookie_consent';
  if (localStorage.getItem(KEY)) return;

  const css = `
#sg-cookie-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:920px;margin:0 auto;background:rgba(11,14,34,.97);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);padding:20px 24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;font-family:'Inter',sans-serif;transform:translateY(120%);opacity:0;transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .5s ease}
#sg-cookie-bar.sg-visible{transform:translateY(0);opacity:1}
#sg-cookie-bar::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(180deg,#00D4FF,#8B5CF6);border-radius:16px 0 0 16px}
#sg-cookie-bar p{flex:1;min-width:220px;font-size:13px;color:rgba(255,255,255,.65);line-height:1.6;margin:0}
#sg-cookie-bar p a{color:#00D4FF;text-decoration:none}
#sg-cookie-bar p a:hover{text-decoration:underline}
#sg-cookie-btns{display:flex;gap:10px;flex-shrink:0}
.sg-ck-accept{padding:11px 22px;background:linear-gradient(135deg,#00D4FF,#8B5CF6);color:#fff;border:none;border-radius:100px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;transition:opacity .2s,transform .2s}
.sg-ck-accept:hover{opacity:.88;transform:translateY(-1px)}
.sg-ck-reject{padding:11px 18px;background:transparent;color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.14);border-radius:100px;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;white-space:nowrap;transition:color .2s,border-color .2s}
.sg-ck-reject:hover{color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.3)}
@media(max-width:640px){#sg-cookie-bar{flex-direction:column;align-items:stretch;text-align:center;padding:18px 20px}#sg-cookie-btns{justify-content:center}}
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const privacyPath = (function () {
    const depth = location.pathname.split('/').filter(Boolean).length;
    return depth >= 2 ? '../privacidad.html' : 'privacidad.html';
  })();

  const bar = document.createElement('div');
  bar.id = 'sg-cookie-bar';
  bar.innerHTML = `
    <p>Usamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso del sitio. <a href="${privacyPath}">Política de privacidad</a>.</p>
    <div id="sg-cookie-btns">
      <button class="sg-ck-reject" id="sg-ck-reject">Rechazar</button>
      <button class="sg-ck-accept" id="sg-ck-accept">Aceptar cookies</button>
    </div>`;

  function dismiss(val) {
    localStorage.setItem(KEY, val);
    bar.classList.remove('sg-visible');
    setTimeout(() => bar.remove(), 500);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(bar);
    // Mostrar de inmediato, apenas carga la página (antes de poder hacer scroll)
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('sg-visible')));
    document.getElementById('sg-ck-accept').addEventListener('click', () => dismiss('accepted'));
    document.getElementById('sg-ck-reject').addEventListener('click', () => dismiss('rejected'));
  });
})();
