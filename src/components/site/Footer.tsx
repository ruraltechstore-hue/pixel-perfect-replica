import { Link } from "@tanstack/react-router";

const groups = [
  { title: "Shop", links: [["/products", "All products"], ["/categories", "Categories"], ["/wishlist", "Wishlist"], ["/track", "Track order"]] },
  { title: "Company", links: [["/about", "About us"], ["/contact", "Contact"], ["/faq", "FAQ"]] },
  { title: "Policies", links: [["/terms", "Terms & conditions"], ["/privacy", "Privacy policy"], ["/shipping-policy", "Shipping policy"], ["/returns", "Returns & refunds"]] },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-3xl tracking-[0.3em]">ANGADI</p>
          <div className="gold-rule my-3 w-40" />
          <p className="text-sm opacity-75">Trusted technology for rural India — solar, phones, farm and water tools, delivered to your village.</p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-3 text-sm font-semibold text-gold">{g.title}</p>
            <ul className="space-y-2 text-sm opacity-80">
              {g.links.map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:opacity-100 hover:underline">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Angadi. All rights reserved.
      </div>
    </footer>
  );
}
