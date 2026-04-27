"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useEffect, useMemo, useState } from "react";

function useCountUp(value: number, durationMs = 720) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = value;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return v;
}

export function MetricKpiCard({
  label,
  value,
  sublabel,
  tone,
  format
}: {
  label: string;
  value: number;
  sublabel?: string;
  tone?: "primary" | "success" | "warning" | "danger";
  format?: "number" | "pct";
}) {
  const animated = useCountUp(value);
  const display =
    format === "pct"
      ? `${(animated * 100).toFixed(2)}%`
      : Math.round(animated).toLocaleString();

  const dot =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "danger"
          ? "var(--danger)"
          : "linear-gradient(90deg, var(--primaryA), var(--primaryB), var(--primaryC))";

  return (
    <div className="ap-card ap-cardHover ap-glowBorder">
      <div className="ap-cardInner">
        <div className="ap-metricLabel">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: dot,
              boxShadow: "0 0 0 3px rgba(99,102,241,0.12)"
            }}
          />
          <span>{label}</span>
        </div>
        <div className="ap-metricValue">{display}</div>
        {sublabel ? <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>{sublabel}</div> : null}
      </div>
    </div>
  );
}

function GlassTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="ap-card"
      style={{
        padding: 10,
        borderRadius: 14,
        borderColor: "rgba(255,255,255,0.16)",
        background: "rgba(15,23,42,0.55)"
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "grid", gap: 6 }}>
        {payload.map((p, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: p.color ?? "rgba(255,255,255,0.45)"
                }}
              />
              <span>{p.name ?? "-"}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 760 }}>{String(p.value ?? "-")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionsLineChart({
  data
}: {
  data: Array<{ day: string; total: number; highRisk: number }>;
}) {
  const [range, setRange] = useState<"day" | "week" | "month">("day");

  const computed = useMemo(() => {
    if (range === "day") return data;
    const bucket = new Map<string, { day: string; total: number; highRisk: number }>();
    for (const row of data) {
      const dt = new Date(row.day);
      if (Number.isNaN(dt.getTime())) continue;
      let key = "";
      if (range === "week") {
        const d = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
        const dayOfWeek = (d.getUTCDay() + 6) % 7;
        d.setUTCDate(d.getUTCDate() - dayOfWeek);
        key = d.toISOString().slice(0, 10);
      } else {
        key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
      }
      const prev = bucket.get(key) ?? { day: key, total: 0, highRisk: 0 };
      prev.total += row.total;
      prev.highRisk += row.highRisk;
      bucket.set(key, prev);
    }
    return Array.from(bucket.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [data, range]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["day", "week", "month"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`ap-button ${range === k ? "ap-buttonPrimary" : ""}`}
              style={{ padding: "8px 10px", borderRadius: 12 }}
              onClick={() => setRange(k)}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="ap-pill">Animated</span>
      </div>
      <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={computed} margin={{ left: 6, right: 6, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="apTotalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99,102,241,0.40)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.02)" />
            </linearGradient>
            <linearGradient id="apRiskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(236,72,153,0.30)" />
              <stop offset="100%" stopColor="rgba(236,72,153,0.02)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
          <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<GlassTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="total"
            stroke="rgba(99,102,241,1)"
            strokeWidth={2.4}
            fill="url(#apTotalFill)"
            dot={{ r: 2.8, strokeWidth: 0, fill: "rgba(34,211,238,0.95)" }}
            isAnimationActive
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="highRisk"
            stroke="rgba(236,72,153,1)"
            strokeWidth={2.2}
            fill="url(#apRiskFill)"
            dot={{ r: 2.6, strokeWidth: 0, fill: "rgba(236,72,153,0.95)" }}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
}

export function BreakdownBarChart({
  data,
  xKey,
  yKey
}: {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}) {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="apBarFill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(34,211,238,0.85)" />
              <stop offset="50%" stopColor="rgba(99,102,241,0.85)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.85)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
          <XAxis dataKey={xKey} tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<GlassTooltip />} />
          <Legend />
          <Bar dataKey={yKey} fill="url(#apBarFill)" radius={[10, 10, 10, 10]} isAnimationActive animationDuration={760} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  labelKey,
  valueKey
}: {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
}) {
  const total = useMemo(() => {
    return data.reduce((acc, row) => acc + Number(row[valueKey] ?? 0), 0);
  }, [data, valueKey]);

  const colors = ["rgba(99,102,241,0.95)", "rgba(34,211,238,0.95)", "rgba(139,92,246,0.95)", "rgba(236,72,153,0.92)"];

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<GlassTooltip />} />
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={labelKey}
            innerRadius={70}
            outerRadius={104}
            paddingAngle={3}
            cornerRadius={10}
            isAnimationActive
            animationDuration={900}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Legend />
          <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.92)" fontSize="18" fontWeight="900">
            {total}
          </text>
          <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.62)" fontSize="12">
            Total
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
