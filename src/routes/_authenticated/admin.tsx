import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { inr, statusLabel, statusSteps } from "@/lib/store";
import type { Category, Product, Variant } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Angadi" }, { name: "description", content: "Manage Angadi categories, products and orders." }, { property: "og:title", content: "Admin — Angadi" }, { property: "og:description", content: "Manage Angadi store." }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function uploadImage(file: File) {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
  const { error } = await supabase.storage.from("store").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("store").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2) throw e2;
  return data.signedUrl;
}

const input = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

function Admin() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"dash" | "cats" | "products" | "orders">("dash");
  if (loading) return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  if (!isAdmin) return <p className="py-24 text-center">You don't have access to the admin panel. <Link to="/" className="text-primary underline">Go home</Link></p>;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold text-primary-deep">Admin panel</h1>
      <div className="mt-6 flex gap-2 border-b">
        {([["dash", "Dashboard"], ["cats", "Categories"], ["products", "Products"], ["orders", "Orders"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`border-b-2 px-4 py-2 text-sm font-semibold ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "dash" && <Dashboard />}
        {tab === "cats" && <Categories />}
        {tab === "products" && <Products />}
        {tab === "orders" && <Orders />}
      </div>
    </div>
  );
}

function useAdminData() {
  const cats = useQuery({ queryKey: ["admin-cats"], queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [] });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false })).data ?? [] });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [] });
  return { cats: cats.data ?? [], products: products.data ?? [], orders: orders.data ?? [] };
}

function useRefresh() {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries(); };
}

function Dashboard() {
  const { products, orders, cats } = useAdminData();
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const low = products.filter((p) => p.stock <= p.low_stock_threshold);
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-4">
        {[["Orders", orders.length], ["Revenue", inr(revenue)], ["Products", products.length], ["Categories", cats.length]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-3xl font-bold text-primary">{v}</p></div>
        ))}
      </div>
      <h2 className="mt-8 text-2xl font-semibold">Low stock</h2>
      {low.length === 0 ? <p className="text-sm text-muted-foreground">All products are well stocked.</p> : (
        <ul className="mt-3 divide-y rounded-xl border bg-card">{low.map((p) => <li key={p.id} className="flex justify-between px-4 py-2 text-sm"><span>{p.name}</span><span className="font-semibold text-destructive">{p.stock} left</span></li>)}</ul>
      )}
    </div>
  );
}

function Categories() {
  const { cats } = useAdminData();
  const refresh = useRefresh();
  const empty = { name: "", image_url: "", is_active: true, is_featured: false, sort_order: 0 };
  const [edit, setEdit] = useState<Partial<Category> | null>(null);

  const save = async () => {
    if (!edit?.name?.trim()) { toast.error("Name is required"); return; }
    const row = { name: edit.name.trim(), slug: slugify(edit.name), image_url: edit.image_url || null, is_active: !!edit.is_active, is_featured: !!edit.is_featured, sort_order: Number(edit.sort_order) || 0 };
    const { error } = edit.id ? await supabase.from("categories").update(row).eq("id", edit.id) : await supabase.from("categories").insert(row);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setEdit(null); refresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this category? Products will become uncategorised.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };

  return (
    <div>
      <button onClick={() => setEdit(empty)} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">+ New category</button>
      {edit && (
        <div className="mt-4 grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-2">
          <input className={input} placeholder="Name" value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <input className={input} type="number" placeholder="Display order" value={edit.sort_order ?? 0} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} />
          <ImageField value={edit.image_url ?? ""} onChange={(u) => setEdit({ ...edit, image_url: u })} />
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Enabled</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!edit.is_featured} onChange={(e) => setEdit({ ...edit, is_featured: e.target.checked })} /> Featured on home</label>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button onClick={save} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Save</button>
            <button onClick={() => setEdit(null)} className="rounded-full border px-5 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <table className="mt-6 w-full overflow-hidden rounded-xl border bg-card text-sm">
        <thead className="bg-muted text-left"><tr><th className="p-3">Order</th><th>Category</th><th>Status</th><th>Featured</th><th /></tr></thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3">{c.sort_order}</td>
              <td className="flex items-center gap-2 py-2">{c.image_url && <img src={c.image_url} alt="" className="h-8 w-8 rounded object-cover" />}{c.name}</td>
              <td>{c.is_active ? "Enabled" : "Disabled"}</td>
              <td>{c.is_featured ? "Yes" : "—"}</td>
              <td className="pr-3 text-right"><button onClick={() => setEdit(c)} className="p-1"><Pencil className="h-4 w-4" /></button><button onClick={() => del(c.id)} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (u: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {value && <img src={value} alt="" className="h-10 w-10 rounded object-cover" />}
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
        <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload image"}
        <input type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setBusy(true);
          try { onChange(await uploadImage(f)); } catch (err) { toast.error((err as Error).message); }
          setBusy(false);
        }} />
      </label>
    </div>
  );
}

type Form = {
  id?: string | undefined; name: string; sku: string; category_id: string; brand: string; description: string; images: string[];
  price: string; mrp: string; stock: string; low_stock_threshold: string; variants: string; specifications: string; tags: string;
  is_featured: boolean; is_trending: boolean; is_new: boolean; is_bestseller: boolean; is_active: boolean;
};

const toForm = (p?: Product): Form => ({
  id: p?.id, name: p?.name ?? "", sku: p?.sku ?? "", category_id: p?.category_id ?? "", brand: p?.brand ?? "", description: p?.description ?? "",
  images: p?.images ?? [], price: String(p?.price ?? ""), mrp: String(p?.mrp ?? ""), stock: String(p?.stock ?? 0), low_stock_threshold: String(p?.low_stock_threshold ?? 5),
  variants: ((p?.variants as Variant[]) ?? []).map((v) => `${v.name} | ${v.price} | ${v.stock}${v.sku ? ` | ${v.sku}` : ""}`).join("\n"),
  specifications: Object.entries((p?.specifications as Record<string, string>) ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n"),
  tags: (p?.tags ?? []).join(", "),
  is_featured: !!p?.is_featured, is_trending: !!p?.is_trending, is_new: !!p?.is_new, is_bestseller: !!p?.is_bestseller, is_active: p?.is_active ?? true,
});

function Products() {
  const { products, cats } = useAdminData();
  const refresh = useRefresh();
  const [f, setF] = useState<Form | null>(null);
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    if (!f) return;
    if (!f.name.trim() || !f.price) { toast.error("Name and price are required"); return; }
    const variants = f.variants.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((a) => a[0])
      .map(([name, price, stock, sku]) => ({ name, price: Number(price) || 0, stock: Number(stock) || 0, ...(sku ? { sku } : {}) }));
    const specifications = Object.fromEntries(f.specifications.split("\n").map((l) => l.split(":")).filter((a) => a.length > 1).map(([k, ...v]) => [(k ?? "").trim(), v.join(":").trim()]));
    const row = {
      name: f.name.trim(), slug: f.id ? undefined : `${slugify(f.name)}-${Math.random().toString(36).slice(2, 6)}`, sku: f.sku || null,
      category_id: f.category_id || null, brand: f.brand || null, description: f.description || null, images: f.images,
      price: Number(f.price), mrp: Number(f.mrp) || Number(f.price), stock: Number(f.stock) || 0, low_stock_threshold: Number(f.low_stock_threshold) || 5,
      variants, specifications, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_featured: f.is_featured, is_trending: f.is_trending, is_new: f.is_new, is_bestseller: f.is_bestseller, is_active: f.is_active,
    };
    const { slug, ...rest } = row;
    const { error } = f.id ? await supabase.from("products").update(rest).eq("id", f.id) : await supabase.from("products").insert({ ...rest, slug: slug! });
    if (error) { toast.error(error.message); return; }
    toast.success("Product saved"); setF(null); refresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };

  if (f) {
    const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
    return (
      <div className="grid gap-3 rounded-2xl border bg-card p-6 md:grid-cols-2">
        <h2 className="text-2xl font-semibold md:col-span-2">{f.id ? "Edit product" : "New product"}</h2>
        <input className={input} placeholder="Product name" value={f.name} onChange={set("name")} />
        <input className={input} placeholder="SKU" value={f.sku} onChange={set("sku")} />
        <select className={input} value={f.category_id} onChange={set("category_id")}>
          <option value="">— Select category —</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className={input} placeholder="Brand" value={f.brand} onChange={set("brand")} />
        <input className={input} type="number" placeholder="Selling price (₹)" value={f.price} onChange={set("price")} />
        <input className={input} type="number" placeholder="MRP (₹)" value={f.mrp} onChange={set("mrp")} />
        <input className={input} type="number" placeholder="Stock" value={f.stock} onChange={set("stock")} />
        <input className={input} type="number" placeholder="Low-stock alert at" value={f.low_stock_threshold} onChange={set("low_stock_threshold")} />
        <textarea className={`${input} md:col-span-2`} rows={3} placeholder="Description" value={f.description} onChange={set("description")} />
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-semibold">Images</p>
          <div className="flex flex-wrap gap-2">
            {f.images.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} className="absolute -right-2 -top-2 rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">×</button>
              </div>
            ))}
            <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border border-dashed text-xs text-muted-foreground">
              {uploading ? "…" : "+ Add"}
              <input type="file" accept="image/*" multiple hidden onChange={async (e) => {
                const files = Array.from(e.target.files ?? []); if (!files.length) return;
                setUploading(true);
                try { const urls = await Promise.all(files.map(uploadImage)); setF((cur) => cur && { ...cur, images: [...cur.images, ...urls] }); } catch (err) { toast.error((err as Error).message); }
                setUploading(false);
              }} />
            </label>
          </div>
        </div>
        <textarea className={input} rows={4} placeholder={"Variants, one per line:\nname | price | stock | sku"} value={f.variants} onChange={set("variants")} />
        <textarea className={input} rows={4} placeholder={"Specifications, one per line:\nBattery: 6000mAh"} value={f.specifications} onChange={set("specifications")} />
        <input className={`${input} md:col-span-2`} placeholder="Tags, comma separated" value={f.tags} onChange={set("tags")} />
        <div className="flex flex-wrap gap-4 text-sm md:col-span-2">
          {([["is_active", "Active"], ["is_featured", "Featured"], ["is_trending", "Trending"], ["is_new", "New arrival"], ["is_bestseller", "Best seller"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} /> {l}</label>
          ))}
        </div>
        <div className="flex gap-2 md:col-span-2">
          <button onClick={save} className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">Save product</button>
          <button onClick={() => setF(null)} className="rounded-full border px-6 py-2 text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setF(toForm())} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">+ New product</button>
      <table className="mt-6 w-full rounded-xl border bg-card text-sm">
        <thead className="bg-muted text-left"><tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="flex items-center gap-2 p-2">{p.images[0] && <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />}{p.name}</td>
              <td>{cats.find((c) => c.id === p.category_id)?.name ?? "—"}</td>
              <td>{inr(p.price)}</td>
              <td className={p.stock <= p.low_stock_threshold ? "font-semibold text-destructive" : ""}>{p.stock}</td>
              <td>{p.is_active ? "Active" : "Hidden"}</td>
              <td className="pr-3 text-right"><button onClick={() => setF(toForm(p))} className="p-1"><Pencil className="h-4 w-4" /></button><button onClick={() => del(p.id)} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Orders() {
  const { orders } = useAdminData();
  const refresh = useRefresh();
  const update = async (id: string, patch: { status?: string; payment_status?: string }) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  return (
    <div className="space-y-3">
      {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">#{o.order_number} · {inr(o.total)}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")} · {o.shipping_name}, {o.shipping_phone} · {o.shipping_city} {o.shipping_pincode}</p>
            </div>
            <div className="flex gap-2">
              <select value={o.status} onChange={(e) => update(o.id, { status: e.target.value })} className="rounded-lg border bg-background px-2 py-1 text-sm">
                {[...statusSteps, "cancelled"].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
              <select value={o.payment_status} onChange={(e) => update(o.id, { payment_status: e.target.value })} className="rounded-lg border bg-background px-2 py-1 text-sm">
                {["pending", "paid", "refunded"].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{(o.items as { name: string; qty: number; variant?: string }[]).map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ""} × ${i.qty}`).join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
