import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Page, meta } from "@/components/site/Page";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact us", "Get in touch with the Angadi team for orders and support."),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(f);
    if (!p.success) { toast.error("Please fill in all fields correctly"); return; }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(p.data);
    setBusy(false);
    if (error) { toast.error("Could not send, please try again"); return; }
    toast.success("Thanks! We'll get back to you soon.");
    setF({ name: "", email: "", message: "" });
  };
  return (
    <Page title="Contact us" subtitle="We usually reply within one working day.">
      <form onSubmit={send} className="space-y-3">
        <input className="w-full rounded-xl border bg-card px-4 py-3" placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="w-full rounded-xl border bg-card px-4 py-3" type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <textarea className="w-full rounded-xl border bg-card px-4 py-3" rows={5} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
        <button disabled={busy} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Sending…" : "Send message"}</button>
      </form>
    </Page>
  );
}
