import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery, productsQuery, discount } from "@/lib/catalog";
import { ProductRow } from "@/components/site/ProductCard";
import { meta } from "@/components/site/Page";
import { useStore } from "@/lib/store";
import logo from "@/assets/logo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => meta("Angadi rural tech store", "Browse the Angadi catalog."),
  component: Home,
});

function Home() {
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { recent } = useStore();
  const featuredCats = cats.filter((c) => c.is_featured);
  const recentItems = recent.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const offers = products.filter((p) => discount(p) > 0).sort((a, b) => discount(b) - discount(a));

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <img src={logo.url} alt="Angadi logo" className="mb-6 h-24 w-auto mix-blend-multiply" />
        <h1 className="text-5xl font-semibold text-primary-deep">Angadi</h1>
        <p className="mt-3 text-lg text-muted-foreground">Rural tech store</p>
        {!isLoading && products.length === 0 && <p className="mt-8 text-muted-foreground">No products available yet.</p>}
        <Link to="/products" className="mt-6 inline-block font-semibold text-primary underline underline-offset-4">Browse products</Link>
      </section>
      {featuredCats.length > 0 && <section className="mx-auto max-w-7xl px-4 pt-8">
        <h2 className="mb-5 text-3xl font-semibold text-primary-deep">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredCats.map((c) => <Link key={c.id} to="/products" search={{ category: c.slug }} className="overflow-hidden rounded-lg border bg-card">
            {c.image_url && <img src={c.image_url} alt={c.name} loading="lazy" className="aspect-square w-full object-cover" />}
            <p className="p-4 font-display text-2xl font-semibold">{c.name}</p>
          </Link>)}
        </div>
      </section>}
      <ProductRow title="Trending now" items={products.filter((p) => p.is_trending)} />
      <ProductRow title="Best sellers" items={products.filter((p) => p.is_bestseller)} />
      <ProductRow title="New arrivals" items={products.filter((p) => p.is_new)} />
      <ProductRow title="Special offers" items={offers} />
      <ProductRow title="Recommended for you" items={products.filter((p) => p.is_featured)} />
      <ProductRow title="Recently viewed" items={recentItems} />
    </div>
  );
}
