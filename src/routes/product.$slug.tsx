import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Heart, Minus, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { productsQuery, discount, type Variant } from "@/lib/catalog";
import { inr, useStore } from "@/lib/store";
import { ProductRow } from "@/components/site/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product details — Angadi" },
      { name: "description", content: "Product details, specifications and delivery information at Angadi." },
      { property: "og:title", content: "Product details — Angadi" },
      { property: "og:description", content: "Product details, specifications and delivery information at Angadi." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const p = products.find((x) => x.slug === slug);
  const { addToCart, toggleWishlist, wishlist, addRecent } = useStore();
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => { if (p) { addRecent(p.id); document.title = `${p.name} — Angadi`; } }, [p?.id]);

  if (isLoading) return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  if (!p) return <div className="py-24 text-center"><p>Product not found.</p><Link to="/products" className="text-primary underline">Browse products</Link></div>;

  const variants = (p.variants as Variant[]) ?? [];
  const v = variants[vi];
  const price = v ? Number(v.price) : Number(p.price);
  const stock = v ? v.stock : p.stock;
  const off = discount({ price, mrp: Number(p.mrp) });
  const specs = Object.entries((p.specifications as Record<string, string>) ?? {});
  const images = v?.image ? [v.image, ...p.images] : p.images;

  const add = (buy: boolean) => {
    addToCart({ productId: p.id, slug: p.slug, name: p.name, image: images[0] ?? "", price, ...(v ? { variant: v.name } : {}), qty });
    if (buy) navigate({ to: "/checkout" });
    else toast.success("Added to cart");
  };

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2">
        <div>
          <div
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border bg-card"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <img
              src={images[img] ?? images[0]}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-200"
              style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((src, i) => (
                <button key={i} onClick={() => setImg(i)} className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{p.brand}</p>
          <h1 className="mt-1 text-4xl font-semibold text-primary-deep md:text-5xl">{p.name}</h1>
          {p.review_count > 0 && <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-success px-2 py-0.5 font-semibold text-primary-foreground">{p.rating} <Star className="h-3 w-3 fill-current" /></span>
            <span className="text-muted-foreground">{p.review_count} ratings</span>
          </div>}
          <div className="gold-rule my-5" />
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{inr(price)}</span>
            {off > 0 && <><span className="text-muted-foreground line-through">{inr(Number(p.mrp))}</span><span className="font-semibold text-success">{off}% off</span></>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
          <p className={`mt-3 text-sm font-semibold ${stock <= 0 ? "text-destructive" : stock <= p.low_stock_threshold ? "text-gold-foreground" : "text-success"}`}>
            {stock <= 0 ? "Out of stock" : stock <= p.low_stock_threshold ? `Only ${stock} left` : "In stock"}
          </p>

          {variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Choose option</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((x, i) => (
                  <button key={x.name} onClick={() => { setVi(i); setImg(0); }} className={`rounded-xl border px-4 py-2 text-sm ${i === vi ? "border-primary bg-accent font-semibold" : "bg-card"}`}>
                    {x.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border bg-card">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="p-3" aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={() => toggleWishlist(p.id)} className="rounded-full border bg-card p-3" aria-label="Wishlist">
              <Heart className={`h-5 w-5 ${wishlist.includes(p.id) ? "fill-destructive text-destructive" : ""}`} />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button disabled={stock <= 0} onClick={() => add(false)} className="rounded-full border-2 border-primary py-3 font-semibold text-primary hover:bg-accent disabled:opacity-40">Add to cart</button>
            <button disabled={stock <= 0} onClick={() => add(true)} className="rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-40">Buy now</button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4" /> Delivery details not yet confirmed</p>

          {p.description && <><h2 className="mt-8 text-2xl font-semibold">Description</h2><p className="mt-2 text-foreground/80">{p.description}</p></>}
          {specs.length > 0 && (
            <>
              <h2 className="mt-8 text-2xl font-semibold">Specifications</h2>
              <dl className="mt-3 divide-y rounded-xl border bg-card">
                {specs.map(([k, val]) => (
                  <div key={k} className="grid grid-cols-2 px-4 py-2.5 text-sm"><dt className="text-muted-foreground">{k}</dt><dd>{val}</dd></div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
      <ProductRow title="Similar products" items={products.filter((x) => x.category_id === p.category_id && x.id !== p.id)} />
    </div>
  );
}
