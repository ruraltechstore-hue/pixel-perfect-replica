import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { discount, type Product } from "@/lib/catalog";
import { inr, useStore } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const off = discount(p);
  const liked = wishlist.includes(p.id);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5">
      <button
        onClick={() => toggleWishlist(p.id)}
        aria-label="Toggle wishlist"
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/90"
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
      </button>
      {off > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-foreground">{off}% off</span>
      )}
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block aspect-square overflow-hidden bg-muted">
        <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.brand}</p>
        <Link to="/product/$slug" params={{ slug: p.slug }} className="line-clamp-2 font-medium leading-snug hover:text-primary">{p.name}</Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {p.rating} ({p.review_count})
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-primary">{inr(p.price)}</span>
            {off > 0 && <span className="ml-2 text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>}
          </div>
          <button
            disabled={p.stock <= 0}
            onClick={() => {
              addToCart({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? "", price: Number(p.price), qty: 1 });
              toast.success("Added to cart");
            }}
            className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
          >
            {p.stock > 0 ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductRow({ title, items }: { title: string; items: Product[] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-3xl font-semibold text-primary-deep">{title}</h2>
        <Link to="/products" className="text-sm font-semibold text-primary hover:underline">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
