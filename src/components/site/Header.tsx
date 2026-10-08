import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Search, ShoppingBag, User, LayoutDashboard } from "lucide-react";
import { useMemo, useState } from "react";
import logo from "@/assets/logo.jpg.asset.json";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { cart, wishlist } = useStore();
  const { user, isAdmin } = useAuth();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const navigate = useNavigate();
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const suggestions = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return products
      .filter((p) => [p.name, p.brand ?? "", ...(p.tags ?? [])].join(" ").toLowerCase().includes(t))
      .slice(0, 6);
  }, [q, products]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFocus(false);
    navigate({ to: "/products", search: { q: q.trim() || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="shrink-0">
          <img src={logo.url} alt="Angadi" className="h-12 w-auto mix-blend-multiply" />
        </Link>
        <form onSubmit={submit} className="relative flex-1">
          <div className="flex items-center rounded-full border bg-card pl-4 focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              placeholder="Search solar kits, phones, sprayers…"
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              maxLength={100}
            />
            <button className="m-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
              Search
            </button>
          </div>
          {focus && suggestions.length > 0 && (
            <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-xl border bg-popover shadow-card">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted"
                >
                  <img src={p.images[0]} alt="" className="h-9 w-9 rounded object-cover" />
                  <span>{p.name}</span>
                </Link>
              ))}
            </div>
          )}
        </form>
        <nav className="flex items-center gap-1 text-sm">
          {isAdmin && (
            <Link to="/admin" className="hidden items-center gap-1 rounded-lg px-3 py-2 hover:bg-muted md:flex">
              <LayoutDashboard className="h-5 w-5" /> Admin
            </Link>
          )}
          <Link to={user ? "/account" : "/auth"} className="flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-muted">
            <User className="h-5 w-5" />
            <span className="hidden md:inline">{user ? "Account" : "Sign in"}</span>
          </Link>
          <Link to="/wishlist" className="relative rounded-lg px-3 py-2 hover:bg-muted" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <Link to="/cart" className="relative rounded-lg px-3 py-2 hover:bg-muted" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <Badge n={count} />}
          </Link>
        </nav>
      </div>
      <div className="gold-rule" />
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm">
        <Link to="/products" className="whitespace-nowrap font-semibold text-primary">All products</Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            to="/products"
            search={{ category: c.slug }}
            className="whitespace-nowrap text-muted-foreground hover:text-primary"
          >
            {c.name}
          </Link>
        ))}
        <Link to="/track" search={{}} className="ml-auto whitespace-nowrap text-muted-foreground hover:text-primary">Track order</Link>
      </div>
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
      {n}
    </span>
  );
}
