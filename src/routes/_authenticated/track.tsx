import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { inr, statusLabel, statusSteps, type CartItem } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/track")({
  validateSearch: (s: Record<string, unknown>) => ({ order: typeof s.order === "string" ? s.order.slice(0, 30) : undefined }),
  head: () => ({ meta: [{ title: "Track your order — Angadi" }, { name: "description", content: "Check the delivery status of your Angadi order." }, { property: "og:title", content: "Track your order — Angadi" }, { property: "og:description", content: "Check the delivery status of your Angadi order." }] }),
  component: Track,
});

function Track() {
  const { order } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(order ?? "");
  const { data, isLoading } = useQuery({
    queryKey: ["order", order],
    enabled: !!order,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("order_number", order!).maybeSingle();
      return data;
    },
  });
  const idx = data ? statusSteps.indexOf(data.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold text-primary-deep">Track your order</h1>
      <form onSubmit={(e) => { e.preventDefault(); navigate({ to: "/track", search: { order: input.trim() } }); }} className="mt-6 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Order number, e.g. AG26100812345" className="flex-1 rounded-full border bg-card px-5 py-3" />
        <button className="rounded-full bg-primary px-6 font-semibold text-primary-foreground">Track</button>
      </form>
      {order && isLoading && <p className="mt-8 text-muted-foreground">Looking up…</p>}
      {order && !isLoading && !data && <p className="mt-8 text-muted-foreground">No order found with that number on your account.</p>}
      {data && (
        <div className="mt-8 rounded-3xl border bg-card p-6">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-semibold">Order #{data.order_number}</p>
            <p className="text-sm text-muted-foreground">Placed {new Date(data.created_at).toLocaleString("en-IN")}</p>
          </div>
          {data.status === "cancelled" ? (
            <p className="mt-6 font-semibold text-destructive">This order was cancelled.</p>
          ) : (
            <ol className="mt-8 grid grid-cols-5 gap-2">
              {statusSteps.map((s, i) => (
                <li key={s} className="flex flex-col items-center text-center text-xs">
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i <= idx ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="mt-2">{statusLabel(s)}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="gold-rule my-6" />
          <ul className="space-y-2 text-sm">
            {(data.items as CartItem[]).map((i, k) => (
              <li key={k} className="flex justify-between"><span>{i.name}{i.variant ? ` (${i.variant})` : ""} × {i.qty}</span></li>
            ))}
          </ul>
          <p className="mt-4 text-right text-lg font-bold">Total {inr(data.total)} · {data.payment_method === "cod" ? "Cash on delivery" : "Paid online"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Delivering to {data.shipping_name}, {data.shipping_address}, {data.shipping_city}, {data.shipping_state} {data.shipping_pincode}</p>
        </div>
      )}
    </div>
  );
}
