create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_new_user_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  insert into public.user_roles(user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users for each row execute function public.handle_new_user_role();

create table public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, image_url text,
  is_active boolean not null default true, is_featured boolean not null default false, sort_order int not null default 0,
  created_at timestamptz not null default now());
grant select on public.categories to anon, authenticated; grant insert, update, delete on public.categories to authenticated; grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read active cats" on public.categories for select using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin write cats" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, sku text,
  category_id uuid references public.categories(id) on delete set null, brand text, description text,
  images text[] not null default '{}', price numeric(10,2) not null default 0, mrp numeric(10,2) not null default 0,
  stock int not null default 0, low_stock_threshold int not null default 5,
  variants jsonb not null default '[]', specifications jsonb not null default '{}', tags text[] not null default '{}',
  is_featured boolean not null default false, is_trending boolean not null default false, is_new boolean not null default false, is_bestseller boolean not null default false,
  is_active boolean not null default true, rating numeric(2,1) not null default 4.5, review_count int not null default 0,
  created_at timestamptz not null default now());
grant select on public.products to anon, authenticated; grant insert, update, delete on public.products to authenticated; grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active products" on public.products for select using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin write products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique default ('AG' || to_char(now(),'YYMMDD') || lpad((floor(random()*100000))::text,5,'0')),
  user_id uuid not null, items jsonb not null, subtotal numeric(10,2) not null, shipping numeric(10,2) not null default 0, total numeric(10,2) not null,
  payment_method text not null default 'cod', payment_status text not null default 'pending', status text not null default 'placed',
  shipping_name text not null, shipping_phone text not null, shipping_address text not null, shipping_city text not null, shipping_pincode text not null, shipping_state text not null,
  created_at timestamptz not null default now());
grant select, insert, update on public.orders to authenticated; grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own orders insert" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "admin update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null, message text not null, created_at timestamptz not null default now());
grant insert on public.contact_messages to anon, authenticated; grant select on public.contact_messages to authenticated; grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone send" on public.contact_messages for insert with check (length(name) between 1 and 100 and length(email) between 3 and 255 and length(message) between 1 and 2000);
create policy "admin read msgs" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "public read product images" on storage.objects for select using (bucket_id = 'store');
create policy "admin upload images" on storage.objects for insert to authenticated with check (bucket_id = 'store' and public.has_role(auth.uid(),'admin'));
create policy "admin delete images" on storage.objects for delete to authenticated using (bucket_id = 'store' and public.has_role(auth.uid(),'admin'));

insert into public.categories (name, slug, image_url, is_featured, sort_order) values
('Solar Energy','solar-energy','/images/cat-solar.jpg',true,1),
('Smartphones','smartphones','/images/cat-phones.jpg',true,2),
('Farm Tools','farm-tools','/images/cat-farm.jpg',true,3),
('Water & Irrigation','water-irrigation','/images/cat-water.jpg',true,4);

insert into public.products (name, slug, sku, category_id, brand, description, images, price, mrp, stock, variants, specifications, tags, is_featured, is_trending, is_new, is_bestseller, rating, review_count) values
('SunVolt 40W Solar Home Kit','sunvolt-40w-solar-kit','SV-40',(select id from public.categories where slug='solar-energy'),'SunVolt','Power 4 LED bulbs, a fan and phone charging from the sun. Built for homes with unreliable grid power.','{/images/p-solar-kit.jpg}',4999,6999,40,'[{"name":"40W","price":4999,"stock":40},{"name":"80W","price":8499,"stock":15}]','{"Panel":"40W mono","Battery":"12Ah lithium","Warranty":"2 years"}','{solar,home}',true,true,false,true,4.6,212),
('Solar Lantern Pro','solar-lantern-pro','SL-PRO',(select id from public.categories where slug='solar-energy'),'SunVolt','Bright, rugged lantern with USB charging. 12 hours of light on a full charge.','{/images/p-lantern.jpg}',899,1299,120,'[]','{"Light":"300 lumens","Runtime":"12 hours"}','{solar,lantern}',false,true,true,false,4.4,98),
('Kisan 5G Rugged Phone','kisan-5g-rugged','KS-5G',(select id from public.categories where slug='smartphones'),'Kisan','Dust and water resistant phone with a 6000mAh battery and loud speaker. Local language support.','{/images/p-phone.jpg}',9999,12999,60,'[{"name":"4GB/64GB","price":9999,"stock":40},{"name":"6GB/128GB","price":11999,"stock":20}]','{"Battery":"6000mAh","Display":"6.5 inch","Rating":"IP68"}','{phone,rugged}',true,false,true,true,4.3,154),
('Battery Knapsack Sprayer 16L','battery-sprayer-16l','BS-16',(select id from public.categories where slug='farm-tools'),'KhetPro','Rechargeable sprayer for crops. No manual pumping, sprays up to 8 hours.','{/images/p-sprayer.jpg}',3299,4500,35,'[]','{"Tank":"16 litres","Battery":"12V 8Ah"}','{farm,sprayer}',true,true,false,true,4.5,301),
('Drip Irrigation Kit (1 acre)','drip-kit-1-acre','DK-1A',(select id from public.categories where slug='water-irrigation'),'JalDhara','Save up to 60% water. Complete kit with pipes, drippers and filter.','{/images/p-drip.jpg}',7499,9999,18,'[]','{"Coverage":"1 acre","Pipe":"16mm LLDPE"}','{water,drip}',false,false,true,false,4.7,64),
('Solar Water Pump 1HP','solar-water-pump-1hp','SP-1HP',(select id from public.categories where slug='water-irrigation'),'SunVolt','Run your borewell pump on solar power. Zero electricity bills.','{/images/p-pump.jpg}',38999,45999,4,'[]','{"Power":"1 HP","Head":"up to 50m"}','{solar,pump}',true,true,false,false,4.6,41);