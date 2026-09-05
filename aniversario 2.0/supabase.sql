-- =========================================================
-- SUPABASE: MENSAGENS PRIVADAS DO ANIVERSÁRIO
-- =========================================================
--
-- IMPORTANTE:
-- 1) Crie seu usuário administrador em:
--    Supabase Dashboard > Authentication > Users
--
-- 2) Troque SEU_EMAIL_ADMIN abaixo pelo MESMO e-mail
--    usado para entrar no admin.html.
--
-- 3) Execute este arquivo no SQL Editor do Supabase.
--
-- A ideia de segurança é:
--   ANON (visitante)  -> somente INSERT
--   ADMIN autenticado -> SELECT + DELETE
--   outros usuários   -> sem SELECT/DELETE
--
-- As políticas RLS são a proteção real do banco.
-- =========================================================


create table if not exists public.birthday_messages (
    id uuid primary key default gen_random_uuid(),

    name text not null
        check (char_length(trim(name)) between 1 and 80),

    message text not null
        check (char_length(trim(message)) between 1 and 300),

    created_at timestamptz not null default now()
);


alter table public.birthday_messages
enable row level security;


-- Menor privilégio: retiramos os acessos padrão e damos
-- somente o necessário para cada tipo de usuário.

revoke all on table public.birthday_messages
from anon, authenticated;


grant insert on table public.birthday_messages
to anon;


grant select, delete on table public.birthday_messages
to authenticated;


-- =========================================================
-- VISITANTES: PODEM APENAS ENVIAR
-- =========================================================

drop policy if exists "public_can_insert_birthday_messages"
on public.birthday_messages;


create policy "public_can_insert_birthday_messages"
on public.birthday_messages
for insert
to anon
with check (
    char_length(trim(name)) between 1 and 80
    and char_length(trim(message)) between 1 and 300
);


-- =========================================================
-- ADMIN: PODE VER
-- =========================================================

drop policy if exists "admin_can_read_birthday_messages"
on public.birthday_messages;


create policy "admin_can_read_birthday_messages"
on public.birthday_messages
for select
to authenticated
using (
    (select auth.jwt() ->> 'email')
    = 'davidwpsantos2007@gmail.com'
);


-- =========================================================
-- ADMIN: PODE EXCLUIR
-- =========================================================

drop policy if exists "admin_can_delete_birthday_messages"
on public.birthday_messages;


create policy "admin_can_delete_birthday_messages"
on public.birthday_messages
for delete
to authenticated
using (
    (select auth.jwt() ->> 'email')
    = 'davidwpsantos2007@gmail.com'
);


-- =========================================================
-- OPCIONAL: ÍNDICE PARA ORDENAR POR DATA
-- =========================================================

create index if not exists birthday_messages_created_at_idx
on public.birthday_messages (created_at desc);
