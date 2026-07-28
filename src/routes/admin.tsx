import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Car,
  User,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase, type UserProfile, type UserRole } from "@/lib/supabase";
import { SiteFooter, SiteHeader } from "@/components/blindbridge/site-chrome";

const TITLE = "Super Admin Panel — BlindBridge AI";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Manage users, drivers, and customers." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, profile, navigate]);

  const fetchUsers = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data as UserProfile[]);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (profile?.role === "admin") {
      void fetchUsers();
    }
  }, [profile]);

  useEffect(() => {
    let result = users;
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }
    setFilteredUsers(result);
  }, [users, roleFilter, search]);

  const toggleActive = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    await supabase
      .from("profiles")
      .update({ is_active: !currentStatus })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
    );
    setActionLoading(null);
  };

  const changeRole = async (userId: string, newRole: UserRole) => {
    setActionLoading(userId);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setActionLoading(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setActionLoading(userId);
    await supabase.from("profiles").delete().eq("id", userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setActionLoading(null);
  };

  if (loading || !profile) {
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

  const stats = {
    total: users.length,
    customers: users.filter((u) => u.role === "customer").length,
    drivers: users.filter((u) => u.role === "driver").length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.is_active).length,
  };

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pt-32 pb-16">
        <div className="flex items-center gap-3">
          <Shield className="size-8 text-accent" />
          <h1 className="text-3xl font-bold sm:text-4xl">Super Admin Panel</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Manage all users, drivers, and customers.</p>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Users", value: stats.total, icon: Users },
            { label: "Customers", value: stats.customers, icon: User },
            { label: "Drivers", value: stats.drivers, icon: Car },
            { label: "Admins", value: stats.admins, icon: Shield },
            { label: "Active", value: stats.active, icon: ToggleRight },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="size-4" />
                <span className="text-sm">{stat.label}</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass mt-8 flex flex-wrap items-center gap-4 rounded-3xl p-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="min-h-12 w-full rounded-2xl bg-secondary pl-12 pr-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            className="min-h-12 rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="driver">Drivers</option>
            <option value="admin">Admins</option>
          </select>
          <button
            onClick={() => void fetchUsers()}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-secondary px-5 font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <RefreshCw className={`size-4 ${fetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Users Table */}
        <div className="glass mt-6 overflow-hidden rounded-3xl">
          {fetching ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Phone</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Joined</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 last:border-0">
                      <td className="px-6 py-4">
                        <p className="font-medium">{u.full_name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => void changeRole(u.id, e.target.value as UserRole)}
                          disabled={u.id === user?.id || actionLoading === u.id}
                          className="rounded-xl bg-secondary px-3 py-1.5 text-sm capitalize disabled:opacity-50"
                        >
                          <option value="customer">Customer</option>
                          <option value="driver">Driver</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">{u.phone || "—"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm ${u.is_active ? "text-chart-3" : "text-destructive"}`}
                        >
                          <span className="size-2 rounded-full bg-current" />
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void toggleActive(u.id, u.is_active)}
                            disabled={u.id === user?.id || actionLoading === u.id}
                            title={u.is_active ? "Deactivate" : "Activate"}
                            className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50"
                          >
                            {u.is_active ? (
                              <ToggleRight className="size-4" />
                            ) : (
                              <ToggleLeft className="size-4" />
                            )}
                          </button>
                          <button
                            onClick={() => void deleteUser(u.id)}
                            disabled={u.id === user?.id || actionLoading === u.id}
                            title="Delete user"
                            className="inline-flex size-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 disabled:opacity-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}