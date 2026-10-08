import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { meta } from "@/components/site/Page";

export const Route = createFileRoute("/auth")({
  head: () => meta("Sign in", "Sign in or create your Angadi account."),
  component: AuthPage,
});

const schema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(6).max(72) });

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error("Enter a valid email and a password of at least 6 characters");
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/account" });
    } else {
      const { error } = await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: window.location.origin } });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Check your email to confirm your account");
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return toast.error("Google sign-in failed");
    if (r.redirected) return;
    navigate({ to: "/account" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="text-center text-4xl font-semibold text-primary-deep">{mode === "in" ? "Welcome back" : "Create account"}</h1>
        <div className="gold-rule mx-auto my-4 w-32" />
        <button onClick={google} className="w-full rounded-full border py-3 font-semibold hover:bg-muted">Continue with Google</button>
        <p className="my-4 text-center text-xs text-muted-foreground">or</p>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border bg-background px-4 py-3" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border bg-background px-4 py-3" />
          <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm">
          {mode === "in" ? "New to Angadi? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-semibold text-primary underline">
            {mode === "in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
