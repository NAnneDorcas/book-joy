import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Loader2, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard/services", { replace: true });
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard/services", { replace: true });
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Enter a valid email and a password with at least 6 characters.");
      return;
    }

    setLoading(true);
    const action = isSignUp
      ? supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
      : supabase.auth.signInWithPassword({ email: email.trim(), password });
    const { error } = await action;
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (isSignUp) toast.success("Check your email to confirm your account.");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setLoading(false);
    if (result.error) toast.error(result.error.message);
    if (!result.redirected && !result.error) navigate("/dashboard/services", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gradient-hero px-5 py-8">
      <Link to="/" className="mx-auto mb-10 flex max-w-6xl items-center gap-3 font-display text-lg font-bold">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
          <Sparkles className="h-5 w-5" />
        </span>
        BookingAgent Pro
      </Link>

      <section className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border bg-card/85 p-6 shadow-soft backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h1 className="font-display text-3xl font-black">Dashboard Login</h1>
            <p className="mt-2 text-muted-foreground">Access clinic services, bookings, and AI agent settings.</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <label className="block space-y-2 text-sm font-semibold">
              <span>Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="clinic@example.com" autoComplete="email" />
            </label>
            <label className="block space-y-2 text-sm font-semibold">
              <span>Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={isSignUp ? "new-password" : "current-password"} />
            </label>
            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="glass" className="w-full" onClick={handleGoogle} disabled={loading}>
            <Mail className="h-4 w-4" /> Continue with Google
          </Button>

          <button className="mt-5 w-full text-sm font-semibold text-primary" onClick={() => setIsSignUp((value) => !value)}>
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
          </button>
        </div>

        <div className="rounded-2xl bg-gradient-dark p-8 text-primary-foreground shadow-glow">
          <Bot className="mb-8 h-12 w-12" />
          <h2 className="font-display text-4xl font-black leading-tight">Run your AI clinic booking desk from one secure workspace.</h2>
          <p className="mt-5 max-w-xl text-primary-foreground/75">Manage dental services, review bookings, and control whether the assistant only answers questions or completes bookings.</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
