import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { productsQuery } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";
import { meta } from "@/components/site/Page";

export const Route = createFileRoute("/wishlist")({
  head: () => meta("Wishlist", "Products you've saved for later at Angadi."),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const { data: products = [] } = useQuery(productsQuery);
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-semibold text-primary-deep">Wishlist</h1>
      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Nothing saved yet. <Link to="/products" className="text-primary underline">Browse products</Link></p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
