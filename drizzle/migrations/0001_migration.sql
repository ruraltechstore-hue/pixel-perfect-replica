create or replace function public.price_order() returns trigger language plpgsql security definer set search_path = public as $$
declare it jsonb; p record; unit numeric; v jsonb; sub numeric := 0; q int;
begin
  if jsonb_typeof(new.items) <> 'array' or jsonb_array_length(new.items) = 0 or jsonb_array_length(new.items) > 50 then
    raise exception 'Invalid items';
  end if;
  for it in select * from jsonb_array_elements(new.items) loop
    select * into p from public.products where id = (it->>'productId')::uuid and is_active;
    if not found then raise exception 'Product unavailable'; end if;
    q := greatest(1, least(20, coalesce((it->>'qty')::int, 1)));
    unit := p.price;
    if it ? 'variant' and it->>'variant' is not null then
      select x into v from jsonb_array_elements(p.variants) x where x->>'name' = it->>'variant' limit 1;
      if v is not null then unit := (v->>'price')::numeric; end if;
    end if;
    sub := sub + unit * q;
  end loop;
  new.subtotal := sub;
  new.shipping := case when sub >= 999 then 0 else 79 end;
  new.total := new.subtotal + new.shipping;
  new.status := 'placed';
  new.payment_status := 'pending';
  new.payment_method := 'cod';
  return new;
end $$;
create trigger price_order_before_insert before insert on public.orders for each row execute function public.price_order();