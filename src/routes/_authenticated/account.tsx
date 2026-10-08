import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr, statusLabel } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "My account — Angadi" }, { name: "description", content: "Your Angadi account and orders." }, { property: "og:title", content: "My account — Angadi" }, { property: "og:description", content: "Your Angadi account and orders." }] }),
  component: Account,
});


function Account() {
  const { user } = Route.useRouteContext();
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-primary-deep">My account</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && <Link to="/admin" className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-gold-foreground">Admin panel</Link>}
          <button onClick={signOut} className="rounded-full border px-5 py-2 text-sm">Sign out</button>
        </div>
      </div>
      <h2 className="mt-10 text-2xl font-semibold">My orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No orders yet. <Link to="/products" className="text-primary underline">Start shopping</Link></p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to="/track" search={{ order: o.order_number }} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 hover:border-primary">
              <div>
                <p className="font-semibold">#{o.order_number}</p>
                <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")} · {(o.items as unknown[]).length} items</p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold">{statusLabel(o.status)}</span>
              <span className="font-bold text-primary">{inr(o.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
