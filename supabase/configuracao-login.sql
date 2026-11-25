-- Gestão de Conteúdo: usuários, funções e permissões
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.usuario (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  usuario text not null unique,
  funcao text not null default 'comum' check (funcao in ('adm','marketing','comum')),
  criado_em timestamptz not null default now()
);
alter table public.usuario enable row level security;
drop policy if exists usuario_ler on public.usuario;
create policy usuario_ler on public.usuario for select to authenticated using (true);

create or replace function public.minha_funcao() returns text
language sql stable security definer set search_path = public as $$
  select funcao from public.usuario where id = auth.uid()
$$;

-- criação interna (sem checagem; não exposta)
create or replace function public._criar_usuario(p_nome text, p_usuario text, p_senha text, p_funcao text)
returns uuid language plpgsql security definer set search_path = public, auth, extensions as $$
declare uid uuid := gen_random_uuid(); u text := lower(trim(p_usuario)); em text;
begin
  if u !~ '^[a-z0-9._-]{3,50}$' then raise exception 'Usuário inválido (use letras minúsculas, números, ponto, hífen)'; end if;
  if length(coalesce(p_senha,'')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  if p_funcao not in ('adm','marketing','comum') then raise exception 'Função inválida'; end if;
  if exists (select 1 from public.usuario where usuario = u) then raise exception 'Esse usuário já existe'; end if;
  em := u || '@gestao.app';
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
  values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',em,
    extensions.crypt(p_senha, extensions.gen_salt('bf')),now(),
    '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),'','','','');
  insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  values (gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid::text,'email',em,'email_verified',true),'email',now(),now(),now());
  insert into public.usuario (id,nome,usuario,funcao) values (uid, trim(p_nome), u, p_funcao);
  return uid;
end $$;
revoke all on function public._criar_usuario(text,text,text,text) from public, anon, authenticated;

create or replace function public.admin_criar_usuario(p_nome text, p_usuario text, p_senha text, p_funcao text)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if public.minha_funcao() is distinct from 'adm' then raise exception 'Sem permissão'; end if;
  return public._criar_usuario(p_nome, p_usuario, p_senha, p_funcao);
end $$;

create or replace function public.admin_atualizar_usuario(p_id uuid, p_nome text, p_funcao text, p_senha text default null)
returns void language plpgsql security definer set search_path = public, auth, extensions as $$
begin
  if public.minha_funcao() is distinct from 'adm' then raise exception 'Sem permissão'; end if;
  if p_funcao not in ('adm','marketing','comum') then raise exception 'Função inválida'; end if;
  if p_id = auth.uid() and p_funcao <> 'adm' then raise exception 'Você não pode tirar sua própria função de adm'; end if;
  update public.usuario set nome = trim(p_nome), funcao = p_funcao where id = p_id;
  if p_senha is not null and p_senha <> '' then
    if length(p_senha) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
    update auth.users set encrypted_password = extensions.crypt(p_senha, extensions.gen_salt('bf')), updated_at = now() where id = p_id;
  end if;
end $$;

create or replace function public.admin_excluir_usuario(p_id uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if public.minha_funcao() is distinct from 'adm' then raise exception 'Sem permissão'; end if;
  if p_id = auth.uid() then raise exception 'Você não pode excluir a si mesmo'; end if;
  delete from auth.users where id = p_id;
end $$;

-- Observações (qualquer usuário logado pode adicionar em qualquer demanda)
create or replace function public.add_obs(p_item text, p_texto text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare f text := public.minha_funcao(); n text; nota jsonb;
begin
  if f is null then raise exception 'Faça login para comentar'; end if;
  if length(trim(coalesce(p_texto,''))) = 0 then raise exception 'Observação vazia'; end if;
  select nome into n from public.usuario where id = auth.uid();
  nota := jsonb_build_object('author', n, 'authorId', auth.uid()::text, 'text', trim(p_texto), 'ts', to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
  update public.items set data = jsonb_set(data, '{notes}', coalesce(data->'notes','[]'::jsonb) || jsonb_build_array(nota)), updated_at = now()
   where id::text = p_item and kind = 'demand';
  if not found then raise exception 'Demanda não encontrada'; end if;
  return nota;
end $$;

create or replace function public.del_obs(p_item text, p_ts text)
returns void language plpgsql security definer set search_path = public as $$
declare f text := public.minha_funcao();
begin
  if f is null then raise exception 'Sem permissão'; end if;
  update public.items set data = jsonb_set(data, '{notes}', coalesce((
      select jsonb_agg(e) from jsonb_array_elements(coalesce(data->'notes','[]'::jsonb)) e
      where not (e->>'ts' = p_ts and (f in ('adm','marketing') or e->>'authorId' = auth.uid()::text))
    ), '[]'::jsonb)), updated_at = now()
  where id::text = p_item and kind = 'demand';
end $$;

grant execute on function public.minha_funcao(), public.admin_criar_usuario(text,text,text,text),
  public.admin_atualizar_usuario(uuid,text,text,text), public.admin_excluir_usuario(uuid),
  public.add_obs(text,text), public.del_obs(text,text) to authenticated;
revoke execute on function public.admin_criar_usuario(text,text,text,text), public.admin_atualizar_usuario(uuid,text,text,text),
  public.admin_excluir_usuario(uuid), public.add_obs(text,text), public.del_obs(text,text) from anon, public;

-- Permissões na tabela items
alter table public.items enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='items' loop
    execute format('drop policy %I on public.items', p.policyname);
  end loop;
end $$;
create policy items_ler on public.items for select to anon, authenticated using (true);
create policy items_criar on public.items for insert to authenticated with check (
  public.minha_funcao() in ('adm','marketing')
  or (public.minha_funcao() = 'comum' and kind = 'demand' and data->>'autorId' = auth.uid()::text));
create policy items_editar on public.items for update to authenticated
  using (public.minha_funcao() in ('adm','marketing') or (public.minha_funcao() = 'comum' and kind = 'demand' and data->>'autorId' = auth.uid()::text))
  with check (public.minha_funcao() in ('adm','marketing') or (public.minha_funcao() = 'comum' and kind = 'demand' and data->>'autorId' = auth.uid()::text));
create policy items_excluir on public.items for delete to authenticated
  using (public.minha_funcao() in ('adm','marketing') or (public.minha_funcao() = 'comum' and kind = 'demand' and data->>'autorId' = auth.uid()::text));

-- Fotos/vídeos (bucket midia): só usuários logados enviam
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='storage' and tablename='objects'
           and (coalesce(qual,'') ilike '%midia%' or coalesce(with_check,'') ilike '%midia%') loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;
create policy midia_ler on storage.objects for select to anon, authenticated using (bucket_id = 'midia');
create policy midia_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'midia' and public.minha_funcao() in ('adm','marketing','comum'));
create policy midia_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'midia' and (public.minha_funcao() in ('adm','marketing') or owner = auth.uid()));

-- Usuário administrador inicial
select public._criar_usuario('Matheus Machado', 'matheus.machado', '<senha>', 'adm')
where not exists (select 1 from public.usuario where usuario = 'matheus.machado');

select usuario, funcao from public.usuario;
