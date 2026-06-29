-- ═══════════════════════════════════════════════════════════════
-- SLEY GROWTH — Schema de cotizaciones para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- 1) TABLA PRINCIPAL DE COTIZACIONES
create table if not exists public.cotizaciones (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Datos del cliente
  nombre        text not null,
  email         text not null,
  telefono      text,
  empresa       text,
  mensaje       text,

  -- Datos de la cotización
  servicio      text not null,          -- ej: "Desarrollo Web"
  servicio_slug text,                   -- ej: "desarrollo-web"
  precio_base   numeric(10,2) default 0,
  addons        jsonb default '[]'::jsonb,  -- [{nombre, precio, cantidad}]
  total         numeric(10,2) default 0,

  -- Metadata
  origen        text default 'web',     -- web / landing / etc
  estado        text default 'nuevo',   -- nuevo / contactado / cerrado
  user_agent    text,
  url_origen    text
);

-- 2) ÍNDICES para consultas rápidas
create index if not exists idx_cotizaciones_created  on public.cotizaciones (created_at desc);
create index if not exists idx_cotizaciones_email    on public.cotizaciones (email);
create index if not exists idx_cotizaciones_estado   on public.cotizaciones (estado);
create index if not exists idx_cotizaciones_servicio on public.cotizaciones (servicio_slug);

-- 3) ROW LEVEL SECURITY
-- Permite que cualquiera INSERTE (el formulario público) pero NADIE lea/edite/borre
-- desde el navegador. Solo tu service_role (backend/n8n/dashboard) puede leer.
alter table public.cotizaciones enable row level security;

-- Política: permitir INSERT anónimo (formulario web)
drop policy if exists "permitir_insert_publico" on public.cotizaciones;
create policy "permitir_insert_publico"
  on public.cotizaciones
  for insert
  to anon
  with check (true);

-- NOTA: No creamos política de SELECT para 'anon', así nadie puede
-- leer las cotizaciones de otros clientes desde el navegador.
-- Para leerlas, usá el service_role key en tu dashboard/n8n.

-- 4) (OPCIONAL) Tabla de contactos del formulario de contacto general
create table if not exists public.contactos (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nombre       text not null,
  email        text not null,
  telefono     text,
  empresa      text,
  mensaje      text,
  servicio     text,
  presupuesto  text,
  origen       text default 'contacto',
  estado       text default 'nuevo',
  user_agent   text,
  url_origen   text
);

alter table public.contactos enable row level security;
drop policy if exists "permitir_insert_contactos" on public.contactos;
create policy "permitir_insert_contactos"
  on public.contactos
  for insert
  to anon
  with check (true);

-- ═══════════════════════════════════════════════════════════════
-- LISTO. Después de ejecutar esto:
--   1. Andá a Project Settings → API
--   2. Copiá:  Project URL  y  anon public key
--   3. Pegalos en  /assets/config.js  del sitio
-- ═══════════════════════════════════════════════════════════════
