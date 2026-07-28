import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Eye, Ear, ScanText, Siren, LogOut, Shield, User, Car } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SiteFooter, SiteHeader } from "@/components/blindbridge/site-chrome";

const TITLE = "Dashboard — BlindBridge AI";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Your BlindBridge AI dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="relative min-h-dvh overflow-hidden">
        <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <SiteHeader />
        <main className="flex min-h-dvh items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading…</p>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const roleIcon = profile?.role === "driver" ? Car : profile?.role === "admin" ? Shield : User;
  const RoleIcon = roleIcon;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pt-32 pb-16">
        <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15">
              <RoleIcon className="size-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.full_name || user.email}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.role || "user"} • {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {profile?.role === "admin" && (
              <Link
                to="/admin"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Shield className="size-4" />
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 font-semibold text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>

        <h2 className="mt-10 text-2xl font-bold">Quick Access</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { to: "/vision", icon: Eye, title: "Blind Mode", body: "AI-powered navigation assistance" },
            { to: "/captions", icon: Ear, title: "Deaf Mode", body: "Live captions and translation" },
            { to: "/read", icon: ScanText, title: "Instant Reader", body: "Read labels, menus, and signs" },
            { to: "/sos", icon: Siren, title: "Emergency SOS", body: "Share location with contacts" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="glass group rounded-3xl p-6 transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <item.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-1 text-muted-foreground">{item.body}</p>
            </Link>
          ))}
        </div>

        {profile?.role === "driver" && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">Driver Info</h2>
            <div className="glass mt-4 rounded-3xl p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-lg font-medium">{profile.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-medium">
                    <span className={`inline-flex items-center gap-2 ${profile.is_active ? "text-chart-3" : "text-destructive"}`}>
                      <span className="size-2 rounded-full bg-current" />
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="text-lg font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}