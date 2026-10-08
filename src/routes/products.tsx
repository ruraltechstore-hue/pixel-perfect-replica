import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery, productsQuery, discount } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";

type Search = { q?: string | undefined; category?: string | undefined; sort?: "new" | "low" | "high" | "discount" | undefined };

export const Route = createFileRoute("/products")({
  validateSearch: (s: { q?: unknown; category?: unknown; sort?: unknown }): Search => ({
    q: typeof s.q === "string" ? s.q.slice(0, 100) : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    sort: ["new", "low", "high", "discount"].includes(s.sort as string) ? (s.sort as Search["sort"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all products — Angadi" },
      { name: "description", content: "Browse solar kits, rugged phones, farm tools and irrigation equipment." },
      { property: "og:title", content: "Shop all products — Angadi" },
      { property: "og:description", content: "Browse solar kits, rugged phones, farm tools and irrigation equipment." },
    ],
  }),
  component: Products,
});

function Products() {
  const { q, category, sort } = Route.useSearch();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const navigate = Route.useNavigate();
  const cat = cats.find((c) => c.slug === category);
  const term = q?.toLowerCase();

  let list = products.filter((p) => {
    if (cat && p.category_id !== cat.id) return false;
    if (term && ![p.name, p.brand ?? "", p.description ?? "", ...p.tags].join(" ").toLowerCase().includes(term)) return false;
    return true;
  });
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "discount") list = [...list].sort((a, b) => discount(b) - discount(a));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold text-primary-deep">
        {q ? `Results for “${q}”` : cat ? cat.name : "All products"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{list.length} items</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link to="/products" search={{ q, sort }} className={chip(!category)}>All</Link>
        {cats.map((c) => (
          <Link key={c.id} to="/products" search={{ q, sort, category: c.slug }} className={chip(category === c.slug)}>{c.name}</Link>
        ))}
        <select
          value={sort ?? "new"}
          onChange={(e) => navigate({ search: { q, category, sort: e.target.value as Search["sort"] }, replace: true })}
          className="ml-auto rounded-full border bg-card px-4 py-2 text-sm"
        >
          <option value="new">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
          <option value="discount">Biggest discount</option>
        </select>
      </div>
      {isLoading ? (
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No products found.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

const chip = (on: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm ${on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`;
