import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { categoriesQuery, productsQuery, discount } from "@/lib/catalog";
import { ProductRow } from "@/components/site/ProductCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Angadi — Solar, phones & farm tech for rural India" },
      { name: "description", content: "Shop solar home kits, rugged phones, battery sprayers and drip irrigation. Cash on delivery to your village." },
      { property: "og:title", content: "Angadi — Technology for rural India" },
      { property: "og:description", content: "Solar, phones, farm tools and irrigation delivered to your village." },
    ],
  }),
  component: Home,
});

const slides = [
  { img: "/images/hero-1.jpg", eyebrow: "Power your home", title: "Light, fans and charging — from the sun", cta: "Shop solar", to: "solar-energy" },
  { img: "/images/hero-2.jpg", eyebrow: "Grow more, use less", title: "Drip irrigation that saves 60% water", cta: "Shop irrigation", to: "water-irrigation" },
];

function Home() {
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const { recent } = useStore();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const recentItems = recent.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
  const offers = [...products].sort((a, b) => discount(b) - discount(a));

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <div className="relative h-[380px] overflow-hidden rounded-3xl md:h-[460px]">
          {slides.map((s, idx) => (
            <div key={s.img} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}>
              <img src={s.img} alt="" className="h-full w-full object-cover" width={1600} height={704} />
              <div className="hero-overlay absolute inset-0" />
              <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center gap-4 p-8 text-primary-foreground md:p-14">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">{s.eyebrow}</p>
                <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{s.title}</h1>
                <Link to="/products" search={{ category: s.to }} className="w-fit rounded-full bg-gold px-6 py-3 text-sm font-bold text-gold-foreground hover:opacity-90">
                  {s.cta}
                </Link>
              </div>
            </div>
          ))}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} className={`h-1.5 rounded-full bg-primary-foreground transition-all ${idx === i ? "w-8" : "w-3 opacity-50"}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14">
        <h2 className="mb-5 text-3xl font-semibold text-primary-deep">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cats.filter((c) => c.is_featured).map((c) => (
            <Link key={c.id} to="/products" search={{ category: c.slug }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
              {c.image_url && <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/85 to-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-2xl font-semibold text-primary-foreground">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="Trending now" items={products.filter((p) => p.is_trending)} />
      <ProductRow title="Best sellers" items={products.filter((p) => p.is_bestseller)} />
      <ProductRow title="New arrivals" items={products.filter((p) => p.is_new)} />
      <ProductRow title="Special offers" items={offers} />
      <ProductRow title="Recommended for you" items={products.filter((p) => p.is_featured)} />
      <ProductRow title="Recently viewed" items={recentItems} />

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="grid gap-6 rounded-3xl bg-secondary p-8 md:grid-cols-4">
          {[
            [ShieldCheck, "Secure payments", "Cash on delivery or online"],
            [Truck, "Village delivery", "We reach rural pincodes"],
            [RotateCcw, "Easy returns", "7-day hassle-free returns"],
            [Headphones, "Local support", "Help in your language"],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Truck;
            return (
              <div key={t as string} className="flex items-start gap-3">
                <I className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">{t as string}</p>
                  <p className="text-sm text-muted-foreground">{d as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
