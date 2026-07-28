import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SiteFooter, SiteHeader } from "@/components/blindbridge/site-chrome";

const TITLE = "Login — BlindBridge AI";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Sign in to your BlindBridge AI account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <SiteHeader />

      <main className="mx-auto flex min-h-dvh max-w-md items-center px-4 pt-20 pb-16">
        <div className="glass w-full rounded-3xl p-8">
          <div className="text-center">
            <LogIn className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to your BlindBridge account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-2xl bg-destructive/15 p-4 text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="min-h-12 w-full rounded-2xl bg-secondary px-4 pr-12 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow min-h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}