/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Marca y contacto (fuente unica)
   Edita SOLO este archivo para cambiar datos de marca en el sitio.
   El copy de marketing (hero, servicios, FAQ) vive en el HTML por SEO.
   ═══════════════════════════════════════════════════════════════ */

window.SLEY_BRAND = {
  name: "Sley Growth AI",

  // El Gmail no se borra, se apaga: mientras showEmail sea false no se
  // renderiza ningun correo y el contacto va por WhatsApp + formulario.
  // Cuando el dominio propio este activo: email nuevo + showEmail: true.
  email: "hola@sleygrowthai.com",
  showEmail: false,

  whatsapp: "+506 6033-6062",
  whatsappNumber: "50660336062",
  whatsappUrl:
    "https://wa.me/50660336062?text=Hola%2C%20vengo%20del%20sitio%20y%20quiero%20agendar%20la%20auditor%C3%ADa",

  instagram: "https://www.instagram.com/sleygrowth",

  // Referencia de inversion (misma fuente que el FAQ). En USD.
  pricing: { landing: 450, corporativo: 900, ia: 950 },
};

/* Render del email SOLO si showEmail es true. Rellena cualquier elemento
   con [data-brand-email]; el texto va en [data-brand-email-text] si existe. */
(function () {
  var B = window.SLEY_BRAND;
  function apply() {
    var slots = document.querySelectorAll("[data-brand-email]");
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      if (B.showEmail && B.email) {
        el.hidden = false;
        if (el.tagName === "A") el.setAttribute("href", "mailto:" + B.email);
        var txt = el.querySelector("[data-brand-email-text]");
        if (txt) txt.textContent = B.email;
        else el.textContent = B.email;
      } else {
        el.hidden = true;
      }
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
})();
