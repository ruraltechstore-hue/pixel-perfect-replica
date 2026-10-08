import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { inr, itemKey, useStore } from "@/lib/store";
import { meta } from "@/components/site/Page";

export const Route = createFileRoute("/cart")({
  head: () => meta("Your cart", "Review the items in your Angadi cart."),
  component: Cart,
});

export const shippingFor = (subtotal: number) => (subtotal >= 999 || subtotal === 0 ? 0 : 79);

function Cart() {
  const { cart, updateQty, removeFromCart } = useStore();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = shippingFor(subtotal);

  if (!cart.length)
    return (
      <div className="py-24 text-center">
        <h1 className="text-4xl font-semibold text-primary-deep">Your cart is empty</h1>
        <Link to="/products" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Start shopping</Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_340px]">
      <div>
        <h1 className="mb-6 text-4xl font-semibold text-primary-deep">Cart</h1>
        <div className="divide-y rounded-2xl border bg-card">
          {cart.map((i) => (
            <div key={itemKey(i)} className="flex gap-4 p-4">
              <img src={i.image} alt="" className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col">
                <Link to="/product/$slug" params={{ slug: i.slug }} className="font-medium hover:text-primary">{i.name}</Link>
                {i.variant && <p className="text-sm text-muted-foreground">{i.variant}</p>}
                <p className="mt-1 font-bold text-primary">{inr(i.price)}</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center rounded-full border">
                    <button className="p-2" onClick={() => updateQty(itemKey(i), i.qty - 1)} aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm">{i.qty}</span>
                    <button className="p-2" onClick={() => updateQty(itemKey(i), i.qty + 1)} aria-label="Increase"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(itemKey(i))} className="text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-2xl border bg-card p-6 md:mt-16">
        <h2 className="text-2xl font-semibold">Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <Row l="Subtotal" r={inr(subtotal)} />
          <Row l="Delivery" r={ship ? inr(ship) : "Free"} />
          <div className="gold-rule my-3" />
          <Row l="Total" r={inr(subtotal + ship)} bold />
        </div>
        {ship > 0 && <p className="mt-2 text-xs text-muted-foreground">Free delivery on orders above ₹999</p>}
        <Link to="/checkout" className="mt-5 block rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground hover:bg-primary-deep">Proceed to checkout</Link>
      </aside>
    </div>
  );
}

function Row({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "text-lg font-bold" : ""}`}><span>{l}</span><span>{r}</span></div>;
}
