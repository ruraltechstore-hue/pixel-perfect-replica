import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery } from "@/lib/catalog";
import { meta } from "@/components/site/Page";

export const Route = createFileRoute("/categories")({
  head: () => meta("Categories", "Explore every Angadi category — solar, phones, farm tools, water and more."),
  component: Categories,
});

function Categories() {
  const { data: cats = [] } = useQuery(categoriesQuery);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-4xl font-semibold text-primary-deep">All categories</h1>
      {cats.length === 0 && <p className="text-muted-foreground">No categories available.</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cats.map((c) => (
          <Link key={c.id} to="/products" search={{ category: c.slug }} className="group overflow-hidden rounded-2xl border bg-card shadow-card">
            <div className="aspect-square overflow-hidden bg-muted">
              {c.image_url && <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
            </div>
            <p className="p-4 font-display text-xl font-semibold">{c.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
