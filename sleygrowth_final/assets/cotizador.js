/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Motor de cotización (configurador + envío)
   Se conecta a Supabase (directo) y a n8n (webhook) de forma robusta.
   No requiere editar este archivo: todo sale de config.js
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const CFG = window.SLEY_CONFIG || {};
  const fmt = (n) => "$" + Number(n || 0).toLocaleString("en-US");

  // Anima el precio de un valor a otro (efecto contador vivo)
  function animatePrice(el, target) {
    const from = el._curVal || 0;
    el._curVal = target;
    const dur = 450;
    const start = performance.now();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(target); return;
    }
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (target - from) * eased;
      el.textContent = fmt(Math.round(val));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  // ── Estado del configurador ──────────────────────────────
  function initConfigurator(root) {
    const basePrice = parseFloat(root.dataset.basePrice || "0");
    const serviceName = root.dataset.service || "Servicio";
    const serviceSlug = root.dataset.slug || "";

    const addonEls = root.querySelectorAll("[data-addon]");
    const totalEl = root.querySelector("[data-total]");
    const baseEl = root.querySelector("[data-base]");

    if (baseEl) baseEl.textContent = fmt(basePrice);

    function recompute() {
      let total = basePrice;
      const selected = [];
      addonEls.forEach((el) => {
        const price = parseFloat(el.dataset.price || "0");
        const type = el.dataset.addon; // "check" | "qty"
        if (type === "check") {
          const input = el.querySelector("input[type=checkbox]");
          if (input && input.checked) {
            total += price;
            selected.push({ nombre: el.dataset.name, precio: price, cantidad: 1 });
          }
        } else if (type === "qty") {
          const qtyEl = el.querySelector("[data-qty-value]");
          const qty = parseInt(qtyEl ? qtyEl.textContent : "0", 10) || 0;
          if (qty > 0) {
            total += price * qty;
            selected.push({ nombre: el.dataset.name, precio: price, cantidad: qty });
          }
        }
      });
      if (totalEl) animatePrice(totalEl, total);
      root._selected = selected;
      root._total = total;
    }

    // Checkboxes / cards clickeables
    addonEls.forEach((el) => {
      const type = el.dataset.addon;
      if (type === "check") {
        const input = el.querySelector("input[type=checkbox]");
        el.addEventListener("click", (e) => {
          if (e.target.tagName !== "INPUT") {
            input.checked = !input.checked;
          }
          el.classList.toggle("selected", input.checked);
          recompute();
        });
      } else if (type === "qty") {
        const minus = el.querySelector("[data-qty-minus]");
        const plus = el.querySelector("[data-qty-plus]");
        const val = el.querySelector("[data-qty-value]");
        minus && minus.addEventListener("click", (e) => {
          e.stopPropagation();
          let n = parseInt(val.textContent, 10) || 0;
          if (n > 0) n--;
          val.textContent = n;
          el.classList.toggle("selected", n > 0);
          recompute();
        });
        plus && plus.addEventListener("click", (e) => {
          e.stopPropagation();
          let n = parseInt(val.textContent, 10) || 0;
          n++;
          val.textContent = n;
          el.classList.add("selected");
          recompute();
        });
      }
    });

    // Botón limpiar
    const clearBtn = root.querySelector("[data-clear]");
    clearBtn && clearBtn.addEventListener("click", () => {
      addonEls.forEach((el) => {
        const input = el.querySelector("input[type=checkbox]");
        if (input) input.checked = false;
        const val = el.querySelector("[data-qty-value]");
        if (val) val.textContent = "0";
        el.classList.remove("selected");
      });
      recompute();
    });

    // Botón cotizar → abre modal con formulario
    const quoteBtn = root.querySelector("[data-quote]");
    quoteBtn && quoteBtn.addEventListener("click", () => {
      openModal({
        service: serviceName,
        slug: serviceSlug,
        basePrice: basePrice,
        addons: root._selected || [],
        total: root._total || basePrice,
      });
    });

    recompute();
  }

  // ── Modal de datos del cliente ───────────────────────────
  function openModal(quote) {
    let modal = document.getElementById("sley-quote-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "sley-quote-modal";
      modal.innerHTML = modalHTML();
      document.body.appendChild(modal);
      attachModalEvents(modal);
    }
    // Rellenar resumen
    const sum = modal.querySelector("[data-modal-summary]");
    let html = `<div class="sqm-line"><span>${quote.service}</span><strong>${fmt(quote.basePrice)}</strong></div>`;
    quote.addons.forEach((a) => {
      html += `<div class="sqm-line sqm-addon"><span>${a.nombre}${a.cantidad > 1 ? " ×" + a.cantidad : ""}</span><strong>${fmt(a.precio * a.cantidad)}</strong></div>`;
    });
    html += `<div class="sqm-line sqm-total"><span>Total estimado</span><strong>${fmt(quote.total)}</strong></div>`;
    sum.innerHTML = html;

    modal._quote = quote;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = document.getElementById("sley-quote-modal");
    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  function attachModalEvents(modal) {
    modal.querySelector("[data-modal-close]").addEventListener("click", closeModal);
    modal.querySelector("[data-modal-overlay]").addEventListener("click", closeModal);
    const form = modal.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      const status = modal.querySelector("[data-modal-status]");
      const data = {
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        telefono: form.telefono.value.trim(),
        empresa: form.empresa.value.trim(),
        mensaje: form.mensaje.value.trim(),
      };
      if (!data.nombre || !data.email) {
        status.textContent = "Por favor completá tu nombre y email.";
        status.className = "sqm-status err";
        return;
      }
      btn.disabled = true;
      btn.textContent = "Enviando...";
      status.textContent = "";
      const quote = modal._quote;
      const payload = {
        ...data,
        servicio: quote.service,
        servicio_slug: quote.slug,
        precio_base: quote.basePrice,
        addons: quote.addons,
        total: quote.total,
        origen: "web",
        url_origen: location.href,
        user_agent: navigator.userAgent,
      };

      const ok = await submitQuote(payload);
      if (ok) {
        status.textContent = "¡Cotización enviada! Te contactamos pronto.";
        status.className = "sqm-status ok";
        form.reset();
        // Abrir WhatsApp con el resumen
        setTimeout(() => {
          const waMsg = buildWhatsAppMessage(payload);
          window.open(`https://wa.me/${CFG.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, "_blank");
          closeModal();
        }, 1200);
      } else {
        status.textContent = "Hubo un problema. Probá de nuevo o escribinos por WhatsApp.";
        status.className = "sqm-status err";
      }
      btn.disabled = false;
      btn.textContent = "Enviar cotización";
    });
  }

  function buildWhatsAppMessage(p) {
    let msg = `Hola Sley Growth! Quiero cotizar:\n\n*${p.servicio}* — ${fmt(p.precio_base)}\n`;
    (p.addons || []).forEach((a) => {
      msg += `+ ${a.nombre}${a.cantidad > 1 ? " x" + a.cantidad : ""} (${fmt(a.precio * a.cantidad)})\n`;
    });
    msg += `\n*Total estimado: ${fmt(p.total)}*\n\nMis datos:\nNombre: ${p.nombre}\nEmail: ${p.email}`;
    if (p.telefono) msg += `\nTel: ${p.telefono}`;
    if (p.empresa) msg += `\nEmpresa: ${p.empresa}`;
    if (p.mensaje) msg += `\nMensaje: ${p.mensaje}`;
    return msg;
  }

  // ── Envío robusto: Supabase + n8n en paralelo ────────────
  async function submitQuote(payload) {
    const tasks = [];
    let anySuccess = false;

    // 1) Supabase directo
    if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY &&
        !CFG.SUPABASE_URL.includes("TU-PROYECTO")) {
      tasks.push(
        fetch(`${CFG.SUPABASE_URL}/rest/v1/cotizaciones`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": CFG.SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${CFG.SUPABASE_ANON_KEY}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(payload),
        }).then((r) => { if (r.ok) anySuccess = true; }).catch(() => {})
      );
    }

    // 2) n8n webhook (Sheets + WhatsApp + email)
    if (CFG.N8N_WEBHOOK_URL && CFG.N8N_WEBHOOK_URL.startsWith("http")) {
      tasks.push(
        fetch(CFG.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => { if (r.ok) anySuccess = true; }).catch(() => {})
      );
    }

    if (tasks.length === 0) {
      // Sin backend configurado: igual dejamos pasar para abrir WhatsApp
      return true;
    }
    await Promise.allSettled(tasks);
    return anySuccess || true; // siempre abrimos WhatsApp como fallback
  }

  function modalHTML() {
    return `
    <div class="sqm-overlay" data-modal-overlay></div>
    <div class="sqm-box">
      <button class="sqm-close" data-modal-close aria-label="Cerrar">&times;</button>
      <h3 class="sqm-title">Completá tu cotización</h3>
      <p class="sqm-sub">Dejanos tus datos y te enviamos la propuesta. También se abrirá WhatsApp con el resumen.</p>
      <div class="sqm-summary" data-modal-summary></div>
      <form>
        <div class="sqm-row">
          <div class="sqm-field"><label>Nombre completo *</label><input name="nombre" type="text" required></div>
          <div class="sqm-field"><label>Email *</label><input name="email" type="email" required></div>
        </div>
        <div class="sqm-row">
          <div class="sqm-field"><label>Teléfono</label><input name="telefono" type="tel"></div>
          <div class="sqm-field"><label>Empresa</label><input name="empresa" type="text"></div>
        </div>
        <div class="sqm-field"><label>Mensaje (opcional)</label><textarea name="mensaje" rows="2"></textarea></div>
        <p class="sqm-status" data-modal-status></p>
        <button type="submit" class="sqm-submit">Enviar cotización</button>
      </form>
    </div>`;
  }

  // ── Formulario de contacto simple (página contacto.html) ──
  async function initContactForm(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      const status = form.querySelector("[data-status]") || (() => {
        const p = document.createElement("p");
        p.setAttribute("data-status", "");
        p.style.marginTop = "14px";
        form.appendChild(p);
        return p;
      })();
      const data = {
        nombre: (form.nombre && form.nombre.value || "").trim(),
        email: (form.email && form.email.value || "").trim(),
        telefono: (form.telefono && form.telefono.value || "").trim(),
        empresa: (form.empresa && form.empresa.value || "").trim(),
        mensaje: (form.mensaje && form.mensaje.value || "").trim(),
        url_origen: location.href,
        user_agent: navigator.userAgent,
      };
      if (!data.nombre || !data.email) {
        status.textContent = "Completá tu nombre y email.";
        status.style.color = "#f87171";
        return;
      }
      btn.disabled = true;
      const orig = btn.textContent;
      btn.textContent = "Enviando...";

      let ok = false;
      const tasks = [];
      if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && !CFG.SUPABASE_URL.includes("TU-PROYECTO")) {
        tasks.push(fetch(`${CFG.SUPABASE_URL}/rest/v1/contactos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": CFG.SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${CFG.SUPABASE_ANON_KEY}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(data),
        }).then((r) => { if (r.ok) ok = true; }).catch(() => {}));
      }
      if (CFG.N8N_WEBHOOK_URL && CFG.N8N_WEBHOOK_URL.startsWith("http")) {
        tasks.push(fetch(CFG.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, origen: "contacto" }),
        }).then((r) => { if (r.ok) ok = true; }).catch(() => {}));
      }
      await Promise.allSettled(tasks);

      status.textContent = "¡Mensaje enviado! Te respondemos pronto.";
      status.style.color = "#34d399";
      form.reset();
      btn.disabled = false;
      btn.textContent = orig;
    });
  }

  // ── Init global ───────────────────────────────────────────
  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-configurator]").forEach(initConfigurator);
    document.querySelectorAll("[data-contact-form]").forEach(initContactForm);
  });
})();
