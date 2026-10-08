<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Catalog/orders live in Lovable Cloud tables; storefront reads via browser client + public RLS — keeps admin edits live without redeploys.
- Order totals are recomputed by the `price_order` DB trigger — never trust client prices.
- Cart, wishlist and recently-viewed are localStorage (src/lib/store.tsx) — no login needed to shop.
- Admin access = `admin` row in user_roles (first signup auto-admin); RLS enforces it, UI checks are cosmetic.
- Storage bucket `store` is private (workspace blocks public buckets); uploads store long-lived signed URLs.
- Never invent catalog entries, ratings, imagery or business policies; unconfirmed delivery charges block ordering in both the UI and order trigger to avoid charging made-up fees.
