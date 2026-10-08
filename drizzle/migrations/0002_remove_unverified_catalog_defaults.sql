ALTER TABLE public.products ALTER COLUMN rating SET DEFAULT 0;
CREATE OR REPLACE FUNCTION public.price_order() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE it jsonb; p record; unit numeric; v jsonb; sub numeric := 0; q int;
BEGIN
  IF jsonb_typeof(new.items) <> 'array' OR jsonb_array_length(new.items) = 0 OR jsonb_array_length(new.items) > 50 THEN RAISE EXCEPTION 'Invalid items'; END IF;
  FOR it IN SELECT * FROM jsonb_array_elements(new.items) LOOP
    SELECT * INTO p FROM public.products WHERE id = (it->>'productId')::uuid AND is_active;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product unavailable'; END IF;
    q := greatest(1, least(20, coalesce((it->>'qty')::int, 1)));
    unit := p.price;
    IF it ? 'variant' AND it->>'variant' IS NOT NULL THEN
      SELECT x INTO v FROM jsonb_array_elements(p.variants) x WHERE x->>'name' = it->>'variant' LIMIT 1;
      IF v IS NOT NULL THEN unit := (v->>'price')::numeric; END IF;
    END IF;
    sub := sub + unit * q;
  END LOOP;
  new.subtotal := sub;
  RAISE EXCEPTION 'Ordering is unavailable until delivery charges are confirmed by the store';
  RETURN new;
END $$;