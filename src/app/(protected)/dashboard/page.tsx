import { adminApiFetchServer } from "../../../lib/adminApiServer";
import { getMe } from "../../../lib/auth";
import { TransactionsLineChart, BreakdownBarChart } from "../../../components/Charts";

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

function formatPct(v: number) {
  return `${(v * 100).toFixed(2)}%`;
}

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
      <div style={{ maxWidth: 1000 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Dashboard</h1>
        <div style={{ color: "#ff4d4d" }}>
          {res.error.code === "FORBIDDEN" ? "Forbidden for your role." : res.error.message}
        </div>
      </div>
    );
  }

  const { kpis } = res.data;
  const statusRows = Object.entries(kpis.statusBreakdown).map(([status, count]) => ({ status, count }));

  return (
    <div style={{ maxWidth: 1200 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Total Transactions</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{kpis.totalTransactions}</div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Fraud Rate (HIGH / total)</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{formatPct(kpis.fraudRate)}</div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>HOLD Rate</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{formatPct(kpis.holdRate)}</div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Recovery Count</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{kpis.recoveryCount}</div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Range</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>
            {new Date(res.data.range.from).toLocaleDateString()} → {new Date(res.data.range.to).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Transactions per day</div>
          <TransactionsLineChart data={res.data.daily} />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Status Breakdown</div>
            <BreakdownBarChart data={statusRows} xKey="status" yKey="count" />
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Risk Decision Distribution</div>
            <BreakdownBarChart data={res.data.riskDistribution} xKey="decision" yKey="count" />
          </div>
        </section>
      </div>
    </div>
  );
}
