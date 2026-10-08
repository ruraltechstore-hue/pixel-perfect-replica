import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { inr, useStore, shippingFor } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Angadi" }, { name: "description", content: "Complete your Angadi order." }, { property: "og:title", content: "Checkout — Angadi" }, { property: "og:description", content: "Complete your Angadi order." }] }),
  component: Checkout,
});

const schema = z.object({
  shipping_name: z.string().trim().min(2).max(100),
  shipping_phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number"),
  shipping_address: z.string().trim().min(5).max(300),
  shipping_city: z.string().trim().min(2).max(80),
  shipping_state: z.string().trim().min(2).max(80),
  shipping_pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

const fields: [keyof z.infer<typeof schema>, string][] = [
  ["shipping_name", "Full name"], ["shipping_phone", "Mobile number"], ["shipping_address", "House, street, village"],
  ["shipping_city", "Town / district"], ["shipping_state", "State"], ["shipping_pincode", "Pincode"],
];

function Checkout() {
  const { cart, clearCart } = useStore();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({});
  const [pay, setPay] = useState("cod");
  const [busy, setBusy] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = shippingFor(subtotal);

  if (!cart.length) return <p className="py-24 text-center">Your cart is empty. <Link to="/products" className="text-primary underline">Shop now</Link></p>;

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ship === null) { toast.error("Delivery charges have not been confirmed."); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check your details"); return; }
    setBusy(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        ...parsed.data,
        user_id: user.id,
        items: cart,
        subtotal, shipping: ship, total: subtotal + ship,
        payment_method: "cod",
      })
      .select("order_number")
      .single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    clearCart();
    toast.success("Order placed!");
    navigate({ to: "/track", search: { order: data.order_number } });
  };

  return (
    <form onSubmit={place} className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-4xl font-semibold text-primary-deep">Checkout</h1>
        <h2 className="mt-6 text-2xl font-semibold">Delivery address</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {fields.map(([k, label]) => (
            <input key={k} placeholder={label} value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className={`rounded-xl border bg-card px-4 py-3 ${k === "shipping_address" ? "md:col-span-2" : ""}`} />
          ))}
        </div>
        <h2 className="mt-8 text-2xl font-semibold">Payment</h2>
        <div className="mt-3 space-y-2">
          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 ${pay === "cod" ? "border-primary" : ""}`}>
            <input type="radio" checked={pay === "cod"} onChange={() => setPay("cod")} /> Cash on delivery
          </label>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border bg-card p-6 md:mt-16">
        <h2 className="text-2xl font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {cart.map((i) => (
            <li key={i.productId + i.variant} className="flex justify-between gap-3"><span>{i.name}{i.variant ? ` (${i.variant})` : ""} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></li>
          ))}
        </ul>
        <div className="gold-rule my-4" />
        <div className="flex justify-between text-sm"><span>Delivery</span><span>{ship === null ? "Not confirmed" : inr(ship)}</span></div>
        <div className="mt-2 flex justify-between text-lg font-bold"><span>Items total</span><span>{inr(subtotal)}</span></div>
        <p className="mt-4 text-sm text-muted-foreground">Checkout is unavailable until delivery charges are confirmed.</p>
        <button disabled={busy || ship === null} className="mt-5 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50">
          {busy ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
