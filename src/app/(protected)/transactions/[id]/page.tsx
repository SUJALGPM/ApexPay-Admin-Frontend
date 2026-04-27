import { adminApiFetchServer } from "../../../../lib/adminApiServer";
import { JsonBlock } from "../../../../components/JsonBlock";
import { RiskBadge } from "../../../../components/RiskBadge";

type TxnDetail = {
  transaction: Record<string, unknown>;
  latestRisk: Record<string, unknown> | null;
  riskHistory: Record<string, unknown>[];
  auditLogs: Record<string, unknown>[];
  sender: Record<string, unknown> | null;
  receiver: Record<string, unknown> | null;
};

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await adminApiFetchServer<TxnDetail>(`/transactions/${id}`, { method: "GET" });

  if (!res.ok) {
    return (
      <div style={{ maxWidth: 1200 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Transaction</h1>
        <div style={{ color: "#ff4d4d" }}>{res.error.message}</div>
      </div>
    );
  }

  const decision = (res.data.latestRisk?.decision as string | undefined) ?? null;

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Transaction</h1>
        <RiskBadge decision={decision} />
        <div style={{ fontSize: 12, opacity: 0.7 }}>{id}</div>
      </div>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Transaction Data</div>
        <JsonBlock value={res.data.transaction} />
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Latest Risk Score</div>
        <JsonBlock value={res.data.latestRisk} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Sender</div>
          <JsonBlock value={res.data.sender} />
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Receiver</div>
          <JsonBlock value={res.data.receiver} />
        </div>
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Risk Score History</div>
        <JsonBlock value={res.data.riskHistory} />
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Audit Logs</div>
        <JsonBlock value={res.data.auditLogs} />
      </section>
    </div>
  );
}
