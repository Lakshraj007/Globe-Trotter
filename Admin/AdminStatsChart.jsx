import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * §6.10 — "Admin trend chart: line chart, primary stroke, subtle area fill
 * in primary-tint." Colors pulled straight from §6.2 so they never drift
 * from the rest of the app's chart language.
 */
const COLORS = {
  primary: "#0E6E5C",
  primaryTint: "#E1F1EC",
  accent: "#E8763C",
  border: "#E4E0D6",
  textSecondary: "#5B594F",
  textMuted: "#8B8879",
  surface: "#FFFFFF",
};

function ChartTooltip({ active, payload, label, valuePrefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm shadow-md"
      style={{
        background: COLORS.surface,
        borderColor: COLORS.border,
        color: "#1C1B18",
      }}
    >
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: COLORS.textSecondary }}>
          {valuePrefix}
          {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function ChartWrapper({ title, subtitle, isLoading, isEmpty, height = 260, children }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: COLORS.border }}>
      <div className="mb-4">
        <h3 className="text-[19px] font-medium leading-7" style={{ color: "#1C1B18" }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-[13px] leading-[18px]" style={{ color: COLORS.textMuted }}>
            {subtitle}
          </p>
        )}
      </div>

      {isLoading ? (
        <div
          className="animate-pulse rounded-lg"
          style={{ height, background: "#F3F1EB" }}
          aria-hidden="true"
        />
      ) : isEmpty ? (
        <div
          className="flex items-center justify-center rounded-lg text-[13px]"
          style={{ height, color: COLORS.textMuted, background: "#F3F1EB" }}
        >
          No data yet
        </div>
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  );
}

/**
 * Trips created over time.
 * data: [{ label: 'Jan', trips: 12 }, ...]
 */
export function TripsOverTimeChart({ data = [], isLoading = false }) {
  return (
    <ChartWrapper
      title="Trips created over time"
      subtitle="Platform-wide, all users"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="tripsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primaryTint} stopOpacity={0.9} />
              <stop offset="100%" stopColor={COLORS.primaryTint} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={COLORS.border} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: COLORS.textMuted }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: COLORS.textMuted }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: COLORS.border }} />
          <Line
            type="monotone"
            dataKey="trips"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            fill="url(#tripsAreaFill)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

/**
 * Top destination cities by number of times added to a trip.
 * data: [{ city: 'Lisbon', count: 34 }, ...] — pass pre-sorted, top N.
 */
export function TopCitiesChart({ data = [], isLoading = false }) {
  return (
    <ChartWrapper
      title="Top destination cities"
      subtitle="By number of trips added to"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.border} />
          <XAxis
            dataKey="city"
            tick={{ fontSize: 12, fill: COLORS.textMuted }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={48}
          />
          <YAxis
            tick={{ fontSize: 12, fill: COLORS.textMuted }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: COLORS.primaryTint }} />
          <Bar dataKey="count" fill={COLORS.accent} radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
