import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, UserPlus, Car, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { type UserRole } from "@/lib/supabase";
import { SiteFooter, SiteHeader } from "@/components/blindbridge/site-chrome";

const TITLE = "Sign Up — BlindBridge AI";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Create your BlindBridge AI account as a driver or customer." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName, role, phone);
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 2000);
  };

  if (success) {
    return (
      <div className="relative min-h-dvh overflow-hidden">
        <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <SiteHeader />
        <main className="mx-auto flex min-h-dvh max-w-md items-center px-4 pt-20 pb-16">
          <div className="glass w-full rounded-3xl p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-chart-3/20">
              <UserPlus className="size-8 text-chart-3" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Account Created!</h1>
            <p className="mt-2 text-muted-foreground">
              Your {role} account has been created successfully. Please check your email to verify your account.
            </p>
            <Link
              to="/login"
              className="glow mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground"
            >
              Go to Login
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <SiteHeader />

      <main className="mx-auto flex min-h-dvh max-w-md items-center px-4 pt-24 pb-16">
        <div className="glass w-full rounded-3xl p-8">
          <div className="text-center">
            <UserPlus className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 text-3xl font-bold">Create Account</h1>
            <p className="mt-2 text-muted-foreground">Join BlindBridge as a driver or customer</p>
          </div>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                role === "customer"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <User className="size-6" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("driver")}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                role === "driver"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <Car className="size-6" />
              <span>Driver</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-2xl bg-destructive/15 p-4 text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                Phone Number {role === "driver" && <span className="text-destructive">*</span>}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={role === "driver"}
                className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="text-sm font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="signup-password"
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

            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-muted-foreground">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow min-h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {loading ? "Creating account…" : `Sign Up as ${role === "driver" ? "Driver" : "Customer"}`}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}