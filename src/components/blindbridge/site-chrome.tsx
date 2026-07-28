import { Link } from "@tanstack/react-router";
import { Menu, LogIn, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/vision", label: "Blind Mode" },
  { to: "/captions", label: "Deaf Mode" },
  { to: "/read", label: "Reader" },
  { to: "/sos", label: "Emergency" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          to="/"
          className="glass rounded-full px-5 py-2.5 text-sm font-bold tracking-[0.18em] uppercase focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          BlindBridge
        </Link>

        <nav aria-label="Main" className="glass hidden rounded-full px-2 py-1.5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className="glass glow hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline-flex"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="glass glow hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline-flex"
            >
              <LogIn className="size-4" aria-hidden="true" />
              Sign In
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="glass flex size-11 items-center justify-center rounded-full md:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open ? (
        <nav aria-label="Mobile" className="glass mx-auto mt-3 max-w-6xl rounded-3xl p-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-base font-medium text-primary hover:bg-secondary"
            >
              Sign In
            </Link>
          )}
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold tracking-[0.18em] text-foreground uppercase">BlindBridge AI</p>
        <p>Accessibility, reimagined with AI.</p>
        <p>AI assistance supports, but never replaces, a cane, guide dog, or human help.</p>
      </div>
    </footer>
  );
}