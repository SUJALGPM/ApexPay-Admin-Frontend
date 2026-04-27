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
      <div className="ap-container" style={{ maxWidth: 1200 }}>
        <div className="ap-title ap-titleGradient">Transaction</div>
        <div className="ap-subtitle">Unable to load transaction detail.</div>
        <div className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
          <div className="ap-cardInner ap-alert ap-alertError">{res.error.message}</div>
        </div>
      </div>
    );
  }

  const decision = (res.data.latestRisk?.decision as string | undefined) ?? null;

  return (
    <div className="ap-container" style={{ maxWidth: 1320 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="ap-title ap-titleGradient">Transaction</div>
          <div className="ap-subtitle">{id}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RiskBadge decision={decision} />
          <span className="ap-pill">Detail</span>
        </div>
      </div>

      <div className="ap-grid" style={{ marginTop: 14 }}>
        <section className="ap-card ap-glowBorder">
          <div className="ap-cardInner">
            <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Transaction Data</div>
            <JsonBlock value={res.data.transaction} />
          </div>
        </section>

        <section className="ap-card ap-glowBorder">
          <div className="ap-cardInner">
            <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Latest Risk Score</div>
            <JsonBlock value={res.data.latestRisk} />
          </div>
        </section>

        <section className="ap-twoCol">
          <div className="ap-card ap-glowBorder">
            <div className="ap-cardInner">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Sender</div>
              <JsonBlock value={res.data.sender} />
            </div>
          </div>
          <div className="ap-card ap-glowBorder">
            <div className="ap-cardInner">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Receiver</div>
              <JsonBlock value={res.data.receiver} />
            </div>
          </div>
        </section>

        <section className="ap-card ap-glowBorder">
          <div className="ap-cardInner">
            <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Risk Score History</div>
            {res.data.riskHistory.length === 0 ? (
              <div className="ap-alert" style={{ color: "var(--muted)", marginTop: 10 }}>
                No risk history found.
              </div>
            ) : (
              <JsonBlock value={res.data.riskHistory} />
            )}
          </div>
        </section>

        <section className="ap-card ap-glowBorder">
          <div className="ap-cardInner">
            <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Audit Logs</div>
            {res.data.auditLogs.length === 0 ? (
              <div className="ap-alert" style={{ color: "var(--muted)", marginTop: 10 }}>
                No audit logs for this transaction.
              </div>
            ) : (
              <JsonBlock value={res.data.auditLogs} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
