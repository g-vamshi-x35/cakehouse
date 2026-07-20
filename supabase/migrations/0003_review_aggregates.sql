-- Keep products.avg_rating / review_count in sync with the reviews table.
create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);

  update products
  set
    avg_rating = coalesce((select round(avg(rating)::numeric, 2) from reviews where product_id = target_product_id), 0),
    review_count = (select count(*) from reviews where product_id = target_product_id)
  where id = target_product_id;

  return coalesce(new, old);
end;
$$;

create trigger reviews_refresh_product_rating
  after insert or update or delete on reviews
  for each row execute function public.refresh_product_rating();
