/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Configuración
   Editá SOLO este archivo para conectar el sitio a tus servicios.
   ═══════════════════════════════════════════════════════════════ */

window.SLEY_CONFIG = {

  // ── SUPABASE ──────────────────────────────────────────────
  // Sacá estos valores de: Supabase → Project Settings → API
  SUPABASE_URL:      "https://pemyfgptwyiabdksveuq.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbXlmZ3B0d3lpYWJka3N2ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTY5MjAsImV4cCI6MjA5NzE5MjkyMH0.nIVOT8LKcvJVRZ2rke8NXqnWuV7hHMuW8U3S_eFYzWo",

  // ── n8n WEBHOOK (opcional, no se usa por defecto) ──────────
  N8N_WEBHOOK_URL: "",

  // ── GOOGLE SHEETS via Apps Script ──────────────────────────
  // URL del webhook que devuelve deploy de Apps Script (ver
  // _backend/apps_script_contacto.gs). Dejalo vacío ("") para desactivar.
  GAS_URL: "https://script.google.com/macros/s/AKfycbzv4dGpxMIx7sCCBCtvtop8zw78qOErIFVDi14Ha0LpfqXguZVK67TUKPE8Rnt4p0XE/exec",

  // ── WHATSAPP ──────────────────────────────────────────────
  WHATSAPP_NUMBER: "50660336062",   // sin + ni espacios

  // ── EMAIL / CONTACTO ──────────────────────────────────────
  EMAIL: "sleygrowth@gmail.com",
};