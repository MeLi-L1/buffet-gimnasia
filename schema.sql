-- Ejecutar una sola vez en Supabase > SQL Editor.
-- IMPORTANTE: estas políticas permiten que cualquiera que tenga la URL y la clave
-- pública de este proyecto pueda leer, agregar, modificar y borrar los registros.
-- Usar solo para información no sensible. Para datos privados, agregar autenticación.

create table if not exists public.buffet_items (
  id uuid primary key,
  kind text not null check (kind in ('tasks','posts','shopping','movements')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.buffet_items enable row level security;

drop policy if exists "Acceso compartido de buffet" on public.buffet_items;
create policy "Acceso compartido de buffet"
on public.buffet_items
for all
to anon, authenticated
using (true)
with check (true);

alter publication supabase_realtime add table public.buffet_items;
