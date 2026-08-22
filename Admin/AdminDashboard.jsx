import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // swap for wherever B's auth hook lives
import { TripsOverTimeChart, TopCitiesChart } from "./AdminStatsChart";

const COLORS = {
  border: "#E4E0D6",
  surfaceAlt: "#F3F1EB",
  textPrimary: "#1C1B18",
  textSecondary: "#5B594F",
  textMuted: "#8B8879",
  primaryTint: "#E1F1EC",
  primary: "#0E6E5C",
};

// ---- Mock data (Phase 12 seed-style) -------------------------------------
// Deprioritized per roadmap: no backend endpoint exists for this yet.
// Swap fetchAdminStats() below for a real `GET /admin/stats` call when
// (if) the backend adds one — shape is designed to drop in unchanged.
const MOCK_STATS = {
  kpis: {
    totalUsers: 482,
    totalTrips: 631,
    totalPublicTrips: 118,
    avgTripLengthDays: 6.4,
  },
  tripsOverTime: [
    { label: "Mar", trips: 40 },
    { label: "Apr", trips: 58 },
    { label: "May", trips: 71 },
    { label: "Jun", trips: 95 },
    { label: "Jul", trips: 133 },
    { label: "Aug", trips: 172 },
  ],
  topCities: [
    { city: "Lisbon", count: 61 },
    { city: "Rome", count: 54 },
    { city: "Barcelona", count: 49 },
    { city: "Tokyo", count: 44 },
    { city: "Porto", count: 33 },
    { city: "Paris", count: 30 },
  ],
  recentActivity: [
    { id: 1, user: "amara.k", action: "Created trip", detail: "Lisbon → Porto", when: "2h ago" },
    { id: 2, user: "j.delgado", action: "Published trip", detail: "Tokyo Solo Trip", when: "4h ago" },
    { id: 3, user: "priya.n", action: "Cloned trip", detail: "from Rome & Amalfi Coast", when: "6h ago" },
    { id: 4, user: "tom.b", action: "Signed up", detail: "—", when: "9h ago" },
    { id: 5, user: "s.laurent", action: "Created trip", detail: "Barcelona Weekend", when: "1d ago" },
  ],
};

function fetchAdminStats() {
  // Simulated network latency so the skeleton state is visible.
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_STATS), 500));
}

// ---- Shared bits -----------------------------------------------------------

function StatCard({ label, value, isLoading }) {
  return (
    <div
      className="rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <p className="text-[13px] leading-[18px]" style={{ color: COLORS.textMuted }}>
        {label}
      </p>
      {isLoading ? (
        <div
          className="mt-2 h-8 w-20 animate-pulse rounded"
          style={{ background: COLORS.surfaceAlt }}
          aria-hidden="true"
        />
      ) : (
        <p className="mt-1 text-[28px] font-medium leading-9" style={{ color: COLORS.textPrimary }}>
          {value}
        </p>
      )}
    </div>
  );
}

function RecentActivityTable({ rows, isLoading }) {
  return (
    <div
      className="rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <h3 className="mb-4 text-[19px] font-medium leading-7" style={{ color: COLORS.textPrimary }}>
        Recent activity
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["User", "Action", "Detail", "When"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2 text-[13px] font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td colSpan={4} className="px-3 py-3">
                      <div
                        className="h-4 w-full animate-pulse rounded"
                        style={{ background: COLORS.surfaceAlt }}
                      />
                    </td>
                  </tr>
                ))
              : rows.length === 0
              ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center" style={{ color: COLORS.textMuted }}>
                      No recent activity
                    </td>
                  </tr>
                )
              : rows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td className="whitespace-nowrap px-3 py-3" style={{ color: COLORS.textPrimary }}>
                      {row.user}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3" style={{ color: COLORS.textSecondary }}>
                      {row.action}
                    </td>
                    <td className="px-3 py-3" style={{ color: COLORS.textSecondary }}>
                      {row.detail}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3" style={{ color: COLORS.textMuted }}>
                      {row.when}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Page --------------------------------------------------------------

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAdminStats().then((data) => {
      if (!cancelled) {
        setStats(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // §4.14: "if a non-admin hits /admin, redirect to /dashboard silently —
  // don't expose that the route exists via an 'access denied' page."
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const kpis = stats?.kpis;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 md:px-12">
      <header className="mb-8">
        <h1 className="text-[32px] font-medium leading-10" style={{ color: COLORS.textPrimary }}>
          Admin Analytics
        </h1>
        <p className="mt-1 text-[15px] leading-[22px]" style={{ color: COLORS.textSecondary }}>
          Read-only platform overview — not visible to travelers.
        </p>
      </header>

      {/* KPI row — wraps 4 → 2 → 1 per §4.14 responsive spec */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={kpis?.totalUsers.toLocaleString()} isLoading={isLoading} />
        <StatCard label="Total trips" value={kpis?.totalTrips.toLocaleString()} isLoading={isLoading} />
        <StatCard
          label="Public trips"
          value={kpis?.totalPublicTrips.toLocaleString()}
          isLoading={isLoading}
        />
        <StatCard
          label="Avg. trip length"
          value={kpis ? `${kpis.avgTripLengthDays} days` : undefined}
          isLoading={isLoading}
        />
      </section>

      {/* Charts — stack vertically on mobile */}
      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TripsOverTimeChart data={stats?.tripsOverTime ?? []} isLoading={isLoading} />
        <TopCitiesChart data={stats?.topCities ?? []} isLoading={isLoading} />
      </section>

      <RecentActivityTable rows={stats?.recentActivity ?? []} isLoading={isLoading} />
    </div>
  );
}
