# Sley Growth — Guía de configuración

Tu sitio ya está listo. Solo tenés que conectar **dónde se guardan las cotizaciones**.
Sigue estos pasos en orden. No necesitás tocar código, solo pegar valores.

---

## 📁 Estructura del sitio

```
sleygrowth_final/
├── index.html              ← Inicio
├── proyectos.html          ← Portafolio
├── contacto.html           ← Formulario de contacto (conectado)
├── privacidad.html         ← Política de privacidad (NUEVA)
├── terminos.html           ← Términos de servicio (NUEVA)
├── servicios/              ← 18 páginas de servicio
│   ├── desarrollo-web.html     ← con CONFIGURADOR interactivo
│   ├── ecommerce.html          ← con CONFIGURADOR
│   ├── landing-page.html       ← con CONFIGURADOR
│   ├── rediseno-web.html       ← con CONFIGURADOR
│   ├── aplicacion-escritorio.html ← con CONFIGURADOR
│   ├── chatbots.html           ← con CONFIGURADOR
│   └── ... (los otros 12)
├── assets/
│   ├── config.js           ← ⚠️ ACÁ PEGÁS TUS LLAVES
│   ├── cotizador.js        ← motor (no tocar)
│   └── cotizador.css       ← estilos (no tocar)
└── _backend/
    ├── supabase_schema.sql           ← SQL para Supabase
    └── n8n_workflow_cotizaciones.json ← workflow para n8n
```

> El folder `_backend/` NO se sube al hosting. Es solo para vos.

---

## ✅ PASO 1 — Crear las tablas en Supabase

1. Entrá a tu proyecto de Supabase → **SQL Editor** → **New Query**.
2. Abrí el archivo `_backend/supabase_schema.sql`, copiá TODO y pegalo.
3. Click en **Run**. Listo: se crean las tablas `cotizaciones` y `contactos`
   con seguridad activada (cualquiera puede enviar, nadie puede leer datos ajenos).

---

## ✅ PASO 2 — Conectar el sitio a Supabase

1. En Supabase → **Project Settings → API**.
2. Copiá estos dos valores:
   - **Project URL** (ej: `https://abcd.supabase.co`)
   - **anon public** key (la llave pública, larga)
3. Abrí `assets/config.js` y pegalos:

```js
SUPABASE_URL:      "https://abcd.supabase.co",
SUPABASE_ANON_KEY: "eyJhbGci....(tu llave)",
```

Con esto ya **se guardan las cotizaciones en Supabase**, sin servidor.

---

## ✅ PASO 3 (opcional pero recomendado) — Google Sheets + WhatsApp con n8n

Esto hace que además de Supabase, cada cotización:
- se copie a una hoja de Google Sheets, y
- te llegue un aviso.

1. En n8n → **Import from File** → subí `_backend/n8n_workflow_cotizaciones.json`.
2. Abrí el nodo **Guardar en Google Sheets** y poné el ID de tu hoja
   (creá una hoja con una pestaña llamada `Cotizaciones` y encabezados:
   `Fecha, Nombre, Email, Telefono, Empresa, Servicio, Precio Base, Add-ons, Total, Mensaje, Origen`).
3. Conectá tu credencial de Google Sheets (la que ya usás).
4. Activá el workflow y copiá la **URL del webhook de producción**
   (algo como `https://tu-vps.com/webhook/cotizacion-sley`).
5. Pegala en `assets/config.js`:

```js
N8N_WEBHOOK_URL: "https://tu-vps.com/webhook/cotizacion-sley",
```

> Si dejás `N8N_WEBHOOK_URL: ""` vacío, el sitio igual funciona y guarda en Supabase.

---

## ✅ PASO 4 — Subir a Hostinger

1. Subí TODO el contenido de `sleygrowth_final/` **excepto** la carpeta `_backend/`.
2. Asegurate de subir la carpeta `assets/` completa.
3. Listo.

---

## 🧪 Cómo probar que funciona

1. Abrí `servicios/desarrollo-web.html`.
2. Marcá algunos complementos → el precio sube en vivo.
3. Click en **Realizar cotización** → llenás tus datos → **Enviar**.
4. Revisá:
   - En Supabase → Table Editor → `cotizaciones` debe aparecer la fila.
   - En Google Sheets (si configuraste n8n) → nueva fila.
   - Se abre WhatsApp con el resumen.

---

## 📞 Datos del sitio

- **WhatsApp / Teléfono:** +506 6033-6062
- **Email:** sleygrowth@gmail.com
- **Configurador interactivo en:** Desarrollo Web, E-commerce, Landing Page,
  Rediseño Web, App de Escritorio y ChatBots IA.

Cualquier ajuste de precios o add-ons se edita en cada archivo de servicio
(o me decís y lo cambio).
