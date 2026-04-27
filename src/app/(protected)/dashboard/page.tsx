import { adminApiFetchServer } from "../../../lib/adminApiServer";
import { getMe } from "../../../lib/auth";
import { BreakdownBarChart, DonutChart, MetricKpiCard, TransactionsLineChart } from "../../../components/Charts";

type DashboardResponse = {
  kpis: {
    totalTransactions: number;
    statusBreakdown: Record<string, number>;
    fraudRate: number;
    holdRate: number;
    recoveryCount: number;
  };
  daily: Array<{ day: string; total: number; highRisk: number }>;
  riskDistribution: Array<{ decision: string; count: number }>;
  fraudTypes: Array<{ fraud_type: string; count: number }>;
  range: { from: string; to: string };
};

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getMe();
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const res = await adminApiFetchServer<DashboardResponse>(`/analytics/dashboard?${qs.toString()}`, { method: "GET" });

  if (!admin) return null;

  if (!res.ok) {
    return (
      <div className="ap-container" style={{ maxWidth: 1200 }}>
        <div className="ap-title ap-titleGradient">Dashboard</div>
        <div className="ap-subtitle">Overview of transactions, fraud signals, and system risk.</div>
        <div className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
          <div className="ap-cardInner" style={{ color: "var(--danger)", fontWeight: 760 }}>
            {res.error.code === "FORBIDDEN" ? "Forbidden for your role." : res.error.message}
          </div>
        </div>
      </div>
    );
  }

  const { kpis } = res.data;
  const statusRows = Object.entries(kpis.statusBreakdown).map(([status, count]) => ({ status, count }));

  return (
    <div className="ap-container" style={{ maxWidth: 1320 }}>
      <div className="ap-title ap-titleGradient">Dashboard</div>
      <div className="ap-subtitle">
        Range: {new Date(res.data.range.from).toLocaleDateString()} → {new Date(res.data.range.to).toLocaleDateString()}
      </div>

      <div className="ap-metrics" style={{ marginTop: 14 }}>
        <div className="ap-metricCol">
          <MetricKpiCard label="Total Transactions" value={kpis.totalTransactions} tone="primary" />
        </div>
        <div className="ap-metricCol">
          <MetricKpiCard
            label="Fraud Rate"
            sublabel="HIGH_RISK / total"
            value={kpis.fraudRate}
            tone="danger"
            format="pct"
          />
        </div>
        <div className="ap-metricCol">
          <MetricKpiCard label="Hold Rate" value={kpis.holdRate} tone="warning" format="pct" />
        </div>
        <div className="ap-metricCol">
          <MetricKpiCard label="Recovery Count" value={kpis.recoveryCount} tone="success" />
        </div>
      </div>

      <div className="ap-grid" style={{ marginTop: 14 }}>
        <section className="ap-card ap-glowBorder">
          <div className="ap-cardInner ap-clip">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Transactions per day</div>
              <span className="ap-pill">Smooth curves • gradient fill</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <TransactionsLineChart data={res.data.daily} />
            </div>
          </div>
        </section>

        <section className="ap-twoCol">
          <div className="ap-card ap-glowBorder">
            <div className="ap-cardInner ap-clip">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>Status Breakdown</div>
              <BreakdownBarChart data={statusRows} xKey="status" yKey="count" />
            </div>
          </div>
          <div className="ap-card ap-glowBorder">
            <div className="ap-cardInner ap-clip">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>Risk Distribution</div>
              <DonutChart data={res.data.riskDistribution} labelKey="decision" valueKey="count" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
